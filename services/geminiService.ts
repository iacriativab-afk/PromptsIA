
import { GoogleGenAI, Modality } from "@google/genai";
import type { Agent } from '../types';

// Helper to encode Uint8Array to Base64
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to decode Base64 to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}


// Helper function to create a WAV file data URI from raw PCM data
function createWavDataUri(base64Pcm: string, sampleRate = 24000): string {
    const pcmData = decode(base64Pcm);
    const n = pcmData.length;
    const buffer = new ArrayBuffer(44 + n);
    const view = new DataView(buffer);
    const channels = 1;
    const bitDepth = 16;
    
    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + n, true);
    writeString(view, 8, 'WAVE');
    
    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // Audio format 1=PCM
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * (bitDepth / 8), true); // Byte rate
    view.setUint16(32, channels * (bitDepth / 8), true); // Block align
    view.setUint16(34, bitDepth, true);
    
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, n, true);
    
    // Write PCM data
    for (let i = 0; i < n; i++) {
        view.setUint8(44 + i, pcmData[i]);
    }
    
    function writeString(view: DataView, offset: number, string: string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
}

// Retrieves API Key from Admin Settings (LocalStorage) or Environment
const getApiKey = () => {
    // 1. Priority: Admin Key set in UserProfile
    const storedKey = localStorage.getItem('PROMPTSIA_API_KEY');
    if (storedKey) return storedKey;

    // 2. Fallback: Environment Variable (if configured in Vite/Build)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        return process.env.API_KEY;
    }

    return null;
};

// Main generation function
export const runAgentGeneration = async (
    agent: Agent, 
    userInput: string,
    setLoadingMessage: (message: string) => void,
    additionalParams: { aspectRatio?: string } = {}
): Promise<{ type: string; data: string }> => {
  
  const apiKey = getApiKey();

  // Exception: If no key is set, but user is trying Veo, we might use the popup flow (managed by window.aistudio)
  // However, for other agents, we MUST have a key.
  if (!apiKey && agent.type !== 'video') {
      return { 
          type: 'error', 
          data: '⚠️ Configuração de SaaS Necessária: Nenhuma chave de API encontrada. Vá em "Meu Perfil" > "Configurações do SaaS" e insira sua Google API Key para ativar a plataforma.' 
      };
  }

  // Initialize AI with the retrieved key (or empty if relying on Veo popups only)
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });

  try {
    // Determine model: Use specific agent model if defined, else default based on type
    let modelName = agent.model;
    if (!modelName) {
        // Fallbacks if model not specified in Agent constant
        if (agent.type === 'image') modelName = 'imagen-4.0-generate-001';
        else if (agent.type === 'video') modelName = 'veo-3.1-fast-generate-preview';
        else if (agent.type === 'audio') modelName = 'gemini-2.5-flash-preview-tts';
        else modelName = 'gemini-2.5-flash';
    }

    // TEXT / REASONING AGENTS
    if (agent.type === 'text') {
        setLoadingMessage(agent.thinkingBudget ? 'Pensando profundamente...' : 'Gerando resposta...');
        
        const config: any = {
            systemInstruction: agent.systemInstruction,
            temperature: agent.thinkingBudget ? undefined : 0.7, // Temperature usually ignored or lower with thinking
        };

        // Add thinking config if the agent requires it (e.g. Deep Reasoner)
        if (agent.thinkingBudget) {
            config.thinkingConfig = { thinkingBudget: agent.thinkingBudget };
        }

        const textResponse = await ai.models.generateContent({
          model: modelName,
          contents: userInput,
          config: config
        });
        
        return { type: 'text', data: textResponse.text || "Sem resposta do modelo." };
    }

    // IMAGE GENERATION
    if (agent.type === 'image') {
        setLoadingMessage('Criando arte visual com Imagen 4.0...');
        const ratio = additionalParams.aspectRatio || '1:1';
        const imageResponse = await ai.models.generateImages({
            model: modelName,
            prompt: userInput,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: ratio,
            },
        });
        const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
        return { type: 'image', data: `data:image/jpeg;base64,${base64ImageBytes}` };
    }

    // AUDIO GENERATION
    if (agent.type === 'audio') {
        setLoadingMessage('Sintetizando voz...');
        const audioResponse = await ai.models.generateContent({
            model: modelName,
            contents: [{ parts: [{ text: userInput }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // Could make this configurable later
                    },
                },
            },
        });
        const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("A resposta de áudio estava vazia.");
        const wavUri = createWavDataUri(base64Audio);
        return { type: 'audio', data: wavUri };
    }

    // VIDEO GENERATION
    if (agent.type === 'video') {
        setLoadingMessage('Verificando chave de API...');
        
        // For Veo, we prefer the specific key selection flow if available/required
        // But if Admin Key is present, we can try to use it directly via SDK
        if (!apiKey && !(await window.aistudio.hasSelectedApiKey())) {
             await window.aistudio.openSelectKey();
        }
        
        setLoadingMessage('Renderizando vídeo com Veo (isso pode levar 1-2 minutos)...');
        
        let operation = await ai.models.generateVideos({
            model: modelName,
            prompt: userInput,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        let pollCount = 0;
        while (!operation.done) {
            pollCount++;
            setLoadingMessage(`Renderizando... (${pollCount}0s)`);
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10s
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        setLoadingMessage('Finalizando download...');
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error("URI de download do vídeo não encontrado.");
        
        // The response.body contains the MP4 bytes. Append API key.
        // Use the key we have: either local admin key or process env
        const keyToUse = apiKey || process.env.API_KEY; 
        const videoResponse = await fetch(`${downloadLink}&key=${keyToUse}`);
        if (!videoResponse.ok) throw new Error("Falha ao fazer download do vídeo.");

        const videoBlob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        return { type: 'video', data: videoUrl };
    }

    throw new Error(`Tipo de agente não suportado: ${agent.type}`);

  } catch (error: any) {
    console.error(`Erro ao chamar a API Gemini para o agente ${agent.id}:`, error);
    // Reset key selection on specific error for Veo
    if (agent.type === 'video' && error.message?.includes('Requested entity was not found')) {
      return { type: 'error', data: `Erro de Autenticação: A chave de API selecionada pode ser inválida para o modelo Veo. Tente novamente selecionando uma nova chave.`};
    }
    return { type: 'error', data: `Ocorreu um erro no processamento: ${error.message}. (Verifique se a API Key no Perfil > Admin está correta)`};
  }
};
