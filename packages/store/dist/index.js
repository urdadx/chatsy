"use client";
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ChatStoreContext: () => ChatStoreContext,
  DebugLogger: () => DebugLogger,
  Provider: () => Provider,
  configureDebug: () => configureDebug,
  createChatStoreCreator: () => createChatStoreCreator,
  debug: () => debug,
  useChat: () => useChat,
  useChatActions: () => useChatActions,
  useChatError: () => useChatError,
  useChatId: () => useChatId,
  useChatMessages: () => useChatMessages,
  useChatReset: () => useChatReset,
  useChatStatus: () => useChatStatus,
  useChatStore: () => useChatStore,
  useChatStoreApi: () => useChatStoreApi,
  useMessageById: () => useMessageById,
  useMessageCount: () => useMessageCount,
  useMessageIds: () => useMessageIds,
  useSelector: () => useSelector,
  useVirtualMessages: () => useVirtualMessages
});
module.exports = __toCommonJS(index_exports);

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
var React = __toESM(require("react"));
var import_react = require("react");
var import_zustand = require("zustand");
var import_middleware = require("zustand/middleware");
var import_shallow = require("zustand/shallow");
var import_vanilla = require("zustand/vanilla");
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
          set(
            {
              ...newState,
              _memoizedSelectors: /* @__PURE__ */ new Map()
              // Clear memoized selectors on sync
            },
            false
          );
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
  return (0, import_vanilla.createStore)()(
    (0, import_middleware.devtools)(
      (0, import_middleware.subscribeWithSelector)(createChatStoreCreator(initialMessages)),
      { name: "chat-store" }
    )
  );
}
var ChatStoreContext = (0, import_react.createContext)(
  void 0
);
function Provider({
  children,
  initialMessages = []
}) {
  const storeRef = (0, import_react.useRef)(null);
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
  const store = (0, import_react.useContext)(ChatStoreContext);
  if (!store) throw new Error("useChatStore must be used within Provider");
  const selectorOrIdentity = selector || ((s) => s);
  return (0, import_zustand.useStore)(store, selectorOrIdentity);
}
function useChatStoreApi() {
  const store = (0, import_react.useContext)(ChatStoreContext);
  if (!store) throw new Error("useChatStoreApi must be used within Provider");
  return store;
}
var useChatMessages = () => {
  return useChatStore(
    (0, import_shallow.useShallow)((state) => state.getThrottledMessages())
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
  (0, import_shallow.useShallow)((state) => state.getMessageIds())
);
var useMessageById = (messageId) => {
  return useChatStore(
    (0, import_react.useCallback)(
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
    (0, import_react.useCallback)(
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
  (0, import_shallow.useShallow)((state) => ({
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
    (0, import_react.useCallback)(
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
var import_react2 = require("@ai-sdk/react");
var import_react3 = require("react");
function useChat(options = {}) {
  const {
    store: customStore,
    enableBatching = true,
    ...originalOptions
  } = options;
  const contextStore = useChatStoreApi();
  const store = customStore || contextStore;
  const chatHelpers = (0, import_react2.useChat)(originalOptions);
  const storeRef = (0, import_react3.useRef)(
    store
  );
  const syncState = (0, import_react3.useCallback)((chatState) => {
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
  (0, import_react3.useEffect)(() => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
//# sourceMappingURL=index.js.map