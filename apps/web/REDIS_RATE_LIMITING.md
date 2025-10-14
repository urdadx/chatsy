# Redis Rate Limiting Setup

This project uses Redis for rate limiting API endpoints to prevent abuse and ensure fair usage. The rate limiting is implemented as middleware that can be easily applied to any route.

## Prerequisites

You need to have a Redis server running. You can set one up in several ways:

### Option 1: Using Docker (Recommended)

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:latest
```

### Option 2: Using Docker Compose

Create a `docker-compose.yml` file in your project root:

```yaml
version: '3.8'
services:
  redis:
    image: redis:latest
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  redis-data:
```

Then run:

```bash
docker-compose up -d
```

### Option 3: Installing Redis Locally

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
```

**macOS (using Homebrew):**
```bash
brew install redis
brew services start redis
```

**Arch Linux:**
```bash
sudo pacman -S redis
sudo systemctl start redis
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# Option 1: Use a full Redis URL (recommended)
REDIS_URL=redis://localhost:6379

# Option 2: Use individual connection parameters
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=your_password_here  # Optional
# REDIS_DB=0  # Optional, default is 0
```

### For Production

If you're using a hosted Redis service or Redis with authentication:

```bash
# With password
REDIS_URL=redis://:your_password@your-redis-host:6379

# With username and password (Redis 6+)
REDIS_URL=redis://username:password@your-redis-host:6379
```

## Rate Limits

The following rate limits are currently configured:

### Authenticated Chat API (`/api/chat`)
- **Limit**: 30 requests per minute
- **Key**: `chat:api:{client_ip}`
- **Middleware**: `chatRateLimitMiddleware`
- **Response Headers**:
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Seconds until reset
  - `Retry-After`: Seconds to wait before retrying

### Embedded Chat API (`/api/embed/chat`)
- **Limit**: 20 requests per minute (stricter for public embeds)
- **Key**: `embed:chat:{client_ip}`
- **Middleware**: `embedChatRateLimitMiddleware`
- **Response Headers**: Same as above

## Using Rate Limiting Middleware

### Pre-configured Middlewares

The easiest way to add rate limiting is to use the pre-configured middlewares:

```typescript
import {
  chatRateLimitMiddleware,
  embedChatRateLimitMiddleware,
} from "@/middlewares";

export const ServerRoute = createServerFileRoute("/api/your-route").methods(
  (api) => ({
    POST: api
      .middleware([chatRateLimitMiddleware])
      .handler(async ({ request, context }) => {
        // Your handler code
        // Rate limiting is automatically enforced before this runs
      }),
  }),
);
```

### Custom Rate Limits

You can also create custom rate limits for specific routes:

```typescript
import { rateLimitMiddleware } from "@/middlewares";

export const ServerRoute = createServerFileRoute("/api/custom-route").methods(
  (api) => ({
    POST: api
      .middleware([
        rateLimitMiddleware({
          maxRequests: 100,    // 100 requests
          windowSeconds: 3600, // per hour
          keyPrefix: "custom:api",
        }),
      ])
      .handler(async ({ request, context }) => {
        // Your handler code
      }),
  }),
);
```

### Accessing Rate Limit Info in Context

The rate limit middleware adds information to the request context:

```typescript
.handler(async ({ request, context }) => {
  console.log("Rate limit allowed:", context.rateLimitAllowed);
  console.log("Requests remaining:", context.rateLimitRemaining);
  console.log("Reset in seconds:", context.rateLimitReset);
  console.log("Total limit:", context.rateLimitLimit);
  
  // Your handler code
})
```

### Multiple Middlewares

You can combine rate limiting with other middlewares:

```typescript
import {
  subscriptionMiddleware,
  tokenUsageMiddleware,
  chatRateLimitMiddleware,
} from "@/middlewares";

POST: api
  .middleware([
    subscriptionMiddleware,
    tokenUsageMiddleware,
    chatRateLimitMiddleware, // Rate limiting runs after other checks
  ])
  .handler(async ({ request, context }) => {
    // All middleware checks passed
  })
```

## Testing Rate Limits

You can test the rate limiting by making multiple rapid requests:

```bash
# Test authenticated chat API
for i in {1..35}; do
  curl -X POST http://localhost:3001/api/chat/ \
    -H "Content-Type: application/json" \
    -d '{"id":"test","messages":[]}' \
    -w "\nStatus: %{http_code}\n"
  sleep 0.1
done

# Test embedded chat API
for i in {1..25}; do
  curl -X POST http://localhost:3001/api/embed/chat/your-platform-id \
    -H "Content-Type: application/json" \
    -d '{"id":"test","messages":[]}' \
    -w "\nStatus: %{http_code}\n"
  sleep 0.1
done
```

After the limit is exceeded, you should receive a `429 Too Many Requests` response.

## Monitoring Redis

### Check Redis Connection

```bash
redis-cli ping
# Expected output: PONG
```

### Monitor Rate Limit Keys

```bash
# List all rate limit keys
redis-cli KEYS "ratelimit:*"
redis-cli KEYS "chat:api:*"
redis-cli KEYS "embed:chat:*"

# Check a specific key's entries
redis-cli ZRANGE "chat:api:127.0.0.1" 0 -1 WITHSCORES

# Count requests for a specific IP
redis-cli ZCARD "chat:api:127.0.0.1"

# Clear a specific rate limit
redis-cli DEL "chat:api:127.0.0.1"

# Clear all rate limits
redis-cli KEYS "ratelimit:*" | xargs redis-cli DEL
redis-cli KEYS "chat:api:*" | xargs redis-cli DEL
redis-cli KEYS "embed:chat:*" | xargs redis-cli DEL
```

## Customizing Rate Limits

You can customize rate limits by creating your own middleware instances:

```typescript
import { rateLimitMiddleware } from "@/middlewares";

// Create a custom rate limit for a specific endpoint
const strictRateLimit = rateLimitMiddleware({
  maxRequests: 10,     // Maximum requests
  windowSeconds: 60,   // Time window in seconds
  keyPrefix: "strict:api", // Redis key prefix
});

// Use it in your route
POST: api
  .middleware([strictRateLimit])
  .handler(async ({ request, context }) => {
    // Your handler code
  })
```

### Per-User Rate Limiting

You can implement per-user rate limiting by customizing the identifier:

```typescript
// In your custom middleware file
import { checkRateLimit } from "@/lib/redis/rate-limit";
import { createMiddleware } from "@tanstack/react-start";
import { json } from "@tanstack/react-start";

export const perUserRateLimit = createMiddleware({
  type: "request",
}).server(async ({ request, next }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user.id || "anonymous";

  const rateLimitResult = await checkRateLimit(userId, {
    maxRequests: 50,
    windowSeconds: 60,
    keyPrefix: "user:api",
  });

  if (!rateLimitResult.allowed) {
    throw json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  return await next({ context: { /* ... */ } });
});
```

## Error Handling

The rate limiting implementation is designed to fail open - if Redis is unavailable, requests will be allowed through. This prevents Redis outages from blocking all traffic. However, you should monitor Redis health to ensure rate limiting is working properly.

## Architecture

The rate limiting uses a **sliding window** algorithm implemented with Redis sorted sets:

1. Each request is stored as a member in a sorted set with timestamp as score
2. Old entries outside the time window are removed
3. Current count is checked against the limit
4. If under limit, request is allowed and added to the set
5. If over limit, request is rejected and returns 429

This provides accurate rate limiting without the "burst" issues of fixed window counters.

## Troubleshooting

### Redis Connection Errors

If you see "Redis connection error" in the logs:

1. Check if Redis is running: `redis-cli ping`
2. Verify the connection details in your `.env` file
3. Check firewall rules if Redis is on a different host

### Rate Limits Not Working

1. Check if `REDIS_URL` or Redis connection variables are set correctly
2. Verify Redis is accessible from your application
3. Check the logs for any Redis-related errors

### Redis Memory Usage

If Redis memory usage grows too large:

```bash
# Set maxmemory policy (in redis.conf or via command)
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

This will automatically evict the least recently used keys when memory limit is reached.
