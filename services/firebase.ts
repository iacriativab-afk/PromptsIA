
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { User } from '../types';

// --- CONFIGURAÇÃO DO FIREBASE ---
// Nota: Em produção, substitua pelas suas chaves reais.
// Se a inicialização falhar, o app entrará automaticamente em modo MOCK.
const firebaseConfig = {
  apiKey: "AIzaSyBZtPf6RYoxY7wRLIbemQVBJoVLScmXQXI",
  authDomain: "masterhub-d1996.firebaseapp.com",
  projectId: "masterhub-d1996",
  storageBucket: "masterhub-d1996.firebasestorage.app",
  messagingSenderId: "425737674880",
  appId: "1:425737674880:web:5a09a92adb0179a78c0665",
  measurementId: "G-BW2DSGY4B9"
};

// --- INICIALIZAÇÃO ---
let app;
let auth: any;
let db: any;
let isFirebaseInitialized = false;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseInitialized = true;
    console.log("🔥 Firebase conectado com sucesso.");
} catch (e) {
    console.warn("⚠️ Firebase não pôde ser inicializado (Provavelmente falta de config ou ambiente restrito). Rodando em Modo Offline/Mock.");
}

// --- CONTROLE DE MODO (REAL vs DEMO) ---
const STORAGE_KEY_USER = 'masterhub_user';
const STORAGE_KEY_TIER = 'masterhub_user_tier';

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

    // 2. Se o Firebase estiver ativo, usa o listener real
    if (isFirebaseInitialized && auth) {
        return onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                let userProfile = null;
                try {
                    userProfile = await getUserProfile(firebaseUser.uid);
                } catch (err) {
                    console.warn("Não foi possível ler o perfil do banco de dados. Usando dados básicos.");
                }
                
                const user: User = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'Usuário',
                    email: firebaseUser.email || '',
                    avatar: firebaseUser.photoURL || undefined,
                    tier: userProfile?.tier || 'free',
                    joinDate: userProfile?.joinedAt?.toDate?.().toISOString() || new Date().toISOString()
                };
                
                if (!userProfile) {
                    await createUserProfile(user);
                }
                
                callback(user);
            } else {
                callback(null);
            }
        });
    } else {
        // Fallback: Nenhum usuário logado e Firebase inativo
        callback(null);
        return () => {};
    }
};

// --- AUTENTICAÇÃO: MODO VISITANTE (GUEST) ---
export const loginAsGuest = async (): Promise<void> => {
    const mockUser: User = {
        id: `guest-${Date.now()}`,
        name: 'Visitante MasterHub',
        email: 'visitante@masterhub.demo',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=MasterHubGuest',
        tier: 'free',
        joinDate: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    localStorage.setItem(STORAGE_KEY_TIER, 'free');
    
    // Força um reload para que o subscribeToAuthChanges pegue o novo estado imediatamente
    // Isso garante uma limpeza de estado limpa
    window.location.reload();
};

// --- AUTENTICAÇÃO: GOOGLE ---
export const signInWithGoogle = async (): Promise<void> => {
    if (!isFirebaseInitialized || !auth) {
        console.log("Firebase inativo, usando login de visitante.");
        return loginAsGuest();
    }

    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error: any) {
        console.error("Erro detalhado no login Google:", error);
        
        // Tratamento específico para domínio não autorizado
        // Se o domínio não estiver na allowlist do Firebase, cai automaticamente no modo visitante
        if (error.code === 'auth/unauthorized-domain' || 
            error.code === 'auth/operation-not-allowed' ||
            error.message?.includes('unauthorized-domain')) {
            
            console.warn("Domínio não autorizado no Firebase. Redirecionando para Modo Visitante.");
            return loginAsGuest();
        }
        
        throw error;
    }
};

export const logoutUser = async (): Promise<void> => {
    // Limpa mock storage
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TIER);

    // Tenta logout do Firebase se estiver ativo
    if (isFirebaseInitialized && auth) {
        try {
            await signOut(auth);
        } catch (e) {
            console.warn("Erro ao deslogar do Firebase (pode ser irrelevante se estava em modo mock)", e);
        }
    }
    
    window.location.reload();
};

// --- FIRESTORE (COM FALLBACK MOCK) ---

const createUserProfile = async (user: User) => {
    if (!isFirebaseInitialized || !db) return;
    try {
        const userRef = doc(db, 'users', user.id);
        await setDoc(userRef, {
            name: user.name,
            email: user.email,
            photoURL: user.avatar,
            tier: 'free',
            joinedAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        // Silently fail in demo/mock environments
    }
};

const getUserProfile = async (uid: string) => {
    if (!isFirebaseInitialized || !db) return null;
    try {
        const userRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
    } catch (e) {
        // Silently fail
    }
    return null;
};

export const upgradeUserTier = async (uid: string) => {
    // Prioridade para atualização Local (para funcionar a UI)
    localStorage.setItem(STORAGE_KEY_TIER, 'pro');
    
    // Tenta atualizar no servidor se possível
    if (isFirebaseInitialized && db) {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                tier: 'pro',
                updatedAt: serverTimestamp()
            });
        } catch (e) {
            console.warn("Não foi possível persistir upgrade no Firestore (Modo Offline/Restrito).");
        }
    }
};

export const downgradeUserTier = async (uid: string, feedback: string) => {
    // Prioridade para atualização Local
    localStorage.setItem(STORAGE_KEY_TIER, 'free');
    
    if (isFirebaseInitialized && db) {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                tier: 'free',
                updatedAt: serverTimestamp(),
                lastCancellationReason: feedback
            });
        } catch (e) {
             console.warn("Não foi possível persistir downgrade no Firestore.");
        }
    }
};
