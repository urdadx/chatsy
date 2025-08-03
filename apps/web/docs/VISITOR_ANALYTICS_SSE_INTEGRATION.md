# Real-Time Visitor Analytics Integration Guide

This guide shows you how to integrate your existing `getVisitorHistory` function with the SSE (Server-Sent Events) system for real-time updates.

## What's New

The `getVisitorHistory` function has been enhanced with:

1. **Real-time updates**: Automatically invalidates and refetches data when new visitor analytics arrive via SSE
2. **Consistent API**: Same interface whether using real-time or static data
3. **Connection management**: Automatic reconnection with exponential backoff
4. **Resource optimization**: Pauses connections when tab is hidden

## Available Hooks

### 1. `useVisitorHistory` (Recommended)
The unified hook that automatically chooses between static and real-time versions:

```typescript
// Real-time version
const { data, isLoading, isConnected, reconnect, disconnect } = useVisitorHistory("24h", true);

// Static version  
const { data, isLoading, isConnected } = useVisitorHistory("24h", false);
```

### 2. `useRealTimeVisitorHistory` 
Direct access to the real-time hook:

```typescript
const { data, isLoading, isConnected, reconnect, disconnect } = useRealTimeVisitorHistory("7d");
```

### 3. `getVisitorHistory` (Legacy)
The original static-only version (still available for backward compatibility):

```typescript
const { data, isLoading } = getVisitorHistory("24h");
```

## Migration Guide

### Before (Static Only)
```typescript
import { getVisitorHistory } from "@/hooks/use-visitor-analytics";

export function MyComponent() {
  const { data: analytics, isLoading } = getVisitorHistory("24h");
  
  return (
    <div>
      {isLoading ? <Spinner /> : <div>Visitors: {analytics?.length}</div>}
    </div>
  );
}
```

### After (Real-time Enabled)
```typescript
import { useVisitorHistory } from "@/hooks/use-visitor-analytics";

export function MyComponent() {
  const { data: analytics, isLoading, isConnected } = useVisitorHistory("24h", true);
  
  return (
    <div>
      <div className="flex items-center gap-2">
        <h3>Visitor Analytics</h3>
        {isConnected ? (
          <span className="text-green-600 text-xs">● Live</span>
        ) : (
          <span className="text-gray-500 text-xs">● Static</span>
        )}
      </div>
      {isLoading ? <Spinner /> : <div>Visitors: {analytics?.length}</div>}
    </div>
  );
}
```

## Key Changes Made

### 1. Enhanced `use-visitor-analytics.ts`
- Added `useRealTimeVisitorHistory` hook that connects to SSE stream
- Modified `getVisitorHistory` to use 5-minute stale time instead of infinity
- Added `useVisitorHistory` helper hook with consistent interface
- Added `VisitorHistoryResult` interface for type safety

### 2. SSE Integration
- Listens to `/api/analytics-stream` endpoint
- Automatically invalidates `["visitor-analytics"]` queries when new data arrives
- Handles connection errors with exponential backoff (1s, 2s, 4s, 8s, 16s)
- Pauses/resumes connection based on tab visibility

### 3. Performance Optimizations
- Connection sharing: Multiple components using the same filter share one SSE connection
- Resource cleanup: Automatic disconnection on component unmount
- Tab visibility optimization: Pauses connections when tab is hidden

## Connection States

| State | Description | Indicator |
|-------|-------------|-----------|
| `isConnected: true` | SSE connected, receiving real-time updates | 🟢 Live |
| `isConnected: false` | Using static data, no real-time updates | 🔴 Static |

## Best Practices

### 1. Choose the Right Mode
```typescript
// Use real-time for live dashboards
const liveData = useVisitorHistory("24h", true);

// Use static for historical charts that don't need live updates
const historicalData = useVisitorHistory("90d", false);
```

### 2. Show Connection Status
```typescript
const { isConnected } = useVisitorHistory("24h", true);

return (
  <div className="flex items-center gap-2">
    <h3>Analytics</h3>
    {isConnected ? (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Live
      </span>
    ) : (
      <span className="flex items-center gap-1 text-xs text-gray-500">
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        Static
      </span>
    )}
  </div>
);
```

### 3. Handle Disconnections
```typescript
const { isConnected, reconnect } = useVisitorHistory("24h", true);

return (
  <div>
    {!isConnected && (
      <button onClick={reconnect} className="text-blue-600 text-xs">
        Reconnect
      </button>
    )}
    {/* Your analytics UI */}
  </div>
);
```

## Updating Existing Components

Most existing components can be updated with minimal changes:

1. **Replace import**: Change `getVisitorHistory` to `useVisitorHistory`
2. **Add real-time parameter**: Add `true` as second parameter for real-time updates
3. **Extract `isConnected`**: Add to destructuring if you want to show connection status
4. **Add connection indicator**: Optional UI element to show live/static state

## Example: Updated Analytics Component

See `components/analytics/chats-by-referers.tsx` for a complete example of:
- Real-time data fetching
- Connection status indicator
- Fallback to static mode when needed

## Compatibility

- ✅ **Backward compatible**: Existing `getVisitorHistory` calls continue to work
- ✅ **Gradual migration**: Update components one by one
- ✅ **Type safe**: Full TypeScript support with consistent interfaces
- ✅ **SSE fallback**: Gracefully falls back to polling if SSE fails

## Troubleshooting

### SSE Connection Issues
1. Check browser network tab for EventSource connections to `/api/analytics-stream`
2. Verify authentication tokens are valid
3. Check server logs for SSE endpoint errors
4. Test with different network conditions

### Performance Issues
1. Monitor the number of active SSE connections (should share connections for same filter)
2. Check if connections are properly cleaned up on component unmount
3. Verify tab visibility API is working (connections should pause when tab is hidden)

### Data Freshness
1. Real-time version should update within 5 seconds of new data
2. Static version updates on mount, window focus, or after 5 minutes
3. Check React Query DevTools for cache invalidation events
