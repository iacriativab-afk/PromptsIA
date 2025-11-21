import React, { useState, useMemo } from 'react';
import { AGENTS } from '../constants';
import type { Agent } from '../types';
import { MagnifyingGlassIcon, SparklesIcon } from './Icons';

interface DashboardProps {
  onSelectAgent: (agent: Agent) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectAgent }) => {
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');

  const categories = ['Todos', 'Business', 'Reasoning', 'Writing', 'Visual', 'Audio', 'Productivity', 'Dev'];

  const filteredAgents = useMemo(() => {
    return AGENTS.filter(agent => {
      const matchesCategory = filter === 'Todos' || agent.category === filter;
      const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase()) || 
                            agent.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [filter, search]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 mb-4 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
            </span>
            <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">PromptsIA 2.0</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
            Potencialize sua criatividade <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400">com Inteligência Suprema.</span>
          </h1>
          <p className="text-brand-text-secondary text-lg max-w-2xl leading-relaxed mb-8">
            Selecione um agente especializado para começar. Do raciocínio profundo à geração de vídeos cinematográficos com Veo e Imagen.
          </p>
          
          <div className="mt-8 flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 w-full lg:w-auto no-scrollbar mask-linear-fade">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border ${
                    filter === cat 
                      ? 'bg-brand-accent text-white border-brand-accent shadow-[0_0_15px_rgba(99,102,241,0.4)] transform scale-105' 
                      : 'bg-white/5 text-brand-text-secondary hover:bg-white/10 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-80 group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-accent to-purple-600 rounded-full opacity-20 group-hover:opacity-50 transition duration-500 blur"></div>
              <div className="relative flex items-center bg-black/40 backdrop-blur-xl rounded-full border border-white/10 group-hover:border-brand-accent/50 transition-colors">
                  <MagnifyingGlassIcon className="absolute left-4 h-5 w-5 text-brand-text-secondary group-focus-within:text-brand-accent transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Encontrar especialista..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent py-3 pl-12 pr-4 text-sm text-white focus:outline-none placeholder:text-brand-text-secondary/70"
                  />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10 relative z-10">
          {filteredAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className="group relative flex flex-col h-[320px] text-left w-full rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-accent/20"
            >
              {/* Background Image with Zoom Effect */}
              <div className="absolute inset-0">
                <img 
                    src={agent.backgroundImage || 'https://images.unsplash.com/photo-1531297461136-821960deb3b2?q=80&w=800&auto=format&fit=crop'} 
                    alt={agent.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-brand-primary/80 to-transparent opacity-90"></div>
                <div className="absolute inset-0 bg-brand-accent/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              {/* Glass Border */}
              <div className="absolute inset-0 border border-white/10 rounded-3xl group-hover:border-brand-accent/50 transition-colors duration-500"></div>
              
              <div className="relative z-10 h-full p-6 flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`
                        p-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg
                        bg-gradient-to-br ${agent.coverGradient}
                    `}>
                        <agent.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex gap-1">
                        {agent.thinkingBudget && (
                            <div className="bg-black/40 backdrop-blur-md border border-brand-accent/30 px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                                <SparklesIcon className="h-3 w-3 text-brand-accent" />
                            </div>
                        )}
                        {agent.requiresPro && (
                            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="text-[10px] font-bold text-white uppercase">PRO</span>
                            </div>
                        )}
                    </div>
                  </div>

                  <div className="mt-auto">
                      <div className="mb-2">
                         <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/80 border border-white/10 backdrop-blur-sm">
                            {agent.category}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-brand-text-primary transition-colors drop-shadow-md">
                          {agent.name}
                      </h3>
                      <p className="text-sm text-brand-text-secondary line-clamp-2 group-hover:text-white/90 transition-colors mb-4 font-light">
                        {agent.description}
                      </p>
                      
                      {/* Footer Info */}
                      <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                          <div className={`h-2 w-2 rounded-full ${agent.model?.includes('pro') ? 'bg-purple-500 shadow-[0_0_8px_#a855f7]' : agent.model?.includes('veo') ? 'bg-pink-500 shadow-[0_0_8px_#ec4899]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}></div>
                          <span className="text-[10px] text-brand-text-secondary font-mono tracking-tight uppercase opacity-80">
                              {agent.model ? agent.model.replace('-preview', '').replace('gemini-', '') : 'Flash 2.5'}
                          </span>
                      </div>
                  </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;