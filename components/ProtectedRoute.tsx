
import React from 'react';
import { User } from '../types';

interface ProtectedRouteProps {
  user: User | null;
  children: React.ReactNode;
}

/**
 * Componente de Rota Protegida (Task 5)
 * Garante que apenas usuários autenticados possam ver o conteúdo filho.
 * Caso contrário, exibe uma mensagem de acesso negado.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, children }) => {
  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-white p-8 text-center">
            <div className="bg-brand-surface border border-white/10 p-8 rounded-2xl max-w-md shadow-2xl">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
                <p className="text-brand-text-secondary mb-6">
                    Você precisa estar autenticado para acessar este conteúdo exclusivo. Por favor, faça login na sua conta.
                </p>
                <p className="text-xs text-brand-text-secondary opacity-50">
                    Se você acabou de deslogar, por favor recarregue a página.
                </p>
            </div>
        </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
