// ESTE ARQUIVO FOI DESATIVADO.
// O projeto migrou exclusivamente para Supabase e Vercel.
// Nenhuma função do Firebase deve ser chamada.

export const subscribeToAuthChanges = (callback: any) => {
    console.warn("Firebase foi removido. Use useAuth() com Supabase.");
    callback(null);
    return () => {};
};

export const loginAsGuest = async () => {};
export const signInWithGoogle = async () => {};
export const logoutUser = async () => {};
export const upgradeUserTier = async () => {};
export const downgradeUserTier = async () => {};
