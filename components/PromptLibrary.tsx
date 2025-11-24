
import React, { useState, useMemo } from 'react';
import { PROMPTS } from '../constants';
import { ClipboardIcon, MagnifyingGlassIcon, SwatchIcon, UserGroupIcon, MapIcon, PlayIcon, PhotoIcon, CodeBracketIcon, MegaphoneIcon } from './Icons';

const PromptLibrary: React.FC = () => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Filters
  const [selectedMediaType, setSelectedMediaType] = useState<string>('All');
  const [selectedPersona, setSelectedPersona] = useState<string>('All');

  // Extract unique personas
  const allPersonas = useMemo(() => {
      const personas = new Set<string>(['All']);
      PROMPTS.forEach(p => { if(p.persona) personas.add(p.persona) });
      return Array.from(personas);
  }, []);

  const mediaTypes = [
      { id: 'All', label: 'Tudo' },
      { id: 'text', label: 'Texto', icon: CodeBracketIcon },
      { id: 'image', label: 'Imagem', icon: PhotoIcon },
      { id: 'video', label: 'Vídeo', icon: PlayIcon },
      { id: 'mindmap', label: 'Mapa Mental', icon: MapIcon },
  ];

  const filteredPrompts = useMemo(() => {
    return PROMPTS.filter(prompt => {
      const matchesSearch = prompt.title.toLowerCase().includes(search.toLowerCase()) || 
                            prompt.content.toLowerCase().includes(search.toLowerCase()) ||
                            prompt.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      
      const matchesMedia = selectedMediaType === 'All' || prompt.outputType === selectedMediaType;
      const matchesPersona = selectedPersona === 'All' || prompt.persona === selectedPersona;

      return matchesSearch && matchesMedia && matchesPersona;
    });
  }, [search, selectedMediaType, selectedPersona]);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 custom-scrollbar">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-brand-accent/20 p-2 rounded-xl">
                 <SwatchIcon className="h-6 w-6 text-brand-accent" />
            </div>
            <h1 className="text-3xl font-bold text-white">Biblioteca de Prompts</h1>
        </div>
        <p className="text-brand-text-secondary text-lg max-w-2xl mb-6">
          O maior repositório de prompts validados do mercado. Copie estratégias prontas de especialistas.
        </p>
        
        <div className="flex flex-col gap-6">
            {/* Search Bar */}
            <div className="relative w-full md:w-full max-w-2xl">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-brand-text-secondary" />
                <input 
                type="text" 
                placeholder="Buscar por palavra-chave, tag ou objetivo..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-brand-surface border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-text-secondary shadow-lg"
                />
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 bg-brand-secondary/30 rounded-xl border border-white/5">
                
                {/* Media Type Tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto mask-linear-fade">
                    {mediaTypes.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedMediaType(type.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                selectedMediaType === type.id 
                                ? 'bg-white text-brand-primary shadow-md' 
                                : 'text-brand-text-secondary hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {type.icon && <type.icon className="h-4 w-4" />}
                            {type.label}
                        </button>
                    ))}
                </div>

                {/* Persona Dropdown */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <UserGroupIcon className="h-4 w-4 text-brand-text-secondary" />
                    <select 
                        value={selectedPersona}
                        onChange={(e) => setSelectedPersona(e.target.value)}
                        className="bg-brand-surface border border-white/10 text-white text-sm rounded-lg focus:ring-brand-accent focus:border-brand-accent block w-full p-2.5"
                    >
                        {allPersonas.map(p => (
                            <option key={p} value={p}>{p === 'All' ? 'Todas as Personas' : p}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
      </header>

      {/* Masonry Layout using CSS Columns */}
      <div className="columns-1 md:columns-2 xl:columns-3 gap-6 pb-10 space-y-6">
        {filteredPrompts.length > 0 ? (
            filteredPrompts.map((prompt) => (
            <div key={prompt.id} className="break-inside-avoid bg-brand-secondary border border-white/5 rounded-2xl p-6 flex flex-col hover:border-brand-accent/30 transition-all duration-300 shadow-sm hover:shadow-xl group relative overflow-hidden">
                
                {/* Pro Badge */}
                {prompt.requiresPro && (
                    <div className="absolute top-0 right-0 bg-brand-accent text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                        PRO
                    </div>
                )}

                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            prompt.outputType === 'video' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                            prompt.outputType === 'image' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            prompt.outputType === 'mindmap' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                            {prompt.outputType}
                        </span>
                        {prompt.persona && <span className="text-xs text-brand-text-secondary">• {prompt.persona}</span>}
                    </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-3 leading-snug">{prompt.title}</h3>

                <div className="bg-black/30 rounded-xl p-4 mb-4 flex-1 relative group-hover:bg-black/40 transition-colors border border-white/5">
                    <p className="text-brand-text-secondary text-sm font-mono line-clamp-6 selection:bg-brand-accent selection:text-white">
                        {prompt.content}
                    </p>
                    {/* Fade overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                        {prompt.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] bg-white/5 text-brand-text-secondary px-2 py-1 rounded-md">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <button 
                        onClick={() => handleCopy(prompt.content, prompt.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${copiedId === prompt.id ? 'bg-green-500 text-white' : 'bg-white text-brand-primary hover:bg-gray-200'}`}
                    >
                        {copiedId === prompt.id ? 'Copiado!' : 'Copiar'}
                        <ClipboardIcon className="h-3 w-3" />
                    </button>
                </div>
            </div>
            ))
        ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                <MagnifyingGlassIcon className="h-12 w-12 mb-4" />
                <p>Nenhum prompt encontrado para os filtros selecionados.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PromptLibrary;