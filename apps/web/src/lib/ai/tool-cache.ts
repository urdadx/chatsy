import { getRedisClient } from "@/lib/redis/client";
import { createCached } from "@ai-sdk-tools/cache";

export const cache = createCached({
  cache: getRedisClient(),
  keyPrefix: "ai-tools:",
  ttl: 30 * 60 * 1000,
});
