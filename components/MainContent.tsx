
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Agent } from '../types';
import { runAgentGeneration } from '../services/geminiService';
import Loader from './Loader';
import { ClipboardIcon, TrashIcon, SparklesIcon, ArrowPathIcon, ArrowDownTrayIcon, ArrowLeftIcon, PlayIcon } from './Icons';

declare global {
  interface Window {
    mermaid: any;
  }
}

interface MainContentProps {
    agent: Agent;
    onBack: () => void;
}

interface ViralClip {
  title: string;
  duration: string;
  viralScore: number;
  summary: string;
  hashtags: string[];
}

const MainContent: React.FC<MainContentProps> = ({ agent, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [outputData, setOutputData] = useState<{ type: string; data: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const outputRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setError(null);
    setAspectRatio('1:1'); // Reset aspect ratio when agent changes
    textareaRef.current?.focus();
  }, [agent]);

  // Trigger Mermaid Rendering when output changes
  useEffect(() => {
    if (outputData?.type === 'text' && window.mermaid) {
        setTimeout(() => {
             try {
                // Ensure we only look for valid mermaid divs that haven't been processed
                const nodes = document.querySelectorAll('.mermaid');
                if (nodes.length > 0) {
                    window.mermaid.init(undefined, nodes);
                }
             } catch (e) {
                 console.warn("Mermaid rendering warning", e);
             }
        }, 300);
    }
  }, [outputData]);


  const handleGenerate = useCallback(async () => {
    if (!agent || !inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setOutputData(null);
    setLoadingMessage('Iniciando...');

    try {
      const result = await runAgentGeneration(agent, inputText, setLoadingMessage, { aspectRatio });
      if (result.type === 'error') {
          setError(result.data);
      } else {
          setOutputData(result);
      }
    } catch (e: any) {
      setError(e.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      if (window.innerWidth < 768 && outputRef.current) {
        setTimeout(() => {
            outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [agent, inputText, aspectRatio]);

  const handleCopyToClipboard = () => {
    if (!outputData || outputData.type !== 'text') return;
    navigator.clipboard.writeText(outputData.data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleClear = () => {
    setInputText('');
    setOutputData(null);
    setError(null);
    textareaRef.current?.focus();
  };

  const formatTextOutput = (text: string) => {
    // Advanced splitter to separate Mermaid code blocks and regular text
    const parts = text.split(/(```mermaid[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
        if (part.startsWith('```mermaid')) {
            // Extract just the code inside
            const code = part.replace('```mermaid', '').replace('```', '').trim();
            return <div key={index} className="mermaid">{code}</div>;
        }
        
        // Better Text Rendering: Process bolding and paragraphs
        // This replaces the old <pre> tag usage for a more professional look
        const paragraphs = part.split('\n\n').filter(p => p.trim());
        
        return (
            <div key={index} className="prose prose-invert max-w-none text-brand-text-primary">
                {paragraphs.map((para, pIdx) => {
                    // Simple bold parser for **text**
                    const formattedPara = para.split(/(\*\*.*?\*\*)/g).map((chunk, cIdx) => {
                        if (chunk.startsWith('**') && chunk.endsWith('**')) {
                            return <strong key={cIdx} className="text-white font-bold">{chunk.slice(2, -2)}</strong>;
                        }
                        return chunk;
                    });
                    
                    // Headers detection
                    if (para.startsWith('###')) return <h3 key={pIdx} className="text-xl font-bold text-white mt-6 mb-2">{formattedPara}</h3>;
                    if (para.startsWith('##')) return <h2 key={pIdx} className="text-2xl font-bold text-white mt-8 mb-3 border-b border-white/10 pb-2">{formattedPara}</h2>;
                    if (para.startsWith('#')) return <h1 key={pIdx} className="text-3xl font-bold text-white mt-8 mb-4">{formattedPara}</h1>;

                    // Bullet points detection
                    if (para.trim().startsWith('- ')) {
                        const lines = para.split('\n');
                        return (
                            <ul key={pIdx} className="list-disc list-outside pl-5 my-4 space-y-1 text-brand-text-secondary">
                                {lines.map((line, lIdx) => (
                                    <li key={lIdx}>{line.replace('- ', '')}</li>
                                ))}
                            </ul>
                        );
                    }

                    return <p key={pIdx} className="mb-4 leading-relaxed text-brand-text-primary/90">{formattedPara}</p>;
                })}
            </div>
        );
    });
  };

  const renderOutput = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
          <Loader />
          <p className="mt-4 text-sm text-brand-accent animate-pulse font-medium font-mono">{loadingMessage}</p>
          {agent.thinkingBudget && (
            <p className="text-xs text-brand-text-secondary mt-2 opacity-70 font-mono">Raciocínio profundo ativado (32k tokens)</p>
          )}
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="text-red-400 bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-lg text-center backdrop-blur-sm">
            <h3 className="text-lg font-bold mb-2">Falha na Geração</h3>
            <p className="text-sm opacity-90 leading-relaxed">{error}</p>
            </div>
        </div>
      );
    }
    if (outputData) {
        // SPECIAL CASE: VIRAL CLIPPER (Simulates OpusClip UI)
        if (agent.id === 'viral-clipper' && outputData.type === 'text') {
            try {
                // Strip markdown code blocks if present
                const cleanJson = outputData.data.replace(/```json/g, '').replace(/```/g, '').trim();
                let clips: ViralClip[] = [];
                try {
                     clips = JSON.parse(cleanJson);
                } catch(e) {
                    // Sometimes models return text before the JSON, try to find the array
                    const arrayMatch = cleanJson.match(/\[.*\]/s);
                    if (arrayMatch) {
                        clips = JSON.parse(arrayMatch[0]);
                    } else {
                        throw e;
                    }
                }

                if (!Array.isArray(clips)) throw new Error("Formato inválido");

                return (
                    <div className="grid grid-cols-1 gap-6">
                        {clips.map((clip, idx) => (
                            <div key={idx} className="bg-brand-surface border border-white/10 rounded-2xl overflow-hidden hover:border-brand-accent/50 transition-colors group">
                                <div className="flex flex-col md:flex-row">
                                    {/* Mock Video Player Area */}
                                    <div className="w-full md:w-48 bg-black relative flex items-center justify-center aspect-[9/16] md:aspect-auto min-h-[200px]">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                        <PlayIcon className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
                                        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                                            {clip.duration}
                                        </div>
                                    </div>

                                    {/* Info Area */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${clip.viralScore >= 90 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                                                Viral Score: {clip.viralScore}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{clip.title}</h3>
                                        <p className="text-brand-text-secondary text-sm mb-4 flex-1">{clip.summary}</p>
                                        
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {clip.hashtags?.map((tag, tIdx) => (
                                                <span key={tIdx} className="text-[10px] text-brand-accent bg-brand-accent/10 px-2 py-1 rounded">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex gap-3 mt-auto">
                                            <button className="flex-1 bg-brand-accent hover:bg-brand-accent-hover text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                                <ArrowDownTrayIcon className="h-4 w-4" /> Download HD
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            } catch (e) {
                console.warn("Falha ao parsear JSON do Viral Clipper, exibindo texto padrão.", e);
                // Fallback to standard text if JSON fails
            }
        }


        switch (outputData.type) {
            case 'text':
                return (
                    <div className="space-y-4">
                         {formatTextOutput(outputData.data)}
                    </div>
                );
            case 'image':
                return (
                    <div className="h-full flex flex-col items-center justify-center p-4">
                        <img src={outputData.data} alt="Generated content" className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl border border-white/10"/>
                        <p className="mt-4 text-xs text-brand-text-secondary font-mono">Gerado com Imagen 4.0 • {aspectRatio}</p>
                    </div>
                );
            case 'audio':
                return (
                    <div className="flex flex-col items-center justify-center h-full p-10">
                        <div className="relative w-32 h-32 mb-8">
                             <div className="absolute inset-0 bg-brand-accent rounded-full opacity-20 animate-ping"></div>
                             <div className="absolute inset-0 flex items-center justify-center bg-brand-surface border border-brand-accent/50 rounded-full">
                                <SparklesIcon className="h-12 w-12 text-brand-accent" />
                             </div>
                        </div>
                        <audio controls src={outputData.data} className="w-full max-w-md accent-brand-accent">Seu navegador não suporta o elemento de áudio.</audio>
                    </div>
                );
            case 'video':
                return (
                    <div className="h-full flex flex-col items-center justify-center p-4">
                        <video controls src={outputData.data} className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl border border-white/10" autoPlay loop>Seu navegador não suporta o elemento de vídeo.</video>
                        <p className="mt-4 text-xs text-brand-text-secondary font-mono">Gerado com Veo 3.1</p>
                    </div>
                );
            default:
                return <p>Tipo de conteúdo não suportado.</p>;
        }
    }
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-brand-text-secondary/40 p-8 select-none">
            <agent.icon className="h-24 w-24 mb-6 stroke-[0.5] opacity-50"/>
            <p className="font-medium text-xl">O resultado aparecerá aqui</p>
            <p className="text-sm mt-2 font-mono opacity-70">Aguardando instruções :: {agent.model || 'Standard Model'}</p>
        </div>
    );
  };
  
  const canCopy = outputData && outputData.type === 'text';
  const canDownload = outputData && ['image', 'audio', 'video'].includes(outputData.type);

  return (
    <div className="flex flex-col h-full max-h-screen bg-[#05050a]">
        {/* Header */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 bg-brand-surface/50 backdrop-blur-xl z-10">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors group text-brand-text-secondary hover:text-white">
                    <ArrowLeftIcon className="h-5 w-5"/>
                </button>
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${agent.coverGradient} shadow-lg`}>
                        <agent.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-none">{agent.name}</h2>
                        <p className="text-[10px] text-brand-text-secondary mt-0.5 font-mono uppercase tracking-wider">
                            {agent.model || 'Standard Model'} 
                            {agent.thinkingBudget ? ' • Deep Thinking' : ''}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-white/5 overflow-hidden">
            
            {/* Input Panel */}
            <div className="flex flex-col bg-brand-primary/50 h-full overflow-hidden relative order-2 md:order-1 border-t md:border-t-0 border-white/5">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary font-mono">
                        {agent.type === 'image' ? 'Prompt Visual' : 'Entrada (Prompt)'}
                    </span>
                    
                    {/* Aspect Ratio Selector for Image Agents */}
                    {agent.type === 'image' && (
                        <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1 border border-white/5">
                            {['1:1', '16:9', '9:16', '4:3', '3:4'].map((ratio) => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    className={`
                                        px-2 py-1 text-[10px] font-medium rounded-md transition-all
                                        ${aspectRatio === ratio 
                                            ? 'bg-brand-accent text-white shadow-sm' 
                                            : 'text-brand-text-secondary hover:text-white hover:bg-white/5'}
                                    `}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button onClick={handleClear} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-brand-text-secondary hover:text-red-400" title="Limpar">
                            <TrashIcon className="h-4 w-4"/>
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-6 relative group">
                    <textarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={agent.placeholder}
                        className="w-full h-full bg-transparent text-brand-text-primary resize-none focus:outline-none placeholder:text-brand-text-secondary/30 text-lg leading-relaxed font-light font-sans"
                    />
                </div>
                
                {/* Action Bar */}
                <div className="p-6 border-t border-white/5 bg-brand-surface/30 backdrop-blur-sm">
                     <div className="flex justify-between items-center">
                        <div className="text-xs text-brand-text-secondary opacity-50 font-mono hidden sm:block">
                            {inputText.length} CHARS
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !inputText.trim()}
                            className={`
                                relative flex items-center gap-2 px-8 py-3 w-full sm:w-auto justify-center
                                bg-brand-accent hover:bg-brand-accent-hover 
                                disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none
                                rounded-xl font-bold text-white transition-all duration-300
                                group overflow-hidden
                            `}
                        >
                            {/* Button Glow Effect - Only shows when not disabled */}
                            {!isLoading && inputText.trim() && (
                                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]"></div>
                            )}
                            
                            <span className="relative z-10 flex items-center gap-2">
                                {isLoading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <SparklesIcon className="h-5 w-5 group-hover:animate-pulse" />}
                                <span>{isLoading ? 'Processando...' : 'Executar Agente'}</span>
                            </span>
                        </button>
                     </div>
                </div>
            </div>

            {/* Output Panel */}
            <div ref={outputRef} className="flex flex-col bg-brand-secondary/30 h-full overflow-hidden relative order-1 md:order-2">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary font-mono">Saída</span>
                    {(canCopy || canDownload) && (
                        <div className="flex items-center gap-2">
                            {canCopy && (
                                <button
                                    onClick={handleCopyToClipboard}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors text-brand-text-primary border border-white/5"
                                >
                                    <ClipboardIcon className="h-3.5 w-3.5" />
                                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                                </button>
                            )}
                            {canDownload && (
                                <a
                                    href={outputData.data}
                                    download={`masterhub-${agent.type}-${Date.now()}.${outputData.type === 'image' ? 'jpg' : outputData.type === 'audio' ? 'wav' : 'mp4'}`}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent rounded-lg font-medium transition-colors border border-brand-accent/20"
                                >
                                    <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                                    <span>Download</span>
                                </a>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-black/20">
                    {renderOutput()}
                </div>
            </div>
        </div>
    </div>
  );
};

export default MainContent;