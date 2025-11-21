
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MainContent from './components/MainContent';
import PromptLibrary from './components/PromptLibrary';
import Courses from './components/Courses';
import LandingPage from './components/LandingPage';
import UserProfile from './components/UserProfile';
import ProtectedRoute from './components/ProtectedRoute'; // Novo componente
import type { Agent, User } from './types';
import { MenuIcon, XIcon } from './components/Icons';

// Auth Service (Supabase)
import { signInWithGoogle, logoutUser, subscribeToAuthChanges, upgradeUserTier, loginAsGuest } from './services/supabase';

type ViewState = 'dashboard' | 'agent' | 'library' | 'courses' | 'profile';

const App: React.FC = () => {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Realtime Auth Listener with Safety Timeout
  useEffect(() => {
    let mounted = true;

    // TASK 1: Safety Timeout
    // Se o Supabase não responder em 4 segundos (ex: erro de rede, chave inválida),
    // forçamos o estado de carregamento para falso para mostrar a Landing Page.
    const safetyTimer = setTimeout(() => {
        if (mounted && loadingAuth) {
            console.warn("⏳ Auth check timed out. Forçando exibição da Landing Page.");
            setLoadingAuth(false);
        }
    }, 4000);

    const unsubscribe = subscribeToAuthChanges((authUser) => {
        if (!mounted) return;
        
        // Se recebermos resposta, limpamos o timeout de segurança
        clearTimeout(safetyTimer); 

        if (authUser) {
            setUser(authUser);
            setIsLoggedIn(true);
        } else {
            setUser(null);
            setIsLoggedIn(false);
        }
        setLoadingAuth(false);
    });

    return () => {
        mounted = false;
        clearTimeout(safetyTimer);
        unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      // O loading state visual é controlado dentro da LandingPage
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Login failed", error);
      // O alerta já é mostrado dentro do serviço
    }
  };

  const handleGuestLogin = async () => {
      try {
          await loginAsGuest();
      } catch (error) {
          console.error("Guest login failed", error);
      }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentView('dashboard');
    setSelectedAgent(null);
  };

  const handleUpgrade = async () => {
      if (user) {
          await upgradeUserTier(user.id);
          setUser({ ...user, tier: 'pro' });
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

  if (loadingAuth) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-brand-primary text-white">
              <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 bg-brand-accent rounded-full mb-4 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                  <p className="text-sm font-mono text-brand-text-secondary">Conectando ao PromptsIA...</p>
              </div>
          </div>
      );
  }

  // If not logged in, show Landing Page
  if (!isLoggedIn || !user) {
    return <LandingPage onLogin={handleLogin} onGuestLogin={handleGuestLogin} />;
  }

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

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
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
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {currentView === 'dashboard' && (
          <Dashboard onSelectAgent={handleSelectAgent} />
        )}

        {currentView === 'library' && (
          <ProtectedRoute user={user}>
             <PromptLibrary />
          </ProtectedRoute>
        )}

        {currentView === 'courses' && (
          <ProtectedRoute user={user}>
            <Courses />
          </ProtectedRoute>
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

export default App;
