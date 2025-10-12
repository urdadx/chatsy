import { createCached } from "@ai-sdk-tools/cache";

// Create cached function (LRU by default)
export const cache = createCached();
