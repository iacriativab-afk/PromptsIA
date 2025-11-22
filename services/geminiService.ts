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

// Retrieves API Key from Admin Settings (LocalStorage) or Environment
// COM VALIDAÇÃO E SANITIZAÇÃO
const getApiKey = (): string | null => {
    // 1. Priority: Admin Key set in UserProfile
    try {
        const storedKey = localStorage.getItem('PROMPTSIA_API_KEY');
        // Validar formato básico (não deve estar vazio, deve ser string)
        if (storedKey && typeof storedKey === 'string' && storedKey.length > 10) {
            return storedKey.trim();
        }
    } catch (e) { 
        console.warn('Erro ao acessar localStorage para API_KEY');
    }

    // 2. Fallback: import.meta.env (Vite - recomendado)
    try {
        const viteKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
        if (viteKey && typeof viteKey === 'string' && viteKey.length > 10) {
            return viteKey.trim();
        }
    } catch (e) { 
        console.warn('Erro ao acessar import.meta.env para API_KEY');
    }

    // 3. Última tentativa: process.env (Node - menos provável em browser)
    try {
        if (typeof process !== 'undefined' && process.env) {
            const processKey = process.env.VITE_API_KEY || process.env.API_KEY;
            if (processKey && typeof processKey === 'string' && processKey.length > 10) {
                return processKey.trim();
            }
        }
    } catch (e) { 
        // Ignorar erros
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
  const isVideo = agent.type === 'video';
  if (!apiKey && !isVideo) {
      return { 
          type: 'error', 
          data: '⚠️ Configuração de SaaS Necessária: Nenhuma chave de API encontrada. Vá em "Meu Perfil" > "Configurações do SaaS" e insira sua Google API Key para ativar a plataforma.' 
      };
  }

  // Initialize AI with the retrieved key
  const client = new GoogleGenerativeAI(apiKey || '');

  try {
    // Determine model: Use specific agent model if defined, else default based on type
    let modelName = agent.model || 'gemini-2.0-flash';

    // TEXT / REASONING AGENTS
    if (agent.type === 'text') {
        setLoadingMessage(agent.thinkingBudget ? 'Pensando profundamente...' : 'Gerando resposta...');
        
        const model = client.getGenerativeModel({
            model: modelName,
            systemInstruction: agent.systemInstruction,
        });

        const generationConfig: any = {
            temperature: agent.thinkingBudget ? undefined : 0.7,
            maxOutputTokens: 4096,
        };

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: userInput }] }],
            generationConfig,
        });

        const responseText = result.response.text();
        return { type: 'text', data: responseText || "Sem resposta do modelo." };
    }

    // IMAGE GENERATION
    if (agent.type === 'image') {
        setLoadingMessage('Criando arte visual...');
        return { 
            type: 'error', 
            data: 'Geração de imagens requer configuração adicional. Use a API ImageGen separadamente.' 
        };
    }

    // AUDIO GENERATION
    if (agent.type === 'audio') {
        setLoadingMessage('Sintetizando voz...');
        const model = client.getGenerativeModel({
            model: modelName,
        });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: userInput }] }],
        });

        const responseText = result.response.text();
        return { type: 'audio', data: responseText };
    }

    // VIDEO GENERATION
    if (agent.type === 'video') {
        return { 
            type: 'error', 
            data: 'Geração de vídeos requer integração especial com Veo.' 
        };
    }

    throw new Error(`Tipo de agente não suportado: ${agent.type}`);

  } catch (error: any) {
    console.error(`Erro ao chamar a API Gemini para o agente ${agent.id}:`, error);
    return { 
        type: 'error', 
        data: `Ocorreu um erro no processamento: ${error.message}. Verifique se a API Key está correta e ativa.`
    };
  }
};