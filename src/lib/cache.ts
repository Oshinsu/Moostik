/**
 * MOOSTIK - In-Memory Cache System
 *
 * Ce module fournit un système de cache en mémoire avec TTL
 * pour réduire les lectures/écritures de fichiers répétitives.
 */

// ============================================================================
// TYPES
// ============================================================================

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  evictions: number;
}

interface CacheOptions {
  /** Time-to-live in milliseconds (default: 5 minutes) */
  ttl?: number;
  /** Maximum number of entries (default: 100) */
  maxSize?: number;
  /** Enable logging (default: false) */
  debug?: boolean;
}

// ============================================================================
// CACHE IMPLEMENTATION
// ============================================================================

class InMemoryCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats: CacheStats = { hits: 0, misses: 0, size: 0, evictions: 0 };
  private readonly options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl ?? 5 * 60 * 1000, // 5 minutes
      maxSize: options.maxSize ?? 100,
      debug: options.debug ?? false,
    };
  }

  /**
   * Récupère une valeur du cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.log(`MISS: ${key}`);
      return undefined;
    }

    // Vérifier si l'entrée a expiré
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size--;
      this.log(`EXPIRED: ${key}`);
      return undefined;
    }

    this.stats.hits++;
    this.log(`HIT: ${key}`);
    return entry.value;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set(key: string, value: T, ttl?: number): void {
    // Éviter de dépasser la taille maximale
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    const now = Date.now();
    const entry: CacheEntry<T> = {
      value,
      expiresAt: now + (ttl ?? this.options.ttl),
      createdAt: now,
    };

    const isNew = !this.cache.has(key);
    this.cache.set(key, entry);

    if (isNew) {
      this.stats.size++;
    }

    this.log(`SET: ${key}`);
  }

  /**
   * Supprime une entrée du cache
   */
  delete(key: string): boolean {
    const existed = this.cache.delete(key);
    if (existed) {
      this.stats.size--;
      this.log(`DELETE: ${key}`);
    }
    return existed;
  }

  /**
   * Invalide toutes les entrées correspondant à un préfixe
   */
  invalidateByPrefix(prefix: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
        this.stats.size--;
      }
    }
    this.log(`INVALIDATE PREFIX: ${prefix} (${count} entries)`);
    return count;
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.size = 0;
    this.log(`CLEAR: ${size} entries removed`);
  }

  /**
   * Récupère les statistiques du cache
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  /**
   * Évicte les entrées les plus anciennes
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.stats.size--;
      this.log(`EVICT: ${oldestKey}`);
    }
  }

  private log(message: string): void {
    if (this.options.debug) {
      console.log(`[Cache] ${message}`);
    }
  }
}

// ============================================================================
// GLOBAL CACHE INSTANCES
// ============================================================================

/** Cache pour les épisodes (TTL: 30 secondes - données fréquemment modifiées) */
export const episodesCache = new InMemoryCache<unknown>({ ttl: 30 * 1000 });

/** Cache pour les personnages (TTL: 2 minutes) */
export const charactersCache = new InMemoryCache<unknown>({ ttl: 2 * 60 * 1000 });

/** Cache pour les lieux (TTL: 2 minutes) */
export const locationsCache = new InMemoryCache<unknown>({ ttl: 2 * 60 * 1000 });

/** Cache pour les images en base64 (TTL: 10 minutes, max: 50 entrées) */
export const base64Cache = new InMemoryCache<string>({
  ttl: 10 * 60 * 1000,
  maxSize: 50,
});

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Helper pour récupérer une valeur avec fallback
 */
export async function getOrSet<T>(
  cache: InMemoryCache<T>,
  key: string,
  factory: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const value = await factory();
  cache.set(key, value, ttl);
  return value;
}

/**
 * Invalide tous les caches liés à une entité
 */
export function invalidateEntityCaches(type: "episode" | "character" | "location"): void {
  switch (type) {
    case "episode":
      episodesCache.clear();
      break;
    case "character":
      charactersCache.clear();
      break;
    case "location":
      locationsCache.clear();
      break;
  }
}

/**
 * Invalide tous les caches
 */
export function invalidateAllCaches(): void {
  episodesCache.clear();
  charactersCache.clear();
  locationsCache.clear();
  base64Cache.clear();
}

/**
 * Récupère les statistiques de tous les caches
 */
export function getAllCacheStats(): Record<string, ReturnType<InMemoryCache["getStats"]>> {
  return {
    episodes: episodesCache.getStats(),
    characters: charactersCache.getStats(),
    locations: locationsCache.getStats(),
    base64: base64Cache.getStats(),
  };
}

// Export the class for custom instances
export { InMemoryCache };
export type { CacheOptions, CacheStats };
