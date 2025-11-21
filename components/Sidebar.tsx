import React from 'react';
import { HomeIcon, SwatchIcon, SparklesIcon, AcademicCapIcon } from './Icons';
import { AGENTS } from '../constants';
import type { Agent, User } from '../types';

interface SidebarProps {
  currentView: 'dashboard' | 'agent' | 'library' | 'courses' | 'profile';
  selectedAgent: Agent | null;
  user: User;
  onNavigate: (view: 'dashboard' | 'agent' | 'library' | 'courses' | 'profile') => void;
  onSelectAgent: (agent: Agent) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, selectedAgent, user, onNavigate, onSelectAgent }) => {
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: HomeIcon },
    { id: 'library', label: 'Biblioteca de Prompts', icon: SwatchIcon },
    { id: 'courses', label: 'Academy / Cursos', icon: AcademicCapIcon },
  ];

  const quickAccessIds = [
    'deep-reasoner',
    'ebook-creator',
    'cinematic-director',
    'aida-scriptwriter',
  ];

  const quickAgents = quickAccessIds
    .map(id => AGENTS.find(a => a.id === id))
    .filter((a): a is Agent => a !== undefined);

  return (
    <aside className="w-72 h-full bg-brand-secondary/80 backdrop-blur-xl border-r border-brand-border flex flex-col overflow-y-auto custom-scrollbar font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 mb-2 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-accent to-indigo-700 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)] ring-1 ring-white/10">
            <SparklesIcon className="h-6 w-6 text-white"/>
        </div>
        <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">PromptsIA</h1>
            <p className="text-[10px] text-brand-text-secondary font-mono uppercase tracking-wider mt-1">GenAI • {user.tier === 'pro' ? 'PRO' : 'FREE'}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-8">
        {/* Main Menu */}
        <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-brand-text-secondary/60 uppercase tracking-widest mb-2 font-mono">Navegação</p>
            {navItems.map((item) => {
            const isActive = currentView === item.id && !selectedAgent;
            return (
                <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                    isActive
                    ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                    : 'text-brand-text-secondary hover:bg-white/5 hover:text-white border border-transparent'
                }`}
                >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-brand-accent' : 'text-brand-text-secondary group-hover:text-white transition-colors'}`} />
                <span className="font-medium text-sm">{item.label}</span>
                </button>
            );
            })}
        </div>

        {/* Tools Menu (Specific Agents) */}
        <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-brand-text-secondary/60 uppercase tracking-widest mb-2 font-mono">Destaques</p>
            {quickAgents.map((agent) => {
                const isActive = currentView === 'agent' && selectedAgent?.id === agent.id;
                const isLocked = agent.requiresPro && user.tier === 'free';
                
                return (
                    <button
                        key={agent.id}
                        onClick={() => !isLocked && onSelectAgent(agent)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group border border-transparent ${
                            isActive
                            ? 'bg-brand-surface text-white border-brand-border shadow-md'
                            : isLocked 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'text-brand-text-secondary hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <agent.icon className={`h-5 w-5 ${isActive ? 'text-brand-accent' : 'text-brand-text-secondary'}`} />
                        <span className="font-medium text-sm truncate flex-1">{agent.name}</span>
                        {isLocked && <span className="text-[10px] bg-white/10 px-1.5 rounded text-white">PRO</span>}
                    </button>
                );
            })}
        </div>

        {/* User Profile Section */}
        <div className="pt-4 mt-auto">
            <button
                onClick={() => onNavigate('profile')} 
                className={`w-full bg-brand-surface/50 rounded-xl p-3 border ${currentView === 'profile' ? 'border-brand-accent' : 'border-white/5 hover:border-white/20'} transition-colors flex items-center gap-3`}
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-brand-secondary border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                    {user.name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden text-left">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-brand-text-secondary truncate font-mono">
                        {user.tier === 'pro' ? 'Plano Master' : 'Atualizar Plano'}
                    </p>
                </div>
            </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;