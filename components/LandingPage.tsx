
import React, { useState } from 'react';
import { SparklesIcon, CheckBadgeIcon, UserGroupIcon, ArrowPathIcon } from './Icons';

interface LandingPageProps {
  onLogin: () => Promise<void> | void;
  onGuestLogin: () => Promise<void> | void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onGuestLogin }) => {
  // Estado local para controlar o feedback visual de carregamento
  const [isLoading, setIsLoading] = useState<'google' | 'guest' | null>(null);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading('google');
    try {
      await onLogin();
      // Se o login for redirecionado, o estado persiste até o reload.
    } catch (e) {
      console.error(e);
      setIsLoading(null); // Reseta apenas em erro
    }
  };

  const handleGuestClick = async () => {
    if (isLoading) return;
    setIsLoading('guest');
    try {
      await onGuestLogin();
    } catch (e) {
      console.error(e);
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-brand-primary text-white font-sans overflow-y-auto">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center">
             <SparklesIcon className="h-5 w-5 text-white" />
           </div>
           <span className="text-xl font-bold tracking-tight">PromptsIA</span>
        </div>
        <div className="flex gap-3">
            <button 
            onClick={handleGuestClick}
            disabled={!!isLoading}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium border border-white/10 text-brand-text-secondary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
            {isLoading === 'guest' && <ArrowPathIcon className="h-3 w-3 animate-spin" />}
            Visitante
            </button>
            <button 
            onClick={handleGoogleLogin}
            disabled={!!isLoading}
            className="px-5 py-2 rounded-full bg-brand-accent hover:bg-brand-accent-hover transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
            {isLoading === 'google' && <ArrowPathIcon className="h-3 w-3 animate-spin" />}
            Entrar
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-accent/20 rounded-full blur-[120px] -z-10"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 mb-6 backdrop-blur-sm animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-brand-accent"></span>
            <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">Nova Era da Inteligência</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight max-w-4xl mx-auto leading-tight">
           Domine a IA Generativa <br />
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400">Sem Precisar Programar</span>
        </h1>
        
        <p className="text-xl text-brand-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Acesse agentes especializados, cursos práticos e ferramentas de criação (Texto, Vídeo, Imagem) em uma única plataforma unificada com a <strong>PromptsIA</strong>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={!!isLoading}
              className="bg-brand-accent hover:bg-brand-accent-hover text-white px-8 py-4 rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[220px]"
            >
               {isLoading === 'google' ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <SparklesIcon className="h-5 w-5" />}
               {isLoading === 'google' ? 'Conectando...' : 'Entrar com Google'}
            </button>
            <button 
              onClick={handleGuestClick}
              disabled={!!isLoading}
              className="bg-brand-surface hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[220px]"
            >
               {isLoading === 'guest' ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <UserGroupIcon className="h-5 w-5" />}
               {isLoading === 'guest' ? 'Acessando...' : 'Acesso Visitante'}
            </button>
        </div>
        <p className="mt-4 text-xs text-brand-text-secondary opacity-60">
            Não é necessário cartão de crédito para o modo visitante.
        </p>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-brand-secondary/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Agentes Especializados', desc: 'Assistentes de IA pré-treinados para Marketing, Dev, e Design.', icon: '🤖' },
                { title: 'Geração Multimodal', desc: 'Crie imagens (Imagen 4), Vídeos (Veo) e Áudio em segundos.', icon: '🎨' },
                { title: 'Cursos Práticos', desc: 'Aprenda engenharia de prompt e automação com nossos módulos.', icon: '📚' }
              ].map((feat, i) => (
                <div key={i} className="p-8 rounded-2xl bg-brand-surface border border-white/5 hover:border-brand-accent/30 transition-colors">
                   <div className="text-4xl mb-4">{feat.icon}</div>
                   <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
                   <p className="text-brand-text-secondary">{feat.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
         <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos Simples e Transparentes</h2>
            <p className="text-brand-text-secondary">Comece pequeno e escale seus superpoderes com a PromptsIA.</p>
         </div>

         <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-3xl bg-brand-surface border border-white/10 flex flex-col">
               <h3 className="text-xl font-bold text-white">Iniciante</h3>
               <div className="my-4"><span className="text-4xl font-bold">R$ 0</span><span className="text-brand-text-secondary">/mês</span></div>
               <p className="text-brand-text-secondary text-sm mb-8">Para quem está descobrindo o poder da IA.</p>
               
               <ul className="space-y-3 mb-8 flex-1">
                 {['Acesso a Agentes de Texto (Flash)', '5 Gerações de Imagem/dia', 'Biblioteca de Prompts Básica', '1 Curso Introdutório'].map(item => (
                   <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                     <CheckBadgeIcon className="h-5 w-5 text-gray-500" /> {item}
                   </li>
                 ))}
               </ul>
               
               <button onClick={handleGuestClick} disabled={!!isLoading} className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-colors font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  {isLoading === 'guest' ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : null}
                  Testar Grátis (Visitante)
               </button>
            </div>

            {/* Pro Tier */}
            <div className="relative p-8 rounded-3xl bg-gradient-to-b from-brand-surface to-brand-accent/10 border border-brand-accent/50 flex flex-col transform md:-translate-y-4 shadow-2xl">
               <div className="absolute top-0 right-0 bg-brand-accent text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">POPULAR</div>
               <h3 className="text-xl font-bold text-white">Pro Master</h3>
               <div className="my-4"><span className="text-4xl font-bold">R$ 49,90</span><span className="text-brand-text-secondary">/mês</span></div>
               <p className="text-brand-text-secondary text-sm mb-8">Poder total para criadores e profissionais.</p>
               
               <ul className="space-y-3 mb-8 flex-1">
                 {['Agentes Avançados (Gemini 3 Pro)', 'Geração de Vídeo (Veo 3.1)', 'Imagens Ilimitadas (Imagen 4)', 'Deep Reasoning (32k tokens)', 'Todos os Cursos', 'Suporte Prioritário'].map(item => (
                   <li key={item} className="flex items-center gap-3 text-sm text-white">
                     <CheckBadgeIcon className="h-5 w-5 text-brand-accent" /> {item}
                   </li>
                 ))}
               </ul>
               
               <button onClick={handleGoogleLogin} disabled={!!isLoading} className="w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accent-hover transition-colors font-bold text-white shadow-lg shadow-brand-accent/25 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isLoading === 'google' ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : null}
                  Fazer Login e Assinar
               </button>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/5 text-center text-brand-text-secondary text-sm">
        <p>&copy; 2024 PromptsIA. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
