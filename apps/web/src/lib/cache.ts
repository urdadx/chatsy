// ============================================================================
// Cache Utility with TTL and Invalidation Support
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of cache entries
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 60000; // 1 minute default
  private maxSize = 100; // Default max size

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Enforce max size by removing oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Invalidate a specific cache key
   */
  invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching a pattern
   */
  invalidatePattern(pattern: string | RegExp): number {
    let count = 0;
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Configure cache settings
   */
  configure(options: CacheOptions): void {
    if (options.ttl !== undefined) {
      this.defaultTTL = options.ttl;
    }
    if (options.maxSize !== undefined) {
      this.maxSize = options.maxSize;
    }
  }
}

// Global cache instance
export const cache = new CacheManager();

/**
 * Higher-order function to wrap async functions with caching
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  options?: { ttl?: number },
): Promise<T> {
  // Try to get from cache
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function and cache result
  const result = await fn();
  cache.set(key, result, options?.ttl);

  return result;
}

/**
 * Helper to generate cache keys
 */
export const cacheKeys = {
  sources: {
    count: (userId: string, chatbotId: string) =>
      `sources:count:${userId}:${chatbotId}`,
    invalidate: (userId: string, chatbotId: string) =>
      cache.invalidate(cacheKeys.sources.count(userId, chatbotId)),
  },

  chatbot: {
    embed: (identifier: string) => `chatbot:embed:${identifier}`,
    invalidate: (identifier: string) =>
      cache.invalidate(cacheKeys.chatbot.embed(identifier)),
    invalidateAll: () => cache.invalidatePattern(/^chatbot:embed:/),
  },

  action: {
    get: (actionId: string, chatbotId: string) =>
      `action:${actionId}:${chatbotId}`,
    invalidate: (actionId: string, chatbotId: string) =>
      cache.invalidate(cacheKeys.action.get(actionId, chatbotId)),
    invalidateByChatbot: (chatbotId: string) =>
      cache.invalidatePattern(new RegExp(`^action:.*:${chatbotId}$`)),
  },

  analytics: {
    data: (chatbotId: string) => `analytics:${chatbotId}`,
    invalidate: (chatbotId: string) =>
      cache.invalidate(cacheKeys.analytics.data(chatbotId)),
  },
};
