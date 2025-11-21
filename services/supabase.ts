
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '../types';

// --- CONFIGURAÇÃO DO SUPABASE ---
// Casting 'import.meta' para 'any' para evitar erros de TypeScript com 'env'
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;
let isSupabaseInitialized = false;

if (supabaseUrl && supabaseAnonKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        isSupabaseInitialized = true;
        console.log("⚡ Supabase conectado.");
    } catch (e) {
        console.error("⚠️ Falha crítica ao inicializar cliente Supabase:", e);
    }
} else {
    console.error("⚠️ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas. Verifique seu arquivo .env.local.");
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
        // Tenta pegar a sessão atual imediatamente
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchProfile(session.user).then(user => callback(user));
            } else {
                callback(null);
            }
        }).catch((err) => {
             console.warn("Erro ao buscar sessão inicial:", err);
             callback(null); 
        });

        // Escuta mudanças de estado (login, logout, etc)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const user = await fetchProfile(session.user);
                callback(user);
            } else if (event === 'SIGNED_OUT') {
                callback(null);
            }
        });

        return () => subscription.unsubscribe();
    } else {
        // Fallback: Backend inativo
        callback(null);
        return () => {};
    }
};

const fetchProfile = async (sbUser: SupabaseUser): Promise<User> => {
    if (!supabase) return mapSupabaseUser(sbUser, {});

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sbUser.id)
            .single();

        if (error || !data) {
            return mapSupabaseUser(sbUser, {});
        }
        return mapSupabaseUser(sbUser, data);
    } catch (e) {
        console.error("Erro ao buscar perfil:", e);
        return mapSupabaseUser(sbUser, {});
    }
};

// --- AUTENTICAÇÃO: MODO VISITANTE ---
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
    window.location.reload();
};

// --- AUTENTICAÇÃO: GOOGLE ---
export const signInWithGoogle = async (): Promise<void> => {
    if (!isSupabaseInitialized || !supabase) {
        alert("Supabase não configurado corretamente (faltam chaves no .env). Tentando modo visitante.");
        return loginAsGuest();
    }

    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin // Garante retorno para a URL correta
            }
        });
        
        if (error) throw error;
    } catch (error: any) {
        console.error("Erro no login Google:", error);
        alert(`Falha no login com Google: ${error.message || 'Erro desconhecido'}. Por favor, tente novamente ou verifique se os pop-ups estão permitidos.`);
        throw error;
    }
};

export const logoutUser = async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TIER);
    localStorage.removeItem('PROMPTSIA_API_KEY'); 

    if (isSupabaseInitialized && supabase) {
        await supabase.auth.signOut();
    }
    window.location.reload();
};

// --- GERENCIAMENTO DE ASSINATURA ---
export const upgradeUserTier = async (uid: string) => {
    localStorage.setItem(STORAGE_KEY_TIER, 'pro');
    if (isSupabaseInitialized && supabase) {
        try {
            await supabase.from('profiles').update({ tier: 'pro', updated_at: new Date() }).eq('id', uid);
        } catch (e) { console.warn("Erro ao persistir upgrade:", e); }
    }
};

export const downgradeUserTier = async (uid: string, feedback: string) => {
    localStorage.setItem(STORAGE_KEY_TIER, 'free');
    if (isSupabaseInitialized && supabase) {
        try {
            await supabase.from('profiles').update({ 
                tier: 'free', 
                updated_at: new Date(),
                last_cancellation_reason: feedback 
            }).eq('id', uid);
        } catch (e) { console.warn("Erro ao persistir downgrade:", e); }
    }
};
