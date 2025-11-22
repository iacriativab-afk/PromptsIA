import { GoogleGenerativeAI } from "@google/generative-ai";
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

// Main generation function
export const runAgentGeneration = async (
    agent: Agent, 
    userInput: string,
    setLoadingMessage: (message: string) => void,
    additionalParams: { aspectRatio?: string } = {},
    onUsageIncrement?: (type: 'text' | 'image' | 'video' | 'audio' | 'thinking', amount: number) => Promise<void>
): Promise<{ type: string; data: string }> => {
  
  // Handle Veo API Key Selection
  if (agent.type === 'video') {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          if (!hasKey) {
               await (window as any).aistudio.openSelectKey();
               // Proceed immediately as per guidelines (race condition handling)
          }
      }
  }

  // Initialize AI with process.env.API_KEY as mandated
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Determine model: Use specific agent model if defined, else default based on type
    let modelName = agent.model;
    if (!modelName) {
        // Fallbacks if model not specified in Agent constant
        if (agent.type === 'image') modelName = 'gemini-2.5-flash-image';
        else if (agent.type === 'video') modelName = 'veo-3.1-fast-generate-preview';
        else if (agent.type === 'audio') modelName = 'gemini-2.5-flash-preview-tts';
        else modelName = 'gemini-2.5-flash';
    }

    // TEXT / REASONING AGENTS
    if (agent.type === 'text') {
        setLoadingMessage(agent.thinkingBudget ? 'Pensando profundamente...' : 'Gerando resposta...');
        
        const config: any = {
            systemInstruction: agent.systemInstruction,
            temperature: agent.thinkingBudget ? undefined : 0.7,
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
        
        // Track usage
        if (onUsageIncrement) {
          const tokenCount = textResponse.usageMetadata?.totalTokenCount || 0;
          await onUsageIncrement('text', 1);
          if (agent.thinkingBudget && textResponse.usageMetadata?.cachedContentTokenCount) {
            await onUsageIncrement('thinking', textResponse.usageMetadata.cachedContentTokenCount);
          }
        }

        return { type: 'text', data: textResponse.text || "Sem resposta do modelo." };
    }

    // IMAGE GENERATION
    if (agent.type === 'image') {
        setLoadingMessage('Criando arte visual...');
        const ratio = additionalParams.aspectRatio || '1:1';
        
        if (modelName.includes('imagen')) {
            // Imagen Model (e.g. imagen-4.0-generate-001)
            const imageResponse = await ai.models.generateImages({
                model: modelName,
                prompt: userInput,
                config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/jpeg',
                  aspectRatio: ratio,
                },
            });
            
            // Track usage
            if (onUsageIncrement) {
              await onUsageIncrement('image', 1);
            }

            const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
            return { type: 'image', data: `data:image/jpeg;base64,${base64ImageBytes}` };
        } else {
            // Gemini Image Model (e.g. gemini-2.5-flash-image)
            const imageResponse = await ai.models.generateContent({
                model: modelName,
                contents: {
                    parts: [
                        { text: userInput } // Text prompt only for simple generation
                    ]
                },
                config: {
                    imageConfig: {
                        aspectRatio: ratio
                    }
                }
            });
            
            // Track usage
            if (onUsageIncrement) {
              await onUsageIncrement('image', 1);
            }
            
            for (const part of imageResponse.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64EncodeString: string = part.inlineData.data;
                    return { type: 'image', data: `data:image/png;base64,${base64EncodeString}` };
                }
            }
            throw new Error("Nenhuma imagem encontrada na resposta.");
        }
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
        
        // Track usage
        if (onUsageIncrement) {
          await onUsageIncrement('audio', 1);
        }

        const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("A resposta de áudio estava vazia.");
        const wavUri = createWavDataUri(base64Audio);
        return { type: 'audio', data: wavUri };
    }

    // VIDEO GENERATION
    if (agent.type === 'video') {
        setLoadingMessage('Verificando permissões do Veo...');
        // Key selection is handled at the start of function

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
        // use process.env.API_KEY as explicitly required
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) throw new Error("Falha ao fazer download do vídeo.");

        // Track usage
        if (onUsageIncrement) {
          await onUsageIncrement('video', 1);
        }

        const videoBlob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        return { type: 'video', data: videoUrl };
    }

    throw new Error(`Tipo de agente não suportado: ${agent.type}`);

  } catch (error: any) {
    console.error(`Erro ao chamar a API Gemini para o agente ${agent.id}:`, error);
    // Reset key selection on specific error for Veo
    if (agent.type === 'video' && error.message?.includes('Requested entity was not found')) {
        if (typeof window !== 'undefined' && (window as any).aistudio) {
             await (window as any).aistudio.openSelectKey();
        }
        return { type: 'error', data: `Erro de Autenticação: A chave de API selecionada pode ser inválida. Selecione novamente.`};
    }
    return { type: 'error', data: `Ocorreu um erro no processamento: ${error.message}.`};
  }
};
