import type { RateLimitConfig } from "@/lib/redis/rate-limit";
import { checkRateLimit } from "@/lib/redis/rate-limit";
import { getClientIdentifier } from "@/lib/redis/utils";
import { createMiddleware } from "@tanstack/react-start";
import { json } from "@tanstack/react-start";

interface RateLimitContext {
  rateLimitAllowed: boolean;
  rateLimitRemaining: number;
  rateLimitReset: number;
  rateLimitLimit: number;
}

/**
 * Creates a rate limiting middleware for API routes
 *
 * @param config - Rate limit configuration
 * @returns A middleware function that enforces rate limits
 *
 * @example
 * ```typescript
 * // In your route file
 * POST: api
 *   .middleware([
 *     rateLimitMiddleware({
 *       maxRequests: 30,
 *       windowSeconds: 60,
 *       keyPrefix: "chat:api",
 *     })
 *   ])
 *   .handler(async ({ request, context }) => {
 *     // Your handler code
 *   })
 * ```
 */
export function rateLimitMiddleware(config: RateLimitConfig) {
  return createMiddleware({
    type: "request",
  }).server(async ({ request, next }) => {
    try {
      const clientIp = getClientIdentifier(request);
      const rateLimitResult = await checkRateLimit(clientIp, config);

      if (!rateLimitResult.allowed) {
        throw json(
          {
            error: "Too many requests. Please try again later.",
            retryAfter: rateLimitResult.resetInSeconds,
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": rateLimitResult.limit.toString(),
              "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
              "X-RateLimit-Reset": rateLimitResult.resetInSeconds.toString(),
              "Retry-After": rateLimitResult.resetInSeconds.toString(),
            },
          },
        );
      }

      return await next({
        context: {
          rateLimitAllowed: rateLimitResult.allowed,
          rateLimitRemaining: rateLimitResult.remaining,
          rateLimitReset: rateLimitResult.resetInSeconds,
          rateLimitLimit: rateLimitResult.limit,
        } satisfies RateLimitContext,
      });
    } catch (error) {
      console.error("💥 Error in rate limit middleware:", error);

      // Allow the request to proceed in case of errors
      return await next({
        context: {
          rateLimitAllowed: true,
          rateLimitRemaining: config.maxRequests,
          rateLimitReset: config.windowSeconds,
          rateLimitLimit: config.maxRequests,
        } satisfies RateLimitContext,
      });
    }
  });
}

/**
 * Pre-configured rate limit middleware for authenticated chat API
 * 30 requests per minute
 */
export const chatRateLimitMiddleware = rateLimitMiddleware({
  maxRequests: 30,
  windowSeconds: 60,
  keyPrefix: "chat:api",
});

/**
 * Pre-configured rate limit middleware for embedded chat API
 * 20 requests per minute (stricter for public embeds)
 */
export const embedChatRateLimitMiddleware = rateLimitMiddleware({
  maxRequests: 20,
  windowSeconds: 60,
  keyPrefix: "embed:chat",
});
