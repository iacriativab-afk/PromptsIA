/**
 * Configuração de Rate Limiting e Cache
 * Previne abuso de API e melhora performance
 */

// Rate limiting para chamadas de API (evitar DDoS)
export class RateLimiter {
    private requestCounts: Map<string, number[]> = new Map();
    private maxRequests: number;
    private windowMs: number;

    constructor(maxRequests: number = 10, windowMs: number = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    isAllowed(key: string): boolean {
        const now = Date.now();
        const requests = this.requestCounts.get(key) || [];
        
        // Remove old requests outside the window
        const recentRequests = requests.filter(time => now - time < this.windowMs);
        
        if (recentRequests.length >= this.maxRequests) {
            return false;
        }
        
        recentRequests.push(now);
        this.requestCounts.set(key, recentRequests);
        return true;
    }

    getRemainingRequests(key: string): number {
        const now = Date.now();
        const requests = this.requestCounts.get(key) || [];
        const recentRequests = requests.filter(time => now - time < this.windowMs);
        return Math.max(0, this.maxRequests - recentRequests.length);
    }
}

// Cache simples com expiração
export class CacheManager<T> {
    private cache: Map<string, { data: T; timestamp: number }> = new Map();
    private ttl: number; // Time to live em milissegundos

    constructor(ttlMs: number = 300000) { // Default 5 minutos
        this.ttl = ttlMs;
    }

    set(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    get(key: string): T | null {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        // Verificar se expirou
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }

    clear(): void {
        this.cache.clear();
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }
}

// Debounce para evitar múltiplas chamadas
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (...args: Parameters<T>) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
            timeoutId = null;
        }, wait);
    };
}

// Throttle para limitar frequência de chamadas
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return function (...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

// Instâncias globais
export const geminiRateLimiter = new RateLimiter(5, 60000); // 5 requests por minuto
export const apiCacheManager = new CacheManager<any>(300000); // Cache de 5 minutos
