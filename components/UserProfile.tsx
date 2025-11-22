
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { SparklesIcon, CheckBadgeIcon, CreditCardIcon, ArrowPathIcon, XIcon, CodeBracketIcon } from './Icons';
import { downgradeUserTier } from '../services/supabase';

interface UserProfileProps {
  user: User;
  onUpgrade: () => void;
  onLogout: () => void;
}

const CANCELLATION_REASONS = [
  "O preço é muito alto",
  "Não uso com frequência suficiente",
  "Faltam funcionalidades que eu preciso",
  "Encontrei problemas técnicos/bugs",
  "Estou apenas testando",
  "Outro motivo"
];

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpgrade, onLogout }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  
  // Cancellation State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Admin API Key State
  const [adminKey, setAdminKey] = useState('');
  const [showAdminSettings, setShowAdminSettings] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('PROMPTSIA_API_KEY');
    if (storedKey) setAdminKey(storedKey);
  }, []);

  const handleSaveKey = () => {
    if (adminKey.trim().startsWith('AIza')) {
        localStorage.setItem('PROMPTSIA_API_KEY', adminKey.trim());
        alert('Chave Mestra salva! O SaaS agora consumirá seus créditos para gerar respostas.');
    } else {
        alert('Chave inválida. Deve começar com "AIza".');
    }
  };

  const handleStripeCheckout = async () => {
    setIsValidating(true);
    
    // Open Stripe Checkout with the specific URL provided
    window.open('https://buy.stripe.com/test_dRm8wR4FJe8Sfsg2n987K00', '_blank');

    // Simulate webhook delay for demo purposes
    setTimeout(() => {
        setIsValidating(false);
        setShowPaymentSuccess(true);
        
        setTimeout(() => {
            onUpgrade();
            setShowPaymentSuccess(false);
        }, 2000);
    }, 5000);
  };

  const handleCancelSubmit = async () => {
    if (!selectedReason) {
        alert("Por favor, selecione um motivo para continuar.");
        return;
    }

    if (confirm("Tem certeza que deseja cancelar sua assinatura Pro? Você perderá acesso imediato aos recursos exclusivos.")) {
        setIsCancelling(true);
        try {
            const feedback = selectedReason === "Outro motivo" ? otherReason : selectedReason;
            await downgradeUserTier(user.id, feedback);
            
            setShowCancelModal(false);
            setSelectedReason('');
            setOtherReason('');
            
            alert("Assinatura cancelada com sucesso. Esperamos te ver de volta em breve!");
        } catch (error) {
            console.error(error);
            alert("Houve um erro ao cancelar. Tente novamente.");
        } finally {
            setIsCancelling(false);
        }
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 relative">
       <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
             <h1 className="text-3xl font-bold text-white">Meu Perfil</h1>
             <button 
               onClick={onLogout} 
               className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
             >
               Sair da Conta
             </button>
          </div>
          
          {/* User Card */}
          <div className="bg-brand-surface border border-white/10 rounded-2xl p-8 mb-8 flex items-center gap-6">
             {user.avatar ? (
                 <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-2 border-brand-accent" />
             ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-accent to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                    {user.name.charAt(0)}
                </div>
             )}
             
             <div>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-brand-text-secondary">{user.email}</p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <span className={`w-2 h-2 rounded-full ${user.tier === 'pro' ? 'bg-brand-accent' : 'bg-gray-400'}`}></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Plano {user.tier === 'pro' ? 'Pro Master' : 'Gratuito'}
                    </span>
                </div>
             </div>
          </div>

          {/* Subscription Status */}
          {user.tier === 'free' ? (
              <div className="bg-gradient-to-r from-[#635BFF]/10 to-brand-accent/10 border border-[#635BFF]/30 rounded-2xl p-8 relative overflow-hidden mb-8">
                 <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white mb-2">Desbloqueie o Poder Total 🚀</h3>
                    <p className="text-brand-text-secondary max-w-lg mb-6">
                        Você está no plano gratuito. Faça o upgrade para acessar o Gemini 3 Pro (Thinking), Veo Video Generation e Imagen 4.0.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={handleStripeCheckout}
                            disabled={isValidating || showPaymentSuccess}
                            className={`
                                relative px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                                ${showPaymentSuccess 
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                                    : 'bg-[#635BFF] hover:bg-[#5851DB] text-white shadow-lg shadow-[#635BFF]/20'
                                }
                            `}
                        >
                            {isValidating ? (
                                <>
                                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                    Confirmando Pagamento...
                                </>
                            ) : showPaymentSuccess ? (
                                <>
                                    <CheckBadgeIcon className="h-5 w-5" />
                                    Pagamento Aprovado!
                                </>
                            ) : (
                                <>
                                    <CreditCardIcon className="h-5 w-5" />
                                    Assinar com Stripe (R$ 29,90)
                                </>
                            )}
                        </button>
                    </div>
                 </div>
                 <SparklesIcon className="absolute top-4 right-4 w-32 h-32 text-[#635BFF] opacity-10 rotate-12" />
              </div>
          ) : (
              <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-8 relative overflow-hidden mb-8">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-green-500/20">
                            <CheckBadgeIcon className="h-6 w-6 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Assinatura Master Ativa</h3>
                    </div>
                    <p className="text-brand-text-secondary mb-6">
                        Obrigado por ser um membro Pro da PromptsIA! Você tem acesso ilimitado a todos os agentes e cursos.
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setShowCancelModal(true)}
                            className="px-4 py-2 rounded-lg border border-white/10 text-brand-text-secondary hover:text-white hover:bg-white/5 hover:border-white/20 transition-colors text-sm"
                        >
                            Cancelar Assinatura
                        </button>
                    </div>
                  </div>
              </div>
          )}

          {/* SaaS Admin Settings */}
          <div className="border-t border-white/10 pt-8">
            <button 
                onClick={() => setShowAdminSettings(!showAdminSettings)}
                className="flex items-center gap-2 text-brand-text-secondary hover:text-white transition-colors text-sm mb-4"
            >
                <CodeBracketIcon className="h-4 w-4" />
                {showAdminSettings ? 'Ocultar Configurações Admin' : 'Configurações do SaaS (Admin)'}
            </button>

            {showAdminSettings && (
                <div className="bg-black/30 border border-brand-accent/30 rounded-xl p-6 animate-fade-in">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Chave Mestra da API (Google Gemini)
                    </h3>
                    <p className="text-sm text-brand-text-secondary mb-4">
                        Como dono do SaaS, insira sua chave da Google aqui. Todos os usuários da plataforma usarão esta chave para gerar conteúdo (simulando o backend).
                        <br />
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-brand-accent hover:underline">Obter chave no Google AI Studio &rarr;</a>
                    </p>
                    <div className="flex gap-2">
                        <input 
                            type="password" 
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            placeholder="Cole sua chave AIza... aqui"
                            className="flex-1 bg-brand-primary border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-accent focus:outline-none font-mono text-sm"
                        />
                        <button 
                            onClick={handleSaveKey}
                            className="bg-brand-accent hover:bg-brand-accent-hover text-white px-6 py-2 rounded-lg font-bold transition-colors text-sm"
                        >
                            Salvar e Ativar
                        </button>
                    </div>
                </div>
            )}
          </div>
       </div>

       {/* Cancellation Modal */}
       {showCancelModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-brand-surface border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Cancelar Assinatura</h3>
                    <button 
                        onClick={() => setShowCancelModal(false)}
                        className="text-brand-text-secondary hover:text-white"
                    >
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-brand-text-secondary text-sm mb-4">
                        Sentiremos sua falta! Para nos ajudar a melhorar, poderia nos dizer por que você está cancelando?
                    </p>

                    <div className="space-y-2 mb-4">
                        {CANCELLATION_REASONS.map((reason) => (
                            <label 
                                key={reason} 
                                className={`
                                    flex items-center p-3 rounded-lg border cursor-pointer transition-all
                                    ${selectedReason === reason 
                                        ? 'bg-brand-accent/10 border-brand-accent text-white' 
                                        : 'bg-white/5 border-transparent hover:bg-white/10 text-brand-text-secondary'
                                    }
                                `}
                            >
                                <input 
                                    type="radio" 
                                    name="cancelReason" 
                                    value={reason}
                                    checked={selectedReason === reason}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    className="hidden"
                                />
                                <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${selectedReason === reason ? 'border-brand-accent' : 'border-brand-text-secondary'}`}>
                                    {selectedReason === reason && <div className="w-2 h-2 rounded-full bg-brand-accent" />}
                                </div>
                                <span className="text-sm">{reason}</span>
                            </label>
                        ))}
                    </div>

                    {selectedReason === "Outro motivo" && (
                        <textarea
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                            placeholder="Poderia nos dar mais detalhes?"
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-brand-text-secondary/50 focus:border-brand-accent focus:outline-none mb-4 resize-none h-24"
                        />
                    )}

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6">
                        <p className="text-xs text-yellow-200">
                            ⚠️ Ao cancelar, você perderá imediatamente o acesso ao Veo, Imagen 4.0 e aos modelos Gemini Pro.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowCancelModal(false)}
                            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/10"
                        >
                            Manter Assinatura
                        </button>
                        <button 
                            onClick={handleCancelSubmit}
                            disabled={isCancelling || !selectedReason}
                            className={`
                                flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2
                                ${!selectedReason 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                                }
                            `}
                        >
                            {isCancelling ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : 'Confirmar Cancelamento'}
                        </button>
                    </div>
                </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default UserProfile;
