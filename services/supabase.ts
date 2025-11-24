
import type { User } from '../types';

// --- MOCK SERVICE (NO BACKEND) ---
// Este arquivo substitui a conexão real com o Supabase para garantir
// que o deploy funcione sem erros de banco de dados.

export const supabase = null; // Removemos a instância real

// Mock User Data
const MOCK_USER: User = {
    id: 'mock-user-id',
    name: 'Usuário Demo',
    email: 'demo@prompts.ia',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
    tier: 'free', // Começa como free para testar o fluxo, ou mude para 'pro'
    joinDate: new Date().toISOString()
};

const STORAGE_KEY_USER = 'promptsia_user';
const STORAGE_KEY_TIER = 'promptsia_user_tier';

// --- AUTHENTICATION MOCKS ---

export const loginAsGuest = async (): Promise<void> => {
    const guestUser = { ...MOCK_USER, id: `guest-${Date.now()}`, name: 'Visitante' };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(guestUser));
    localStorage.setItem(STORAGE_KEY_TIER, 'free');
    window.location.reload();
};

export const signInWithGoogle = async (): Promise<void> => {
    // Simula um login bem-sucedido
    const proUser = { ...MOCK_USER, tier: 'free' }; // Começa free, usuário faz upgrade na UI
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(proUser));
    // Não recarregamos a página forçadamente aqui para permitir transições suaves, 
    // mas num app real haveria redirect.
    window.location.reload();
};

export const logoutUser = async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TIER);
    localStorage.removeItem('PROMPTSIA_API_KEY');
    window.location.reload();
};

export const fetchProfile = async (sbUser: any): Promise<User> => {
    // Retorna o usuário do localStorage ou o Mock
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    if (stored) {
        const u = JSON.parse(stored);
        // Garante que o tier esteja sincronizado
        u.tier = localStorage.getItem(STORAGE_KEY_TIER) as 'free' | 'pro' || u.tier;
        return u;
    }
    return MOCK_USER;
};

// --- SUBSCRIPTION MOCKS ---

export const upgradeUserTier = async (uid: string) => {
    console.log("Mock Upgrade Triggered");
    localStorage.setItem(STORAGE_KEY_TIER, 'pro');
    // Atualiza o objeto do usuário no storage também se necessário
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    if (stored) {
        const u = JSON.parse(stored);
        u.tier = 'pro';
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
    }
    return true;
};

export const downgradeUserTier = async (uid: string, feedback: string) => {
    console.log("Mock Downgrade Triggered", feedback);
    localStorage.setItem(STORAGE_KEY_TIER, 'free');
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    if (stored) {
        const u = JSON.parse(stored);
        u.tier = 'free';
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
    }
    return true;
};
