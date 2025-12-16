import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

export type WebSocketStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error"
  | "waiting";

export interface UseChatWebSocketOptions {
  chatId: string;
  role?: "user" | "agent";
  onMessage?: (message: any) => void;
  onTyping?: (data: { role: "user" | "agent"; isTyping: boolean }) => void;
  onError?: (error: string) => void;
  onAgentJoined?: () => void;
  onAgentLeft?: () => void;
}

export function useChatWebSocket({
  chatId,
  role = "agent",
  onMessage,
  onTyping,
  onError,
  onAgentJoined,
  onAgentLeft,
}: UseChatWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const activeChatIdRef = useRef<string>(chatId);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const onMessageRef = useRef(onMessage);
  const onTypingRef = useRef(onTyping);
  const onErrorRef = useRef(onError);
  const onAgentJoinedRef = useRef(onAgentJoined);
  const onAgentLeftRef = useRef(onAgentLeft);
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    onMessageRef.current = onMessage;
    onTypingRef.current = onTyping;
    onErrorRef.current = onError;
    onAgentJoinedRef.current = onAgentJoined;
    onAgentLeftRef.current = onAgentLeft;
  }, [onMessage, onTyping, onError, onAgentJoined, onAgentLeft]);

  useEffect(() => {
    const previousChatId = activeChatIdRef.current;
    activeChatIdRef.current = chatId;

    // If chatId changed and we were connected, disconnect from old chat
    if (previousChatId && previousChatId !== chatId && wsRef.current) {
      const ws = wsRef.current;

      // Leave the old chat room
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: "leave", chatId: previousChatId }));
        } catch (err) {
          console.error("Failed to send leave message:", err);
        }
      }

      // Close the connection
      ws.close();
      wsRef.current = null;
      setStatus("disconnected");
      setIsTyping(false);
      reconnectAttemptsRef.current = 0;

      // Clear any pending reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    }
  }, [chatId]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const getWebSocketUrl = useCallback(() => {
    const wsUrl = (import.meta as any).env?.VITE_WS_URL;
    if (wsUrl) return wsUrl;

    if (typeof window !== "undefined") {
      if (process.env.NODE_ENV === "development") {
        return "ws://localhost:3000/ws";
      }

      return "wss://ws.padyna.com/ws";
    }

    return null;
  }, []);

  const connect = useCallback(() => {
    if (!chatId) {
      onErrorRef.current?.("No chat ID provided");
      return;
    }

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

    setStatus("connecting");

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Don't set connected yet - wait for "joined" confirmation from server
        reconnectAttemptsRef.current = 0;
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

          switch (payload.type) {
            case "joined":
              // Now we're truly connected and in the chat room
              setStatus("connected");
              // Fetch any messages that might have been sent before we connected
              // This ensures we don't miss messages sent during the connection gap
              queryClient.invalidateQueries({
                queryKey: ["messages", payload.chatId],
              });
              break;
            case "agent_joined":
              // An agent has joined the chat - notify the user
              if (payload.chatId === activeChatIdRef.current) {
                onAgentJoinedRef.current?.();
              }
              break;
            case "agent_left":
              // An agent has left the chat - notify the user
              if (payload.chatId === activeChatIdRef.current) {
                onAgentLeftRef.current?.();
              }
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
              setStatus("error");
              onErrorRef.current?.(payload.error);
              break;
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
          onErrorRef.current?.("Failed to parse server message");
        }
      };

      ws.onerror = () => {
        setStatus("error");
        onErrorRef.current?.("WebSocket connection failed");
      };

      ws.onclose = (event) => {
        wsRef.current = null;

        if (!event.wasClean && activeChatIdRef.current) {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(
              1000 * 2 ** reconnectAttemptsRef.current,
              30000,
            );
            reconnectAttemptsRef.current += 1;

            console.log(
              `Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) in ${delay}ms...`,
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            setStatus("error");
            onErrorRef.current?.(
              "Connection lost and max reconnection attempts reached",
            );
          }
        }
      };
    } catch (err) {
      console.error("WebSocket connection error:", err);
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

    reconnectAttemptsRef.current = 0;

    const ws = wsRef.current;
    const currentChatId = activeChatIdRef.current;

    if (ws && ws.readyState === WebSocket.OPEN && currentChatId) {
      try {
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
        onError?.("Failed to send message");
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
