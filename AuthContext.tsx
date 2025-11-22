
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, fetchProfile, signInWithGoogle, logoutUser, loginAsGuest } from './services/supabase';
import { Session } from '@supabase/supabase-js';
import { User } from './types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
  handleGuestLogin: () => Promise<void>;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Validação segura de dados do localStorage
    const isValidUser = (obj: any): obj is User => {
        return (
            obj &&
            typeof obj === 'object' &&
            typeof obj.id === 'string' &&
            typeof obj.name === 'string' &&
            typeof obj.email === 'string' &&
            (obj.tier === 'free' || obj.tier === 'pro')
        );
    };

    // Check for Guest Mode in LocalStorage safely
    const savedMockUser = localStorage.getItem('promptsia_user');
    if (savedMockUser) {
        try {
            const parsed = JSON.parse(savedMockUser);
            // Ensure parsed object is valid before using
            if (isValidUser(parsed)) {
                const currentTier = localStorage.getItem('promptsia_user_tier') as 'free' | 'pro' || parsed.tier;
                if (mounted) {
                    setUser({ ...parsed, tier: currentTier });
                    setIsGuest(true);
                    setLoading(false);
                }
                return;
            } else {
                throw new Error("Invalid user object structure");
            }
        } catch (e) {
            console.error("Erro ao ler usuário do localStorage (dados corrompidos):", e);
            localStorage.removeItem('promptsia_user'); // Clean bad data
            localStorage.removeItem('promptsia_user_tier');
        }
    }

    // If no guest, check Supabase
    if (supabase) {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) {
                setSession(session);
                if (session?.user) {
                     fetchProfile(session.user).then(u => {
                         if(mounted) setUser(u);
                         setLoading(false);
                     }).catch(err => {
                         console.error("Erro ao buscar perfil:", err);
                         setLoading(false);
                     });
                } else {
                    setLoading(false);
                }
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                if (session?.user) {
                    fetchProfile(session.user).then(u => {
                         if(mounted) setUser(u);
                    }).catch(err => {
                        console.error("Erro ao buscar perfil:", err);
                    });
                } else {
                    // If not guest and logged out
                    if (!localStorage.getItem('promptsia_user')) {
                        setUser(null);
                    }
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    } else {
        setLoading(false);
    }
  }, []);

  const handleLogin = async () => {
    await signInWithGoogle();
  };

  const handleLogout = async () => {
    await logoutUser();
    setSession(null);
    setUser(null);
    setIsGuest(false);
  };

  const handleGuestLogin = async () => {
      await loginAsGuest();
  };

  const value = {
    session,
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
