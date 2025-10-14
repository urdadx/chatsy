# Redis Cache Utility

A comprehensive Redis caching utility for the Padyna project. This provides reusable functions for caching data across all routes.

## Location

`src/lib/redis/cache.ts`

## Installation

The utility is already set up and ready to use. Simply import the functions you need:

```typescript
import {
  getCachedData,
  setCachedData,
  deleteCachedData,
  withCache,
} from "@/lib/redis/cache";

// Or import from the barrel export
import { getCachedData, setCachedData } from "@/lib/redis";
```

## Basic Usage

### 1. Simple Get/Set Pattern

```typescript
import { getCachedData, setCachedData } from "@/lib/redis/cache";

export const ServerRoute = createServerFileRoute("/api/users").methods({
  GET: async ({ request }) => {
    const cacheKey = "users:list";
    
    // Try to get from cache
    const cached = await getCachedData<User[]>(cacheKey);
    if (cached) {
      return json(cached);
    }

    // Fetch from database
    const users = await db.query.users.findMany();

    // Store in cache with 60 second TTL
    await setCachedData(cacheKey, users, { ttl: 60 });

    return json(users);
  },
});
```

### 2. Using the `withCache` Helper (Recommended)

The `withCache` function is a higher-order function that simplifies the get-or-fetch pattern:

```typescript
import { withCache } from "@/lib/redis/cache";

export const ServerRoute = createServerFileRoute("/api/products").methods({
  GET: async ({ request }) => {
    const products = await withCache(
      "products:list",
      async () => {
        // This function only runs if cache miss
        return await db.query.products.findMany();
      },
      { ttl: 300 } // 5 minutes
    );

    return json(products);
  },
});
```

### 3. Invalidating Cache

```typescript
import { deleteCachedData } from "@/lib/redis/cache";

export const ServerRoute = createServerFileRoute("/api/products").methods({
  POST: async ({ request }) => {
    const data = await request.json();
    
    // Create product
    await db.insert(products).values(data);

    // Invalidate cache
    await deleteCachedData("products:list");

    return json({ success: true });
  },
});
```

### 4. Deleting Multiple Keys or Patterns

```typescript
import { deleteCachedData, deleteCachedDataByPattern } from "@/lib/redis/cache";

// Delete multiple specific keys
await deleteCachedData(["users:1", "users:2", "users:3"]);

// Delete all keys matching a pattern
await deleteCachedDataByPattern("users:*");
```

### 5. Check if Cache Exists

```typescript
import { hasCachedData } from "@/lib/redis/cache";

const exists = await hasCachedData("users:123");
if (exists) {
  console.log("Cache hit!");
}
```

### 6. Get Remaining TTL

```typescript
import { getCacheTTL } from "@/lib/redis/cache";

const ttl = await getCacheTTL("users:123");
console.log(`Cache expires in ${ttl} seconds`);
// Returns -1 if key has no expiry
// Returns -2 if key doesn't exist
```

## API Reference

### `getCachedData<T>(key: string): Promise<T | null>`
Retrieves data from Redis cache.
- Returns `null` if not found or error occurred
- Automatically parses JSON

### `setCachedData<T>(key: string, data: T, options?: CacheOptions): Promise<void>`
Stores data in Redis cache with TTL.
- **Options:**
  - `ttl`: Time to live in seconds (default: 5)
- Automatically stringifies JSON

### `deleteCachedData(key: string | string[]): Promise<void>`
Deletes one or more keys from cache.
- Accepts single key or array of keys

### `deleteCachedDataByPattern(pattern: string): Promise<void>`
Deletes all keys matching a pattern.
- Example: `"analytics:*"`, `"user:*:profile"`

### `hasCachedData(key: string): Promise<boolean>`
Checks if a key exists in cache.

### `getCacheTTL(key: string): Promise<number>`
Gets remaining TTL for a key in seconds.

### `withCache<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions): Promise<T>`
Higher-order function to wrap a data fetcher with caching.
- Checks cache first
- Calls fetcher if cache miss
- Stores result in cache
- Returns data

## Best Practices

### 1. Use Namespaced Keys

```typescript
// Good - namespaced and specific
"users:123:profile"
"analytics:chatbot-abc:stats"
"products:category:electronics"

// Bad - too generic
"data"
"cache"
"123"
```

### 2. Set Appropriate TTLs

```typescript
// Frequently changing data - short TTL
await setCachedData("analytics:realtime", data, { ttl: 5 });

// Semi-static data - medium TTL
await setCachedData("products:list", products, { ttl: 300 }); // 5 min

// Rarely changing data - long TTL
await setCachedData("countries:list", countries, { ttl: 86400 }); // 24 hours
```

### 3. Always Invalidate on Updates

```typescript
// When updating data, invalidate related caches
await db.update(users).set({ name: "John" }).where(eq(users.id, userId));
await deleteCachedData(`users:${userId}:profile`);
```

### 4. Use Type Safety

```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Type-safe cache retrieval
const profile = await getCachedData<UserProfile>(`users:${userId}:profile`);
if (profile) {
  // TypeScript knows this is UserProfile
  console.log(profile.name);
}
```

### 5. Handle Cache Failures Gracefully

The cache functions automatically handle errors and return null/void, so your application won't break if Redis is down. However, always have a fallback:

```typescript
const cached = await getCachedData("key");
if (cached) {
  return cached;
}

// Always fetch from source if cache miss
const data = await fetchFromDatabase();
await setCachedData("key", data, { ttl: 60 });
return data;
```

## Example: Complete Route with Caching

```typescript
import { db } from "@/db";
import { chatbots } from "@/db/schema";
import { deleteCachedData, withCache } from "@/lib/redis/cache";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute("/api/chatbots/:id").methods({
  GET: async ({ params }) => {
    const chatbot = await withCache(
      `chatbots:${params.id}`,
      async () => {
        return await db.query.chatbots.findFirst({
          where: eq(chatbots.id, params.id),
        });
      },
      { ttl: 60 }
    );

    if (!chatbot) {
      return json({ error: "Not found" }, { status: 404 });
    }

    return json(chatbot);
  },

  PATCH: async ({ params, request }) => {
    const data = await request.json();
    
    await db.update(chatbots)
      .set(data)
      .where(eq(chatbots.id, params.id));

    // Invalidate cache
    await deleteCachedData(`chatbots:${params.id}`);

    return json({ success: true });
  },

  DELETE: async ({ params }) => {
    await db.delete(chatbots).where(eq(chatbots.id, params.id));

    // Invalidate cache
    await deleteCachedData(`chatbots:${params.id}`);

    return json({ success: true });
  },
});
```

## Performance Considerations

1. **Cache Size**: Redis stores data in memory. Be mindful of large datasets.
2. **Serialization**: Large objects take time to serialize/deserialize.
3. **Network Latency**: Redis operations are async and involve network calls.
4. **TTL Balance**: Too short = frequent DB hits, too long = stale data.

## Monitoring

Check cache hit rates and performance in your Redis dashboard or using Redis commands:

```bash
# Connect to Redis CLI
redis-cli

# Get cache statistics
INFO stats

# Monitor cache operations in real-time
MONITOR
```
