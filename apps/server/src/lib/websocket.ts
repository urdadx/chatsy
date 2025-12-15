import type http from "node:http";
import { and, eq } from "drizzle-orm";
// filepath: /home/shinobi/projects/padyna/apps/server/src/lib/websocket.ts
import { WebSocket, WebSocketServer } from "ws";
import { db, schema } from "./db";

// Room manager keyed by chatId
const rooms = new Map<string, Set<WebSocket>>();

export type WSInbound =
  | { type: "join"; chatId: string; role: "user" | "agent" }
  | { type: "leave"; chatId: string }
  | {
      type: "typing";
      chatId: string;
      role: "user" | "agent";
      isTyping: boolean;
    }
  | { type: "message"; chatId: string; text: string; role?: "user" | "agent" };

export type WSOutbound =
  | { type: "joined"; chatId: string; role: "user" | "agent" }
  | { type: "left"; chatId: string }
  | { type: "agent_joined"; chatId: string }
  | { type: "agent_left"; chatId: string }
  | {
      type: "typing";
      chatId: string;
      role: "user" | "agent";
      isTyping: boolean;
    }
  | { type: "message"; chatId: string; message: any }
  | { type: "error"; error: string };

function broadcast(chatId: string, data: WSOutbound, except?: WebSocket) {
  const clients = rooms.get(chatId);
  if (!clients) return;
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN && client !== except) {
      client.send(payload);
    }
  }
}

async function ensureEscalated(chatId: string) {
  const [c] = await db
    .select({
      id: schema.chat.id,
      status: schema.chat.status,
    })
    .from(schema.chat)
    .where(eq(schema.chat.id, chatId));
  if (!c) throw new Error("Chat not found");
  if (c.status !== "escalated") {
    // only allow websocket messaging when escalated
    throw new Error("Chat is not escalated");
  }
}

export function createWebSocketServer(server: http.Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    let currentChatId: string | null = null;
    let currentRole: "user" | "agent" | null = null;

    ws.on("message", async (raw) => {
      try {
        const data = JSON.parse(String(raw)) as WSInbound;
        if (data.type === "join") {
          await ensureEscalated(data.chatId);
          currentChatId = data.chatId;
          currentRole = data.role;
          if (!rooms.has(data.chatId)) rooms.set(data.chatId, new Set());
          rooms.get(data.chatId)!.add(ws);

          // Notify the joining client
          ws.send(
            JSON.stringify({
              type: "joined",
              chatId: data.chatId,
              role: data.role,
            } satisfies WSOutbound),
          );

          // If an agent joins, notify other clients (users) in the room
          if (data.role === "agent") {
            broadcast(
              data.chatId,
              {
                type: "agent_joined",
                chatId: data.chatId,
              },
              ws,
            );
          }
          return;
        }

        if (!currentChatId) {
          ws.send(
            JSON.stringify({
              type: "error",
              error: "Not joined",
            } satisfies WSOutbound),
          );
          return;
        }

        switch (data.type) {
          case "leave": {
            const leavingChatId = currentChatId;
            const leavingRole = currentRole;
            rooms.get(currentChatId)?.delete(ws);
            ws.send(
              JSON.stringify({
                type: "left",
                chatId: currentChatId,
              } satisfies WSOutbound),
            );

            // If an agent leaves, notify other clients (users) in the room
            if (leavingRole === "agent" && leavingChatId) {
              broadcast(
                leavingChatId,
                {
                  type: "agent_left",
                  chatId: leavingChatId,
                },
                ws,
              );
            }

            currentChatId = null;
            currentRole = null;
            break;
          }
          case "typing": {
            broadcast(currentChatId, {
              type: "typing",
              chatId: currentChatId,
              role: data.role,
              isTyping: data.isTyping,
            });
            break;
          }
          case "message": {
            await ensureEscalated(currentChatId);
            const role: "human" | "user" =
              data.role === "agent" ? "human" : "user";
            const msg = {
              id: crypto.randomUUID(),
              chatId: currentChatId,
              role, // store "human" for agent messages
              parts: [{ type: "text", text: data.text }],
              createdAt: new Date(),
            };

            await db.insert(schema.message).values(msg);

            // Broadcast to all clients including sender for real-time updates
            broadcast(currentChatId, {
              type: "message",
              chatId: currentChatId,
              message: msg,
            });
            break;
          }
        }
      } catch (err: any) {
        ws.send(
          JSON.stringify({
            type: "error",
            error: err?.message || "Invalid payload",
          }),
        );
      }
    });

    ws.on("close", () => {
      if (currentChatId) {
        rooms.get(currentChatId)?.delete(ws);

        // If an agent disconnects, notify other clients (users) in the room
        if (currentRole === "agent") {
          broadcast(currentChatId, {
            type: "agent_left",
            chatId: currentChatId,
          });
        }
      }
    });
  });

  return wss;
}
