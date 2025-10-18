// filepath: /home/shinobi/projects/padyna/apps/server/src/db/schema.ts
import {
  json,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  title: text("title").notNull(),
  userId: uuid("userId"),
  chatbotId: uuid("chatbot_id").notNull(),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  channel: varchar("channel", {
    enum: ["web", "widget", "whatsapp", "telegram"],
  })
    .notNull()
    .default("web"),
  status: varchar("status", { enum: ["unresolved", "resolved", "escalated"] })
    .notNull()
    .default("unresolved"),
  agentAssigned: text("agent_assigned"),
  chatMetaData: jsonb("chat_meta_data"),
});

export const message = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId").notNull(),
  role: varchar("role", {
    enum: ["system", "assistant", "user", "human"],
  }).notNull(),
  parts: json("parts").notNull(),
  createdAt: timestamp("createdAt")
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Chat = {
  id: string;
  createdAt: Date;
  title: string;
  userId: string | null;
  chatbotId: string;
  visibility: "public" | "private";
  channel: "web" | "widget" | "whatsapp" | "telegram";
  status: "unresolved" | "resolved" | "escalated";
  agentAssigned: string | null;
};

export type DBMessage = {
  id: string;
  chatId: string;
  role: "system" | "assistant" | "user" | "human";
  parts: unknown;
  createdAt: Date;
};
