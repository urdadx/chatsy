import { getRedisClient } from "./client";

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Optional prefix for the Redis key
   */
  keyPrefix?: string;
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean;

  /**
   * Number of requests remaining in the current window
   */
  remaining: number;

  /**
   * Time in seconds until the rate limit resets
   */
  resetInSeconds: number;

  /**
   * Total limit for the window
   */
  limit: number;
}

/**
 * Check if a request should be rate limited using a sliding window algorithm
 *
 * @param identifier - Unique identifier for the requester (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const redis = getRedisClient();

  try {
    // Ensure Redis is connected
    if (redis.status === "end" || redis.status === "close") {
      await redis.connect();
    }

    const { maxRequests, windowSeconds, keyPrefix = "ratelimit" } = config;
    const key = `${keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    // Use a Redis transaction to ensure atomicity
    const pipeline = redis.pipeline();

    // Remove old entries outside the time window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Count requests in the current window
    pipeline.zcard(key);

    // Add the current request timestamp
    pipeline.zadd(key, now, `${now}`);

    // Set expiration on the key
    pipeline.expire(key, windowSeconds);

    const results = await pipeline.exec();

    if (!results) {
      throw new Error("Redis pipeline execution failed");
    }

    // Get the count before adding the current request
    const count = (results[1]?.[1] as number) || 0;

    const allowed = count < maxRequests;
    const remaining = Math.max(0, maxRequests - count - 1);

    // If not allowed, remove the request we just added
    if (!allowed) {
      await redis.zrem(key, `${now}`);
    }

    // Calculate reset time
    const oldestTimestamp = await redis.zrange(key, 0, 0, "WITHSCORES");
    const resetInSeconds =
      oldestTimestamp.length > 0
        ? Math.ceil(
            (Number.parseInt(oldestTimestamp[1]) + windowSeconds * 1000 - now) /
              1000,
          )
        : windowSeconds;

    return {
      allowed,
      remaining,
      resetInSeconds: Math.max(0, resetInSeconds),
      limit: maxRequests,
    };
  } catch (error) {
    console.error("Rate limit check error:", error);

    // In case of Redis errors, allow the request to proceed
    // This prevents Redis outages from blocking all traffic
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetInSeconds: config.windowSeconds,
      limit: config.maxRequests,
    };
  }
}

/**
 * Get rate limit information for an identifier without incrementing the counter
 *
 * @param identifier - Unique identifier for the requester
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function getRateLimitInfo(
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const redis = getRedisClient();

  try {
    // Ensure Redis is connected
    if (redis.status === "end" || redis.status === "close") {
      await redis.connect();
    }

    const { maxRequests, windowSeconds, keyPrefix = "ratelimit" } = config;
    const key = `${keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    // Remove old entries and count current requests
    await redis.zremrangebyscore(key, 0, windowStart);
    const count = await redis.zcard(key);

    const allowed = count < maxRequests;
    const remaining = Math.max(0, maxRequests - count);

    // Calculate reset time
    const oldestTimestamp = await redis.zrange(key, 0, 0, "WITHSCORES");
    const resetInSeconds =
      oldestTimestamp.length > 0
        ? Math.ceil(
            (Number.parseInt(oldestTimestamp[1]) + windowSeconds * 1000 - now) /
              1000,
          )
        : windowSeconds;

    return {
      allowed,
      remaining,
      resetInSeconds: Math.max(0, resetInSeconds),
      limit: maxRequests,
    };
  } catch (error) {
    console.error("Get rate limit info error:", error);

    return {
      allowed: true,
      remaining: config.maxRequests,
      resetInSeconds: config.windowSeconds,
      limit: config.maxRequests,
    };
  }
}

/**
 * Reset rate limit for a specific identifier
 *
 * @param identifier - Unique identifier for the requester
 * @param keyPrefix - Optional prefix for the Redis key
 */
export async function resetRateLimit(
  identifier: string,
  keyPrefix = "ratelimit",
): Promise<void> {
  const redis = getRedisClient();

  try {
    // Ensure Redis is connected
    if (redis.status === "end" || redis.status === "close") {
      await redis.connect();
    }

    const key = `${keyPrefix}:${identifier}`;
    await redis.del(key);
  } catch (error) {
    console.error("Reset rate limit error:", error);
  }
}
