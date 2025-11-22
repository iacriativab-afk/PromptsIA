import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '../types';

// --- CONFIGURAÇÃO DO SUPABASE ---

// FALLBACKS DE SEGURANÇA (Para ambiente de desenvolvimento local sem .env)
const FALLBACK_URL = "https://jczdzujewyylnordhrpp.supabase.co"; 
const FALLBACK_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjemR6dWpld3l5bG5vcmRocnBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MTMzMTAsImV4cCI6MjA3OTI4OTMxMH0.c2hlgDZgbWGvXqbgyNKeEScLdp34y4l7YirxrzD55-c";

let supabaseUrl = FALLBACK_URL;
let supabaseAnonKey = FALLBACK_ANON_KEY;

// Tentativa segura de ler variáveis de ambiente (Vite/Vercel)
try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        if (import.meta.env.VITE_SUPABASE_URL) {
            // @ts-ignore
            supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        }
        // @ts-ignore
        if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
            // @ts-ignore
            supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        }
    }
} catch (e) {
    console.warn("⚠️ Ambiente Vite não detectado ou erro ao ler variáveis. Usando chaves de fallback.");
}

// EXPORTING SUPABASE INSTANCE FOR CONTEXT
export let supabase: SupabaseClient | null = null;
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
    console.error("⚠️ Chaves do Supabase não encontradas.");
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
