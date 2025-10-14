/**
 * Redis utilities barrel export
 * Centralized exports for all Redis-related functionality
 */

// Client
export { closeRedisClient, getRedisClient } from "./client";

// Cache utilities
export {
  deleteCachedData,
  deleteCachedDataByPattern,
  getCachedData,
  getCacheTTL,
  hasCachedData,
  setCachedData,
  withCache,
  type CacheOptions,
} from "./cache";

// Rate limiting
export { checkRateLimit, type RateLimitConfig } from "./rate-limit";

// Utils
export { getClientIdentifier } from "./utils";
