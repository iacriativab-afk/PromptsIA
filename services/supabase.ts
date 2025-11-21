import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '../types';

// --- CONFIGURAÇÃO DO SUPABASE ---
// Credenciais fornecidas
const SUPABASE_URL = 'https://xetccgvlikqyevrxgdxf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbgcioijiuzi1niisinr5cci6ikpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldGNjZ3ZsaWtxeWV2cnhnZHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzkwNzksImV4cCI6MjA3OTMxNTA3OX0.jmMmZx9kHoLdfx3PbeR6hHDitz8W3qBF3t4fMod8gU4';

let supabase: SupabaseClient | null = null;
let isSupabaseInitialized = false;

try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    isSupabaseInitialized = true;
    console.log("⚡ Supabase conectado com sucesso.");
} catch (e) {
    console.warn("⚠️ Falha ao inicializar Supabase. Rodando em modo Mock/Offline.", e);
}

// --- CONTROLE DE MODO (REAL vs DEMO) ---
const STORAGE_KEY_USER = 'promptsia_user';
const STORAGE_KEY_TIER = 'promptsia_user_tier';

// Helper para mapear usuário do Supabase para nosso tipo User
const mapSupabaseUser = (sbUser: SupabaseUser, profileData: any): User => {
    return {
        id: sbUser.id,
        name: profileData?.name || sbUser.user_metadata?.full_name || 'Usuário',
        email: sbUser.email || '',
        avatar: profileData?.avatar_url || sbUser.user_metadata?.avatar_url,
        tier: profileData?.tier || 'free',
        joinDate: sbUser.created_at
    };
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    // 1. Verifica se há um usuário "Mock/Visitante" salvo localmente
    const savedMockUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedMockUser) {
        try {
            const parsed = JSON.parse(savedMockUser);
            // Atualiza o tier baseado no localStorage para simular persistência de planos
            const currentTier = localStorage.getItem(STORAGE_KEY_TIER) as 'free' | 'pro' || parsed.tier;
            callback({ ...parsed, tier: currentTier });
        } catch (e) {
            console.error("Erro ao ler usuário do localStorage", e);
            callback(null);
        }
        return () => {};
    }

    // 2. Se o Supabase estiver ativo, usa o listener real
    if (isSupabaseInitialized && supabase) {
        // Check session inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchProfile(session.user).then(user => callback(user));
            } else {
                callback(null);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const user = await fetchProfile(session.user);
                callback(user);
            } else {
                callback(null);
            }
        });

        return () => subscription.unsubscribe();
    } else {
        // Fallback: Nenhum usuário logado e Backend inativo
        callback(null);
        return () => {};
    }
};

// Recupera perfil da tabela 'profiles' ou cria se não existir
const fetchProfile = async (sbUser: SupabaseUser): Promise<User> => {
    if (!supabase) return mapSupabaseUser(sbUser, {});

    try {
        // Tenta buscar o perfil
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sbUser.id)
            .single();

        if (error || !data) {
            // Se não existe perfil (ou erro de RLS/Tabela), apenas retorna o user metadata
            return mapSupabaseUser(sbUser, {});
        }

        return mapSupabaseUser(sbUser, data);
    } catch (e) {
        console.error("Erro ao buscar perfil", e);
        return mapSupabaseUser(sbUser, {});
    }
};

// --- AUTENTICAÇÃO: MODO VISITANTE (GUEST) ---
export const loginAsGuest = async (): Promise<void> => {
    const mockUser: User = {
        id: `guest-${Date.now()}`,
        name: 'Visitante PromptsIA',
        email: 'visitante@promptsia.demo',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=PromptsIAGuest',
        tier: 'free',
        joinDate: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    localStorage.setItem(STORAGE_KEY_TIER, 'free');
    
    // Força reload para limpar estado e redirecionar para o app
    window.location.reload();
};

// --- AUTENTICAÇÃO: GOOGLE ---
export const signInWithGoogle = async (): Promise<void> => {
    if (!isSupabaseInitialized || !supabase) {
        console.log("Supabase inativo, usando login de visitante.");
        return loginAsGuest();
    }

    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
    } catch (error: any) {
        console.error("Erro detalhado no login Google:", error);
        
        // Tratamento para erro de Provider não habilitado
        const errorMessage = error.message || error.msg || JSON.stringify(error);
        
        if (errorMessage.includes('provider is not enabled') || errorMessage.includes('Unsupported provider') || error.code === 'validation_failed') {
            alert("⚠️ Atenção: O Login com Google não está ativado no painel do Supabase.\n\nPara testar agora, use o botão 'Acesso Visitante' na tela inicial.\n\n(Para corrigir: Vá ao Supabase > Authentication > Providers > Google e ative-o).");
        } else {
            alert(`Erro na autenticação: ${errorMessage}. Tente usar o Acesso Visitante.`);
        }
    }
};

export const logoutUser = async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TIER);

    if (isSupabaseInitialized && supabase) {
        await supabase.auth.signOut();
    }
    
    window.location.reload();
};

// --- GERENCIAMENTO DE ASSINATURA ---

export const upgradeUserTier = async (uid: string) => {
    // Atualização Local (Otimista/Mock)
    localStorage.setItem(STORAGE_KEY_TIER, 'pro');
    
    // Atualização no Banco (Se conectado e tabela existir)
    if (isSupabaseInitialized && supabase) {
        try {
            // Tenta atualizar se a tabela profiles existir
            await supabase
                .from('profiles')
                .update({ tier: 'pro', updated_at: new Date() })
                .eq('id', uid);
        } catch (e) {
            console.warn("Não foi possível persistir upgrade no Supabase (Tabela profiles pode não existir).");
        }
    }
};

export const downgradeUserTier = async (uid: string, feedback: string) => {
    // Atualização Local
    localStorage.setItem(STORAGE_KEY_TIER, 'free');
    
    if (isSupabaseInitialized && supabase) {
        try {
            // Log do motivo do cancelamento
            await supabase
                .from('profiles')
                .update({ 
                    tier: 'free', 
                    updated_at: new Date(),
                    last_cancellation_reason: feedback 
                })
                .eq('id', uid);
        } catch (e) {
             console.warn("Não foi possível persistir downgrade no Supabase.");
        }
    }
};