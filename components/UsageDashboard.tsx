import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getPlan } from '../lib/subscriptionPlans';
import { getUsageSummary } from '../services/usageTracker';
import { SparklesIcon, ArrowPathIcon } from './Icons';

interface UsageDashboardProps {
  user: User;
  onUpgrade: () => void;
}

const UsageDashboard: React.FC<UsageDashboardProps> = ({ user, onUpgrade }) => {
  const [usage, setUsage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, [user.id]);

  const loadUsage = async () => {
    try {
      setIsLoading(true);
      const summary = await getUsageSummary(user.id, user.tier);
      setUsage(summary);
    } catch (error) {
      console.error('Erro ao carregar uso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const plan = getPlan(user.tier);

  if (isLoading || !usage) {
    return (
      <div className="p-6 bg-brand-surface border border-white/10 rounded-xl">
        <div className="flex items-center gap-3">
          <ArrowPathIcon className="h-5 w-5 animate-spin text-brand-accent" />
          <span className="text-brand-text-secondary">Carregando dados de uso...</span>
        </div>
      </div>
    );
  }

  const UsageBar: React.FC<{
    title: string;
    used: number;
    limit: number;
    percentage: number;
    icon: string;
  }> = ({ title, used, limit, percentage, icon }) => {
    const isUnlimited = limit === -1;
    const isNearing = percentage > 80 && !isUnlimited;
    const isMaxed = percentage >= 100 && !isUnlimited;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="text-xs text-brand-text-secondary">
                {isUnlimited ? (
                  <span className="text-green-400">✓ Ilimitado</span>
                ) : (
                  <>
                    {used} de {limit} usados
                  </>
                )}
              </p>
            </div>
          </div>
          <span className={`text-sm font-bold ${
            isMaxed ? 'text-red-400' :
            isNearing ? 'text-yellow-400' :
            'text-brand-text-secondary'
          }`}>
            {isUnlimited ? '∞' : `${percentage}%`}
          </span>
        </div>

        {!isUnlimited && (
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isMaxed ? 'bg-red-500' :
                isNearing ? 'bg-yellow-500' :
                'bg-brand-accent'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}

        {isMaxed && !isUnlimited && (
          <p className="text-xs text-red-400 mt-2">
            ⚠️ Limite atingido. Faça upgrade para continuar.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <SparklesIcon className="h-5 w-5 text-brand-accent" />
          <h2 className="text-lg font-bold text-white">Seu Uso Mensal</h2>
        </div>
        <p className="text-sm text-brand-text-secondary">
          Plano: <span className="font-semibold text-white capitalize">{plan.name}</span>
        </p>
      </div>

      {/* Usage Stats */}
      <div className="bg-brand-surface/50 border border-white/10 rounded-xl p-6 space-y-4">
        <UsageBar
          title="Gerações de Texto"
          used={usage.textGenerations.used}
          limit={usage.textGenerations.limit}
          percentage={usage.textGenerations.percentage}
          icon="📝"
        />

        <UsageBar
          title="Gerações de Imagem"
          used={usage.imageGenerations.used}
          limit={usage.imageGenerations.limit}
          percentage={usage.imageGenerations.percentage}
          icon="🎨"
        />

        <UsageBar
          title="Gerações de Vídeo"
          used={usage.videoGenerations.used}
          limit={usage.videoGenerations.limit}
          percentage={usage.videoGenerations.percentage}
          icon="🎬"
        />

        <UsageBar
          title="Gerações de Áudio"
          used={usage.audioGenerations.used}
          limit={usage.audioGenerations.limit}
          percentage={usage.audioGenerations.percentage}
          icon="🔊"
        />

        {usage.thinkingTokens.limit > 0 && (
          <UsageBar
            title="Tokens de Thinking (Gemini Pro)"
            used={usage.thinkingTokens.used}
            limit={usage.thinkingTokens.limit}
            percentage={usage.thinkingTokens.percentage}
            icon="🧠"
          />
        )}
      </div>

      {/* Upgrade CTA */}
      {user.tier === 'free' && (
        <div className="bg-gradient-to-r from-brand-accent/10 to-purple-600/10 border border-brand-accent/30 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-white mb-2">Quer usar ilimitadamente?</h3>
              <p className="text-sm text-brand-text-secondary mb-4">
                Faça upgrade para o plano Pro Master e tenha acesso a todos os agentes, recursos premium e mais.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-brand-accent font-semibold">✓</span>
                <span className="text-white">Gerações ilimitadas</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-brand-accent font-semibold">✓</span>
                <span className="text-white">Acesso a 17 agentes premium</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-brand-accent font-semibold">✓</span>
                <span className="text-white">Apenas R$ 29,90/mês</span>
              </div>
            </div>
            <button
              onClick={onUpgrade}
              className="px-6 py-3 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg transition-colors whitespace-nowrap ml-4"
            >
              Fazer Upgrade
            </button>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={loadUsage}
        disabled={isLoading}
        className="w-full px-4 py-2 text-sm text-brand-text-secondary hover:text-white border border-white/10 hover:border-brand-accent/30 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        Atualizar
      </button>
    </div>
  );
};

export default UsageDashboard;
