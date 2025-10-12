import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

export type WebSocketStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface UseChatWebSocketOptions {
  chatId: string;
  role?: "user" | "agent";
  onMessage?: (message: any) => void;
  onTyping?: (data: { role: "user" | "agent"; isTyping: boolean }) => void;
  onError?: (error: string) => void;
}

export function useChatWebSocket({
  chatId,
  role = "agent",
  onMessage,
  onTyping,
  onError,
}: UseChatWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const activeChatIdRef = useRef<string>(chatId);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onMessageRef = useRef(onMessage);
  const onTypingRef = useRef(onTyping);
  const onErrorRef = useRef(onError);
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();

  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage;
    onTypingRef.current = onTyping;
    onErrorRef.current = onError;
  }, [onMessage, onTyping, onError]);

  // Update the active chat ID ref when chatId changes
  useEffect(() => {
    activeChatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const getWebSocketUrl = useCallback(() => {
    // Check for environment variable first
    const wsUrl = (import.meta as any).env?.VITE_WS_URL;
    if (wsUrl) return wsUrl;

    if (typeof window !== "undefined") {
      const protocol = location.protocol === "https:" ? "wss:" : "ws:";
      const host = location.hostname;

      // In development, assume WebSocket server is on port 3000
      // In production, assume it's on the same host and port
      const port =
        location.port || (location.protocol === "https:" ? "443" : "80");
      const wsPort = process.env.NODE_ENV === "development" ? "3000" : port;

      return `${protocol}//${host}:${wsPort}/ws`;
    }

    return null;
  }, []);

  const connect = useCallback(() => {
    if (!chatId) {
      onErrorRef.current?.("No chat ID provided");
      return;
    }

    // Avoid reconnect if already open or connecting
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const wsUrl = getWebSocketUrl();
    if (!wsUrl) {
      setStatus("error");
      onErrorRef.current?.("Unable to determine WebSocket URL");
      return;
    }

    console.log("Connecting to WebSocket:", wsUrl);
    setStatus("connecting");

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected, joining chat:", chatId);
        setStatus("connected");
        try {
          ws.send(JSON.stringify({ type: "join", chatId, role }));
        } catch (err) {
          console.error("Failed to send join message:", err);
          setStatus("error");
          onErrorRef.current?.("Failed to join chat");
        }
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          console.log("WebSocket message received:", payload);

          switch (payload.type) {
            case "joined":
              console.log("Successfully joined chat:", payload.chatId);
              break;
            case "message":
              if (payload.chatId === activeChatIdRef.current) {
                onMessageRef.current?.(payload.message);
                queryClient.invalidateQueries({
                  queryKey: ["messages", payload.chatId],
                });
              }
              break;
            case "typing":
              if (payload.chatId === activeChatIdRef.current) {
                onTypingRef.current?.(payload);
                setIsTyping(payload.isTyping && payload.role !== role);
              }
              break;
            case "error":
              console.error("WebSocket error:", payload.error);
              setStatus("error");
              onErrorRef.current?.(payload.error);
              break;
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
          onErrorRef.current?.("Failed to parse server message");
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket connection error:", error);
        setStatus("error");
        onErrorRef.current?.("WebSocket connection failed");
      };

      ws.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason);
        setStatus("disconnected");
        wsRef.current = null;

        // Don't auto-reconnect, let the component decide
      };
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      setStatus("error");
      onErrorRef.current?.("Failed to create WebSocket connection");
    }
  }, [
    chatId,
    role,
    onError,
    onMessage,
    onTyping,
    queryClient,
    getWebSocketUrl,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const ws = wsRef.current;
    const currentChatId = activeChatIdRef.current;

    if (ws && ws.readyState === WebSocket.OPEN && currentChatId) {
      try {
        console.log("Leaving chat:", currentChatId);
        ws.send(JSON.stringify({ type: "leave", chatId: currentChatId }));
      } catch (err) {
        console.error("Failed to send leave message:", err);
      }
    }

    if (ws) {
      ws.close();
    }

    wsRef.current = null;
    setStatus("disconnected");
    setIsTyping(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const sendMessage = useCallback(
    (text: string) => {
      const ws = wsRef.current;
      const currentChatId = activeChatIdRef.current;

      if (!ws || ws.readyState !== WebSocket.OPEN || !currentChatId) {
        console.warn(
          "Cannot send message: WebSocket not connected or no chat ID",
        );
        return false;
      }

      try {
        console.log("Sending message:", { chatId: currentChatId, text, role });
        ws.send(
          JSON.stringify({
            type: "message",
            chatId: currentChatId,
            text,
            role,
          }),
        );
        return true;
      } catch (err) {
        console.error("Failed to send message:", err);
        onErrorRef.current?.("Failed to send message");
        return false;
      }
    },
    [role, onError],
  );

  const sendTyping = useCallback(
    (typing: boolean) => {
      const ws = wsRef.current;
      const currentChatId = activeChatIdRef.current;

      if (!ws || ws.readyState !== WebSocket.OPEN || !currentChatId) {
        return;
      }

      try {
        ws.send(
          JSON.stringify({
            type: "typing",
            chatId: currentChatId,
            role,
            isTyping: typing,
          }),
        );
      } catch (err) {
        console.error("Failed to send typing indicator:", err);
      }
    },
    [role],
  );

  return {
    status,
    isTyping,
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    isConnected: status === "connected",
  };
}
