import { getRedisClient } from "./client";

/**
 * Redis cache utility for storing and retrieving data with TTL
 */

export interface CacheOptions {
  /**
   * Time to live in seconds (default: 5 seconds)
   */
  ttl?: number;
}

/**
 * Get data from Redis cache
 * @param key - The cache key
 * @returns The cached data or null if not found or error occurred
 */
export async function getCachedData<T = any>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    if (redis.status === "end" || redis.status === "close") {
      await redis.connect();
    }
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
}

/**
 * Set data in Redis cache with TTL
 * @param key - The cache key
 * @param data - The data to cache
 * @param options - Cache options (ttl)
 */
export async function setCachedData<T = any>(
  key: string,
  data: T,
  options: CacheOptions = {},
): Promise<void> {
  const { ttl = 5 } = options;
  try {
    const redis = getRedisClient();
    if (redis.status === "end" || redis.status === "close") {
      await redis.connect();
    }
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error("Redis set error:", error);
  }
}

/**
 * Delete data from Redis cache
 * @param key - The cache key or array of keys
 */
export async function deleteCachedData(key: string | string[]): Promise<void> {
  try {
    const redis = getRedisClient();
    if (redis.status === "end" || redis.status === "close") {
      await redis.connect();
    }
    if (Array.isArray(key)) {
      if (key.length > 0) {
        await redis.del(...key);
      }
    } else {
      await redis.del(key);
    }
  } catch (error) {
    console.error("Redis delete error:", error);
  }
}

/**
 * Delete all keys matching a pattern
 * @param pattern - The pattern to match (e.g., "analytics:*")
 */
export async function deleteCachedDataByPattern(
  pattern: string,
): Promise<void> {
  try {
    const redis = getRedisClient();
    if (redis.status === "end" || redis.status === "close") {
      await redis.connect();
    }
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Redis delete by pattern error:", error);
  }
}

/**
 * Check if a key exists in cache
 * @param key - The cache key
 * @returns true if key exists, false otherwise
 */
export async function hasCachedData(key: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    if (redis.status === "end" || redis.status === "close") {
      await redis.connect();
    }
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error("Redis exists error:", error);
    return false;
  }
}

/**
 * Get remaining TTL for a key in seconds
 * @param key - The cache key
 * @returns TTL in seconds, -1 if key has no expiry, -2 if key doesn't exist
 */
export async function getCacheTTL(key: string): Promise<number> {
  try {
    const redis = getRedisClient();
    if (redis.status === "end" || redis.status === "close") {
      await redis.connect();
    }
    return await redis.ttl(key);
  } catch (error) {
    console.error("Redis TTL error:", error);
    return -2;
  }
}

/**
 * Higher-order function to wrap a data fetcher with caching
 * @param key - The cache key
 * @param fetcher - The function to fetch data if not in cache
 * @param options - Cache options
 * @returns The cached or freshly fetched data
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const cached = await getCachedData<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fetcher();
  await setCachedData(key, data, options);
  return data;
}
