import { getMessagesByChatId } from "@/lib/server-functions/chat-queries";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export function useMessages(chatId: string) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => getMessagesByChatId({ data: chatId }),
    enabled: !!chatId,
  });

  // WebSocket live updates when escalated - passive listener only
  // The main useChatWebSocket hook handles active connection management
  const wsRef = useRef<WebSocket | null>(null);
  const activeChatIdRef = useRef<string>(chatId);

  useEffect(() => {
    activeChatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;

    const wsUrl = (import.meta as any).env?.VITE_WS_URL || process.env.WS_URL;
    const origin =
      wsUrl ||
      (typeof window !== "undefined"
        ? `${location.protocol === "https:" ? "wss" : "ws"}://${location.host.replace(/:\d+$/, ":3000")}/ws`
        : undefined);
    if (!origin) return;

    const ws = new WebSocket(origin);
    wsRef.current = ws;

    ws.onopen = () => {
      // Join as passive observer for this chat
      ws.send(JSON.stringify({ type: "join", chatId, role: "agent" }));
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        // Only invalidate if message is for the currently active chat
        if (
          data?.type === "message" &&
          data.chatId === activeChatIdRef.current
        ) {
          qc.invalidateQueries({ queryKey: ["messages", data.chatId] });
        }
      } catch {}
    };

    ws.onerror = () => {};

    return () => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({ type: "leave", chatId: activeChatIdRef.current }),
          );
        }
      } catch {}
      ws.close();
      wsRef.current = null;
    };
  }, [chatId, qc]);

  return query;
}
