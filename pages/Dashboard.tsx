
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import Sidebar from '../components/Sidebar';
import DashboardHome from '../components/Dashboard';
import MainContent from '../components/MainContent';
import PromptLibrary from '../components/PromptLibrary';
import Courses from '../components/Courses';
import UserProfile from '../components/UserProfile';
import { Agent } from '../types';
import { MenuIcon, XIcon } from '../components/Icons';
import { upgradeUserTier } from '../services/supabase';

type ViewState = 'dashboard' | 'agent' | 'library' | 'courses' | 'profile';

const Dashboard = () => {
  const { user, handleLogout } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleUpgrade = async () => {
      if (user) {
          await upgradeUserTier(user.id);
          window.location.reload(); // Reload to refresh context
      }
  };

  const handleSelectAgent = (agent: Agent) => {
    if (!user) return;

    // Access Control Logic
    if (agent.requiresPro && user.tier === 'free') {
        if (confirm("💎 Este agente é exclusivo para usuários PRO. Deseja ver seu perfil para atualizar?")) {
            setCurrentView('profile');
        }
        return;
    }

    setSelectedAgent(agent);
    setCurrentView('agent');
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    if (view !== 'agent') {
      setSelectedAgent(null);
    }
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen w-full bg-brand-primary text-brand-text-primary font-sans overflow-hidden selection:bg-brand-accent selection:text-white relative">
      
      {/* Technical Grid Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#05050a] via-transparent to-[#05050a]"></div>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-brand-secondary/90 backdrop-blur-md rounded-full border border-brand-border shadow-lg text-white"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition-transform duration-300 ease-out
        flex-shrink-0 shadow-2xl md:shadow-none h-full
      `}>
        <Sidebar 
          currentView={currentView} 
          selectedAgent={selectedAgent}
          user={user}
          onNavigate={handleNavigate} 
          onSelectAgent={handleSelectAgent}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
        {currentView === 'dashboard' && (
          <DashboardHome onSelectAgent={handleSelectAgent} />
        )}

        {currentView === 'library' && (
             <PromptLibrary />
        )}

        {currentView === 'courses' && (
            <Courses />
        )}

        {currentView === 'profile' && (
            <UserProfile 
                user={user} 
                onUpgrade={handleUpgrade} 
                onLogout={handleLogout}
            />
        )}

        {currentView === 'agent' && selectedAgent && (
          <MainContent 
            agent={selectedAgent} 
            onBack={() => handleNavigate('dashboard')}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;