"use client";

// src/debug.ts
var DebugLogger = class {
  constructor(options = {}) {
    this.enabled = options.enabled ?? process.env.DEBUG === "true";
    this.prefix = options.prefix ?? "[Store]";
    this.level = options.level ?? "warn";
  }
  shouldLog(level) {
    if (!this.enabled) return false;
    const levels = ["log", "warn", "error"];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
  log(...args) {
    if (this.shouldLog("log")) {
      console.log(this.prefix, ...args);
    }
  }
  warn(...args) {
    if (this.shouldLog("warn")) {
      console.warn(this.prefix, ...args);
    }
  }
  error(...args) {
    if (this.shouldLog("error")) {
      console.error(this.prefix, ...args);
    }
  }
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  setLevel(level) {
    this.level = level;
  }
};
var debug = new DebugLogger();
function configureDebug(options) {
  if (options.enabled !== void 0) {
    debug.setEnabled(options.enabled);
  }
  if (options.level !== void 0) {
    debug.setLevel(options.level);
  }
}

// src/hooks.ts
import * as React from "react";
import { createContext, useCallback, useContext, useRef } from "react";
import { useStore } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { useShallow } from "zustand/shallow";
import { createStore } from "zustand/vanilla";
var __freezeDetectorStarted = false;
var __freezeRafId = 0;
var __freezeLastTs = 0;
var __lastActionLabel;
var __clearLastActionTimer = null;
var __updateQueue = [];
var __batchedUpdateScheduled = false;
function markLastAction(label) {
  __lastActionLabel = label;
  if (typeof window !== "undefined") {
    if (__clearLastActionTimer) clearTimeout(__clearLastActionTimer);
    __clearLastActionTimer = setTimeout(() => {
      if (__lastActionLabel === label) __lastActionLabel = void 0;
    }, 250);
  }
}
function batchUpdates(callback, priority = 0) {
  if (typeof window === "undefined") {
    callback();
    return;
  }
  __updateQueue.push({ callback, priority });
  if (!__batchedUpdateScheduled) {
    __batchedUpdateScheduled = true;
    const scheduler = window.scheduler;
    const schedule = scheduler?.postTask ? scheduler.postTask.bind(scheduler) : window.requestAnimationFrame?.bind(window) || ((fn) => setTimeout(fn, 0));
    schedule(() => {
      const updates = __updateQueue.splice(0);
      __batchedUpdateScheduled = false;
      updates.sort((a, b) => b.priority - a.priority);
      updates.forEach((update) => {
        update.callback();
      });
    });
  }
}
function startFreezeDetector({
  thresholdMs = 80
} = {}) {
  if (typeof window === "undefined" || __freezeDetectorStarted) return;
  __freezeDetectorStarted = true;
  __freezeLastTs = performance.now();
  const tick = (now) => {
    const expected = __freezeLastTs + 16.7;
    const blockedMs = now - expected;
    if (blockedMs > thresholdMs) {
      debug.warn(
        "[Freeze]",
        `${Math.round(blockedMs)}ms`,
        "lastAction=",
        __lastActionLabel
      );
    }
    __freezeLastTs = now;
    __freezeRafId = window.requestAnimationFrame(tick);
  };
  __freezeRafId = window.requestAnimationFrame(tick);
  window.addEventListener("beforeunload", () => {
    if (__freezeRafId) cancelAnimationFrame(__freezeRafId);
  });
}
if (typeof window !== "undefined") {
  startFreezeDetector({ thresholdMs: 80 });
}
function enhancedThrottle(func, wait) {
  let timeout = null;
  let previous = 0;
  let pendingArgs = null;
  const execute = () => {
    if (pendingArgs) {
      func.apply(null, pendingArgs);
      pendingArgs = null;
    }
  };
  return ((...args) => {
    const now = Date.now();
    const remaining = wait - (now - previous);
    pendingArgs = args;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      if (typeof window !== "undefined" && window.requestIdleCallback) {
        window.requestIdleCallback(execute, { timeout: 50 });
      } else {
        execute();
      }
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        if (typeof window !== "undefined" && window.requestIdleCallback) {
          window.requestIdleCallback(execute, { timeout: 50 });
        } else {
          execute();
        }
      }, remaining);
    }
  });
}
var MessageIndex = class {
  constructor() {
    this.idToMessage = /* @__PURE__ */ new Map();
    this.idToIndex = /* @__PURE__ */ new Map();
  }
  update(messages) {
    this.idToMessage.clear();
    this.idToIndex.clear();
    messages.forEach((message, index) => {
      this.idToMessage.set(message.id, message);
      this.idToIndex.set(message.id, index);
    });
  }
  getById(id) {
    return this.idToMessage.get(id);
  }
  getIndexById(id) {
    return this.idToIndex.get(id);
  }
  has(id) {
    return this.idToMessage.has(id);
  }
};
var MESSAGES_THROTTLE_MS = 16;
function createChatStoreCreator(initialMessages = []) {
  let throttledMessagesUpdater = null;
  const messageIndex = new MessageIndex();
  const throttledEffects = /* @__PURE__ */ new Set();
  messageIndex.update(initialMessages);
  return (set, get) => {
    if (!throttledMessagesUpdater) {
      throttledMessagesUpdater = enhancedThrottle(() => {
        batchUpdates(() => {
          const state = get();
          const newThrottledMessages = [...state.messages];
          state._messageIndex.update(newThrottledMessages);
          set({
            _throttledMessages: newThrottledMessages
          });
          throttledEffects.forEach((cb) => {
            try {
              cb();
            } catch (err) {
              console.warn("[chat-store-base] throttled effect error", err);
            }
          });
        });
      }, MESSAGES_THROTTLE_MS);
    }
    return {
      id: void 0,
      messages: initialMessages,
      status: "ready",
      error: void 0,
      _throttledMessages: [...initialMessages],
      _messageIndex: messageIndex,
      _memoizedSelectors: /* @__PURE__ */ new Map(),
      // Chat helpers
      sendMessage: void 0,
      regenerate: void 0,
      stop: void 0,
      resumeStream: void 0,
      addToolResult: void 0,
      clearError: void 0,
      setId: (id) => {
        markLastAction("chat:setId");
        batchUpdates(() => set({ id }));
      },
      setMessages: (messages) => {
        markLastAction("chat:setMessages");
        batchUpdates(() => {
          const currentState = get();
          if (messages === currentState.messages) return;
          set({
            messages,
            _memoizedSelectors: /* @__PURE__ */ new Map()
            // Clear memoized selectors
          });
          if (currentState.status === "streaming") {
            batchUpdates(() => {
              const state = get();
              const newThrottledMessages = [...state.messages];
              state._messageIndex.update(newThrottledMessages);
              set({
                _throttledMessages: newThrottledMessages
              });
            }, 1);
          } else {
            throttledMessagesUpdater?.();
          }
        });
      },
      setStatus: (status) => {
        markLastAction("chat:setStatus");
        batchUpdates(() => set({ status }));
      },
      setError: (error) => {
        markLastAction("chat:setError");
        batchUpdates(() => set({ error }));
      },
      setNewChat: (id, messages) => {
        markLastAction("chat:setNewChat");
        batchUpdates(() => {
          set({
            messages,
            status: "ready",
            error: void 0,
            id,
            _memoizedSelectors: /* @__PURE__ */ new Map()
          });
          throttledMessagesUpdater?.();
        });
      },
      pushMessage: (message) => {
        markLastAction("chat:pushMessage");
        batchUpdates(() => {
          const currentState = get();
          set((state) => ({
            messages: [...state.messages, message],
            _memoizedSelectors: /* @__PURE__ */ new Map()
          }));
          if (currentState.status === "streaming") {
            batchUpdates(() => {
              const state = get();
              const newThrottledMessages = [...state.messages];
              state._messageIndex.update(newThrottledMessages);
              set({
                _throttledMessages: newThrottledMessages
              });
            }, 1);
          } else {
            throttledMessagesUpdater?.();
          }
        });
      },
      popMessage: () => {
        markLastAction("chat:popMessage");
        batchUpdates(() => {
          set((state) => ({
            messages: state.messages.slice(0, -1),
            _memoizedSelectors: /* @__PURE__ */ new Map()
          }));
          throttledMessagesUpdater?.();
        });
      },
      replaceMessage: (index, message) => {
        markLastAction("chat:replaceMessage");
        batchUpdates(() => {
          const currentState = get();
          set((state) => {
            const newMessages = [...state.messages];
            newMessages[index] = structuredClone(message);
            return {
              messages: newMessages,
              _memoizedSelectors: /* @__PURE__ */ new Map()
            };
          });
          if (currentState.status === "streaming") {
            batchUpdates(() => {
              const state = get();
              const newThrottledMessages = [...state.messages];
              state._messageIndex.update(newThrottledMessages);
              set({
                _throttledMessages: newThrottledMessages
              });
            }, 1);
          } else {
            throttledMessagesUpdater?.();
          }
        });
      },
      replaceMessageById: (id, message) => {
        markLastAction("chat:replaceMessageById");
        batchUpdates(() => {
          const currentState = get();
          set((state) => {
            const index = state._messageIndex.getIndexById(id);
            if (index === void 0) return state;
            const newMessages = [...state.messages];
            newMessages[index] = structuredClone(message);
            return {
              messages: newMessages,
              _memoizedSelectors: /* @__PURE__ */ new Map()
            };
          });
          if (currentState.status === "streaming") {
            batchUpdates(() => {
              const state = get();
              const newThrottledMessages = [...state.messages];
              state._messageIndex.update(newThrottledMessages);
              set({
                _throttledMessages: newThrottledMessages
              });
            }, 1);
          } else {
            throttledMessagesUpdater?.();
          }
        });
      },
      _syncState: (newState) => {
        markLastAction("chat:_syncState");
        batchUpdates(() => {
          set({
            ...newState,
            _memoizedSelectors: /* @__PURE__ */ new Map()
            // Clear memoized selectors on sync
          });
          if (newState.messages) {
            throttledMessagesUpdater?.();
          }
        });
      },
      reset: () => {
        markLastAction("chat:reset");
        batchUpdates(() => {
          const state = get();
          const newMessageIndex = new MessageIndex();
          newMessageIndex.update([]);
          if (state.setMessages) {
            state.setMessages([]);
          }
          set({
            id: void 0,
            messages: [],
            status: "ready",
            error: void 0,
            _throttledMessages: [],
            _messageIndex: newMessageIndex,
            _memoizedSelectors: /* @__PURE__ */ new Map()
          });
        });
      },
      // Optimized getters
      getLastMessageId: () => {
        const state = get();
        return state.messages.length > 0 ? state.messages[state.messages.length - 1].id : null;
      },
      getMessageIds: () => {
        const state = get();
        return (state._throttledMessages || state.messages).map((m) => m.id);
      },
      getThrottledMessages: () => {
        const state = get();
        return state._throttledMessages || state.messages;
      },
      getInternalMessages: () => {
        const state = get();
        return state.messages;
      },
      getMessageById: (id) => {
        const state = get();
        return state._messageIndex.getById(id);
      },
      getMessageIndexById: (id) => {
        const state = get();
        return state._messageIndex.getIndexById(id);
      },
      getMessagesSlice: (start, end) => {
        const state = get();
        const messages = state._throttledMessages || state.messages;
        return messages.slice(start, end);
      },
      getMessageCount: () => {
        const state = get();
        const messages = state._throttledMessages || state.messages;
        return messages.length;
      },
      getMemoizedSelector: (key, selector, deps) => {
        const state = get();
        const cached = state._memoizedSelectors.get(key);
        if (cached && cached.deps.length === deps.length && (deps.length === 0 || JSON.stringify(cached.deps) === JSON.stringify(deps))) {
          return cached.result;
        }
        const result = selector();
        state._memoizedSelectors.set(key, { result, deps: [...deps] });
        return result;
      },
      // Effects
      registerThrottledMessagesEffect: (effect) => {
        throttledEffects.add(effect);
        return () => {
          throttledEffects.delete(effect);
        };
      }
    };
  };
}
function createChatStore(initialMessages = []) {
  return createStore()(
    devtools(
      subscribeWithSelector(createChatStoreCreator(initialMessages)),
      { name: "chat-store" }
    )
  );
}
var ChatStoreContext = createContext(
  void 0
);
function Provider({
  children,
  initialMessages = []
}) {
  const storeRef = useRef(null);
  if (storeRef.current === null) {
    storeRef.current = createChatStore(initialMessages);
  }
  return React.createElement(
    ChatStoreContext.Provider,
    { value: storeRef.current },
    children
  );
}
function useChatStore(selector) {
  const store = useContext(ChatStoreContext);
  if (!store) throw new Error("useChatStore must be used within Provider");
  const selectorOrIdentity = selector || ((s) => s);
  return useStore(store, selectorOrIdentity);
}
function useChatStoreApi() {
  const store = useContext(ChatStoreContext);
  if (!store) throw new Error("useChatStoreApi must be used within Provider");
  return store;
}
var useChatMessages = () => {
  return useChatStore(
    useShallow((state) => state.getThrottledMessages())
  );
};
var statusSelector = (state) => state.status;
var errorSelector = (state) => state.error;
var idSelector = (state) => state.id;
var messageCountSelector = (state) => state.getMessageCount();
var useChatStatus = () => useChatStore(statusSelector);
var useChatError = () => useChatStore(errorSelector);
var useChatId = () => useChatStore(idSelector);
var useMessageIds = () => useChatStore(
  useShallow((state) => state.getMessageIds())
);
var useMessageById = (messageId) => {
  return useChatStore(
    useCallback(
      (state) => {
        const message = state.getMessageById(messageId);
        if (!message) throw new Error(`Message not found for id: ${messageId}`);
        return message;
      },
      [messageId]
    )
  );
};
var useVirtualMessages = (start, end) => {
  return useChatStore(
    useCallback(
      (state) => state.getMessagesSlice(start, end),
      [start, end]
    )
  );
};
var useMessageCount = () => useChatStore(messageCountSelector);
var useChatReset = () => useChatStore((state) => state.reset);
var fallbackSendMessage = async () => {
  debug.warn(
    "sendMessage not configured - make sure useChat is called with transport"
  );
};
var fallbackRegenerate = async () => {
  debug.warn(
    "regenerate not configured - make sure useChat is called with transport"
  );
};
var fallbackStop = async () => {
  debug.warn(
    "stop not configured - make sure useChat is called with transport"
  );
};
var fallbackResumeStream = async () => {
  debug.warn(
    "resumeStream not configured - make sure useChat is called with transport"
  );
};
var fallbackAddToolResult = async () => {
  debug.warn(
    "addToolResult not configured - make sure useChat is called with transport"
  );
};
var fallbackClearError = () => {
  debug.warn(
    "clearError not configured - make sure useChat is called with transport"
  );
};
var useChatActions = () => useChatStore(
  useShallow((state) => ({
    setMessages: state.setMessages,
    pushMessage: state.pushMessage,
    popMessage: state.popMessage,
    replaceMessage: state.replaceMessage,
    replaceMessageById: state.replaceMessageById,
    setStatus: state.setStatus,
    setError: state.setError,
    setId: state.setId,
    setNewChat: state.setNewChat,
    reset: state.reset,
    sendMessage: state.sendMessage || fallbackSendMessage,
    regenerate: state.regenerate || fallbackRegenerate,
    stop: state.stop || fallbackStop,
    resumeStream: state.resumeStream || fallbackResumeStream,
    addToolResult: state.addToolResult || fallbackAddToolResult,
    clearError: state.clearError || fallbackClearError
  }))
);
var useSelector = (key, selector, deps = []) => {
  return useChatStore(
    useCallback(
      (state) => state.getMemoizedSelector(
        key,
        () => selector(state.getThrottledMessages()),
        [state.getMessageCount(), ...deps]
      ),
      [key, selector, deps]
    )
  );
};

// src/use-chat.ts
import {
  useChat as useOriginalChat
} from "@ai-sdk/react";
import { useCallback as useCallback2, useEffect, useRef as useRef2 } from "react";
function useChat(options = {}) {
  const {
    store: customStore,
    enableBatching = true,
    ...originalOptions
  } = options;
  const contextStore = useChatStoreApi();
  const store = customStore || contextStore;
  const chatHelpers = useOriginalChat(originalOptions);
  const storeRef = useRef2(
    store
  );
  const syncState = useCallback2((chatState) => {
    if (!storeRef.current) return;
    if (typeof storeRef.current.getState === "function") {
      const vanillaStore = storeRef.current;
      vanillaStore.getState()._syncState(chatState);
    } else if (typeof storeRef.current._syncState === "function") {
      storeRef.current._syncState(chatState);
    } else if (typeof storeRef.current.setState === "function") {
      storeRef.current.setState(chatState);
    }
  }, []);
  useEffect(() => {
    const currentStoreState = store.getState?.() || { messages: [] };
    const shouldSyncMessages = !(currentStoreState.messages?.length > 0 && chatHelpers.messages.length === 0);
    const stateData = {
      id: chatHelpers.id,
      messages: shouldSyncMessages ? chatHelpers.messages : void 0,
      error: chatHelpers.error,
      status: chatHelpers.status
    };
    const functionsData = {
      sendMessage: chatHelpers.sendMessage,
      regenerate: chatHelpers.regenerate,
      stop: chatHelpers.stop,
      resumeStream: chatHelpers.resumeStream,
      addToolResult: chatHelpers.addToolResult,
      setMessages: chatHelpers.setMessages,
      clearError: chatHelpers.clearError
    };
    const chatState = { ...stateData, ...functionsData };
    if (enableBatching) {
      if (window?.requestAnimationFrame) {
        window.requestAnimationFrame(() => syncState(chatState));
      } else {
        syncState(chatState);
      }
    } else {
      syncState(chatState);
    }
  }, [
    // Only depend on data that actually changes, not function references
    chatHelpers.id,
    chatHelpers.messages,
    chatHelpers.error,
    chatHelpers.status,
    syncState,
    enableBatching,
    chatHelpers.resumeStream,
    chatHelpers.clearError,
    chatHelpers.sendMessage,
    store,
    chatHelpers.setMessages,
    chatHelpers.stop,
    chatHelpers.regenerate,
    chatHelpers.addToolResult
  ]);
  return chatHelpers;
}
export {
  ChatStoreContext,
  DebugLogger,
  Provider,
  configureDebug,
  createChatStoreCreator,
  debug,
  useChat,
  useChatActions,
  useChatError,
  useChatId,
  useChatMessages,
  useChatReset,
  useChatStatus,
  useChatStore,
  useChatStoreApi,
  useMessageById,
  useMessageCount,
  useMessageIds,
  useSelector,
  useVirtualMessages
};
//# sourceMappingURL=index.mjs.map