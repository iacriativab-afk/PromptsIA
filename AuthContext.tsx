
import React, { createContext, useState, useEffect, useContext } from 'react';
import { signInWithGoogle, logoutUser, loginAsGuest } from './services/supabase';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
  handleGuestLogin: () => Promise<void>;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Simula verificação de sessão ao carregar
    const checkSession = () => {
        try {
            const savedUser = localStorage.getItem('promptsia_user');
            const savedTier = localStorage.getItem('promptsia_user_tier') as 'free' | 'pro';

            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                // Força o tier salvo no localStorage (fonte da verdade para o mock)
                if (savedTier) {
                    parsedUser.tier = savedTier;
                }
                
                setUser(parsedUser);
                setIsGuest(parsedUser.id.startsWith('guest'));
            }
        } catch (error) {
            console.error("Erro ao carregar sessão mockada:", error);
            localStorage.clear();
        } finally {
            setLoading(false);
        }
    };

    checkSession();
  }, []);

  const handleLogin = async () => {
    await signInWithGoogle();
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setIsGuest(false);
  };

  const handleGuestLogin = async () => {
      await loginAsGuest();
  };

  const value = {
    user,
    loading,
    isGuest,
    handleLogin,
    handleLogout,
    handleGuestLogin
  };

  return <AuthContext.Provider value={value}>{!loading ? children : (
      <div className="flex h-screen w-full items-center justify-center bg-brand-primary text-white">
          <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-brand-accent rounded-full mb-4 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
              <p className="text-sm font-mono text-brand-text-secondary">Carregando PromptsIA...</p>
          </div>
      </div>
  )}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
