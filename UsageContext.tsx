import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { incrementUsage, checkUsageLimit, getUsageSummary, getUserUsage } from './services/usageTracker';
import type { UserUsage } from './services/usageTracker';

interface UsageContextType {
  usage: UserUsage | null;
  loading: boolean;
  incrementUsageCount: (type: 'text' | 'image' | 'video' | 'audio' | 'thinking', amount: number) => Promise<void>;
  checkLimit: (type: 'text' | 'image' | 'video' | 'audio') => Promise<boolean>;
  refreshUsage: () => Promise<void>;
  getRemaining: (type: 'text' | 'image' | 'video' | 'audio') => number;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export const UsageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);

  // Load usage on user change
  useEffect(() => {
    let mounted = true;

    const loadUsage = async () => {
      if (!user?.id) {
        setUsage(null);
        setLoading(false);
        return;
      }

      try {
        const userUsage = await getUserUsage(user.id);
        if (mounted) {
          setUsage(userUsage);
        }
      } catch (error) {
        console.error('Erro ao carregar uso do usuário:', error);
        // Continue even if error - fallback to localStorage
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUsage();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const incrementUsageCount = async (type: 'text' | 'image' | 'video' | 'audio' | 'thinking', amount: number) => {
    if (!user?.id) return;

    try {
      await incrementUsage(user.id, type, amount);
      // Refresh local state
      const updated = await getUserUsage(user.id);
      setUsage(updated);
    } catch (error) {
      console.error('Erro ao incrementar uso:', error);
    }
  };

  const checkLimit = async (type: 'text' | 'image' | 'video' | 'audio'): Promise<boolean> => {
    if (!user?.id) return true;

    try {
      const check = await checkUsageLimit(user.id, user.tier, type);
      return check.allowed;
    } catch (error) {
      console.error('Erro ao verificar limite:', error);
      return true; // Allow on error
    }
  };

  const refreshUsage = async () => {
    if (!user?.id) return;

    try {
      const updated = await getUserUsage(user.id);
      setUsage(updated);
    } catch (error) {
      console.error('Erro ao atualizar uso:', error);
    }
  };

  const getRemaining = (type: 'text' | 'image' | 'video' | 'audio'): number => {
    if (!usage || !user) return 0;

    const limits: Record<string, number> = {
      text: user.tier === 'pro' ? -1 : 150,
      image: user.tier === 'pro' ? -1 : 90,
      video: user.tier === 'pro' ? 50 : 8,
      audio: user.tier === 'pro' ? -1 : 50,
    };

    const usageMap: Record<string, number> = {
      text: usage.textGenerations,
      image: usage.imageGenerations,
      video: usage.videoGenerations,
      audio: usage.audioGenerations,
    };

    const limit = limits[type];
    const used = usageMap[type] || 0;

    if (limit === -1) return -1; // Unlimited
    return Math.max(0, limit - used);
  };

  const value: UsageContextType = {
    usage,
    loading,
    incrementUsageCount,
    checkLimit,
    refreshUsage,
    getRemaining,
  };

  return <UsageContext.Provider value={value}>{children}</UsageContext.Provider>;
};

export const useUsage = () => {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error('useUsage must be used within a UsageProvider');
  }
  return context;
};
