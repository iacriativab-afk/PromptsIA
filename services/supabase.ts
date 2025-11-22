import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '../types';

// --- CONFIGURAÇÃO DO SUPABASE COM SEGURANÇA ---

// NUNCA coloque chaves reais no código. Sempre use variáveis de ambiente
const getSupabaseConfig = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Em desenvolvimento, avisar se chaves não estão configuradas
    if (!url || !key) {
        console.warn("⚠️ Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas. Configure .env.local");
    }

    return { url: url || '', key: key || '' };
};

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();

// Instância do Supabase
export let supabase: SupabaseClient | null = null;
let isSupabaseInitialized = false;

// Inicializar com validação
if (supabaseUrl && supabaseAnonKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        });
        isSupabaseInitialized = true;
        console.log("⚡ Supabase inicializado com sucesso.");
    } catch (e) {
        console.error("❌ Erro ao inicializar Supabase:", e);
    }
} else {
    console.warn("⚠️ Supabase não será inicializado - chaves de ambiente ausentes.");
}

// --- CONTROLE DE MODO (REAL vs DEMO) ---
const STORAGE_KEY_USER = 'promptsia_user';
const STORAGE_KEY_TIER = 'promptsia_user_tier';

// Validação de dados do localStorage
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

export const fetchProfile = async (sbUser: SupabaseUser): Promise<User> => {
    if (!supabase) return mapSupabaseUser(sbUser, {});

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sbUser.id)
            .single();

        if (error || !data) {
            // Se falhar ao buscar perfil (ex: tabela não existe), retorna dados básicos do Auth
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
    
    try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
        localStorage.setItem(STORAGE_KEY_TIER, 'free');
        window.location.reload();
    } catch (e) {
        console.error("Erro ao salvar usuário visitante:", e);
    }
};

// --- AUTENTICAÇÃO: GOOGLE ---
export const signInWithGoogle = async (): Promise<void> => {
    if (!isSupabaseInitialized || !supabase) {
        if(confirm("Não foi possível conectar ao servidor de login. Deseja entrar como visitante?")) {
            return loginAsGuest();
        }
        return;
    }

    try {
        // Redireciona para a URL atual (funciona local e na Vercel)
        const redirectUrl = window.location.origin;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl
            }
        });
        
        if (error) throw error;
    } catch (error: any) {
        console.error("Erro no login Google:", error);
        alert(`Falha no login com Google: ${error.message || 'Erro desconhecido'}.`);
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
    
    // Tenta persistir se o usuário estiver logado no Supabase
    if (isSupabaseInitialized && supabase && !uid.startsWith('guest-')) {
        try {
            await supabase.from('profiles').update({ tier: 'pro', updated_at: new Date() }).eq('id', uid);
        } catch (e) { console.warn("Erro ao persistir upgrade:", e); }
    }
};

export const downgradeUserTier = async (uid: string, feedback: string) => {
    localStorage.setItem(STORAGE_KEY_TIER, 'free');
    
    if (isSupabaseInitialized && supabase && !uid.startsWith('guest-')) {
        try {
            await supabase.from('profiles').update({ 
                tier: 'free', 
                updated_at: new Date(),
                last_cancellation_reason: feedback 
            }).eq('id', uid);
        } catch (e) { console.warn("Erro ao persistir downgrade:", e); }
    }
};
