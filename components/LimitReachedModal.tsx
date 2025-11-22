import React from 'react';
import { User } from '../types';
import { SparklesIcon, XIcon } from './Icons';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  type: 'text' | 'image' | 'video' | 'audio';
  used: number;
  limit: number;
  user: User;
}

const LimitReachedModal: React.FC<LimitReachedModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  type,
  used,
  limit,
  user
}) => {
  if (!isOpen) return null;

  const typeLabels = {
    text: 'Gerações de Texto',
    image: 'Gerações de Imagem',
    video: 'Gerações de Vídeo',
    audio: 'Gerações de Áudio'
  };

  const typeIcons = {
    text: '📝',
    image: '🎨',
    video: '🎬',
    audio: '🔊'
  };

  const typeColors = {
    text: 'from-blue-600 to-cyan-600',
    image: 'from-purple-600 to-pink-600',
    video: 'from-orange-600 to-red-600',
    audio: 'from-green-600 to-emerald-600'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`
        bg-gradient-to-br ${typeColors[type]} rounded-2xl p-1 
        w-full max-w-md shadow-2xl transform transition-all
      `}>
        <div className="bg-brand-surface rounded-2xl p-8 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-brand-text-secondary hover:text-white transition-colors"
          >
            <XIcon className="h-6 w-6" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`
              w-20 h-20 rounded-full bg-gradient-to-br ${typeColors[type]} 
              flex items-center justify-center text-4xl animate-bounce
            `}>
              {typeIcons[type]}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-4">
            Limite Atingido!
          </h2>

          {/* Message */}
          <p className="text-brand-text-secondary text-center mb-6">
            Você atingiu seu limite mensal de <span className="font-bold text-white">{limit} {typeLabels[type].toLowerCase()}</span>.
          </p>

          {/* Stats */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-brand-text-secondary">Uso este mês:</span>
              <span className="text-lg font-bold text-white">{used}/{limit}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${typeColors[type]}`}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-6 space-y-3">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-brand-accent" />
              Com o plano Pro Master você terá:
            </p>
            <ul className="space-y-2 text-sm text-brand-text-secondary">
              <li className="flex items-center gap-3">
                <span className="text-brand-accent">✓</span>
                <span>Gerações <strong className="text-white">ilimitadas</strong> de {type}s</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-brand-accent">✓</span>
                <span>Acesso a <strong className="text-white">17 agentes premium</strong></span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-brand-accent">✓</span>
                <span><strong className="text-white">Suporte prioritário</strong> por email</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-brand-accent">✓</span>
                <span>Apenas <strong className="text-white">R$ 29,90/mês</strong></span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onUpgrade}
              className={`
                w-full py-3 rounded-lg font-bold transition-all
                bg-gradient-to-r ${typeColors[type]}
                text-white hover:shadow-lg hover:shadow-brand-accent/20
                active:scale-95
              `}
            >
              Faça Upgrade Agora
            </button>
            <button
              onClick={onClose}
              className="
                w-full py-2 rounded-lg font-medium
                bg-white/5 hover:bg-white/10 border border-white/10
                text-white transition-colors
              "
            >
              Voltar
            </button>
          </div>

          {/* Trust Badge */}
          <p className="text-xs text-brand-text-secondary text-center mt-4 pt-4 border-t border-white/10">
            💳 Pagamento seguro via Stripe | Cancele quando quiser
          </p>
        </div>
      </div>
    </div>
  );
};

export default LimitReachedModal;
