import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  integer,
  json,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  bio: text("bio"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  username: text("username").unique(),
  externalId: text("external_id").unique(),
  isSubscribed: boolean("is_subscribed")
    .notNull()
    .$defaultFn(() => false),
});

export const session = pgTable("session", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id"),
  activeChatbotId: uuid("active_chatbot_id").references(() => chatbot.id, {
    onDelete: "set null",
  }),
});

export const account = pgTable("account", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
  externalCustomerId: uuid("external_customer_id").unique(),
  chatbotCount: integer("chatbot_count").default(1).notNull(),
});

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: uuid("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  title: text("title").notNull(),
  userId: uuid("userId").references(() => user.id, { onDelete: "cascade" }),
  chatbotId: uuid("chatbot_id")
    .notNull()
    .references(() => chatbot.id, { onDelete: "cascade" }),
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
  externalUserId: text("external_user_id"),
  externalUserName: text("external_user_name"),
});

export const message = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  createdAt: timestamp("createdAt")
    .notNull()
    .$defaultFn(() => new Date()),
});

export const vote = pgTable(
  "vote",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => [primaryKey({ columns: [table.chatId, table.messageId] })],
);

export const question = pgTable("question", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  chatbotId: uuid("chatbot_id")
    .notNull()
    .references(() => chatbot.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("createdAt")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .$defaultFn(() => new Date()),
});

export const chatbot = pgTable("chatbot", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),

  image: text("image"),
  name: text("name"),
  primaryColor: text("primary_color").notNull().default("#9333ea"),
  theme: text("theme").notNull().default("light"),
  hidePoweredBy: boolean("hide_powered_by").notNull().default(false),
  personality: varchar("personality", {
    enum: ["support", "sales", "lead", "custom"],
  })
    .notNull()
    .default("support"),
  initialMessage: text("initial_message")
    .notNull()
    .default("Hello there👋, how can I help you today?"),
  suggestedMessages: text("suggested_messages").array(),

  trainingStatus: text("training_status").default("idle"),
  lastTrainedAt: timestamp("last_trained_at"),
  sourcesCount: integer("sources_count").default(0).notNull(),

  isEmbeddingEnabled: boolean("is_embedding_enabled").notNull().default(true),
  embedToken: text("embed_token").unique(),
  allowedDomains: text("allowed_domains").array(),

  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$defaultFn(() => new Date()),
});

export const lead = pgTable("lead", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatbotId: uuid("chatbot_id")
    .notNull()
    .references(() => chatbot.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  message: text("message"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const product = pgTable("product", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  chatbotId: uuid("chatbot_id")
    .notNull()
    .references(() => chatbot.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  image: text("image"),
  price: numeric("price", { precision: 10, scale: 2 }),
  featured: boolean("featured").notNull().default(true),
  description: text("description"),
  type: varchar("type", {
    enum: ["course", "merch", "downloadable"],
  }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const textSource = pgTable("text_source", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  chatbotId: uuid("chatbot_id")
    .notNull()
    .references(() => chatbot.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documentSource = pgTable("document_source", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  chatbotId: uuid("chatbot_id")
    .notNull()
    .references(() => chatbot.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const websiteSource = pgTable("website_source", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  chatbotId: uuid("chatbot_id")
    .notNull()
    .references(() => chatbot.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  markdown: text("markdown").notNull(),
  metadata: json("metadata"),
  type: varchar("type", { enum: ["scrape", "crawl"] }).notNull(),
  urlsCrawled: integer("urls_crawled").notNull().default(1),
  creditsUsed: integer("credits_used").notNull().default(1),
  crawlJobId: text("crawl_job_id"), // Optional field to track crawl jobs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const knowledge = pgTable("knowledge", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  chatbotId: uuid("chatbot_id")
    .notNull()
    .references(() => chatbot.id, { onDelete: "cascade" }),
  source: varchar("source", {
    enum: ["website", "text", "document", "qna"],
  }).notNull(),
  sourceId: uuid("source_id").notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 768 }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatbotId: uuid("chatbot_id")
    .notNull()
    .references(() => chatbot.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const issueReport = pgTable("issue_report", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatbotId: uuid("chatbot_id")
    .notNull()
    .references(() => chatbot.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  screenshot: text("screenshot"),
  email: text("email"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const visitorAnalytics = pgTable("visitor_analytics", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatbotId: uuid("chatbot_id")
    .notNull()
    .references(() => chatbot.id, { onDelete: "cascade" }),
  visitorId: text("visitor_id").notNull(),
  userAgent: text("user_agent"),
  deviceType: text("device_type"),
  platform: text("platform"),
  city: text("city"),
  region: text("region"),
  country: text("country"),
  countryCode: text("country_code"),
  continent: text("continent"),
  ip: text("ip"),
  referer: text("referer"),
  event: text("event"),
  durationMs: integer("duration_ms"),
  extra: jsonb("extra"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subscription = pgTable("subscription", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  modifiedAt: timestamp("modifiedAt"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  recurringInterval: text("recurringInterval").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  canceledAt: timestamp("canceledAt"),
  startedAt: timestamp("startedAt").notNull(),
  endsAt: timestamp("endsAt"),
  endedAt: timestamp("endedAt"),
  customerId: text("customerId").notNull(),
  productId: text("productId").notNull(),
  discountId: text("discountId"),
  checkoutId: text("checkoutId").notNull(),
  customerCancellationReason: text("customerCancellationReason"),
  customerCancellationComment: text("customerCancellationComment"),
  metadata: text("metadata"),
  customFieldData: text("customFieldData"),
  userId: uuid("userId").references(() => user.id, { onDelete: "cascade" }),
  meters: jsonb("meters").notNull().default({}),
});

export const creditsUsage = pgTable("credits_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  creditCount: integer("credit_count").notNull().default(0),
  date: timestamp("date").notNull().defaultNow(),
  resetAt: timestamp("reset_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const calendlyIntegration = pgTable("calendly_integration", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  chatbotId: uuid("chatbot_id")
    .notNull()
    .references(() => chatbot.id, { onDelete: "cascade" }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  scope: text("scope"),
  organizationUri: text("organization_uri").notNull(),
  userUri: text("user_uri").notNull(),
  eventTypes: jsonb("event_types"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const Action = pgTable(
  "action",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    chatbotId: uuid("chatbot_id")
      .notNull()
      .references(() => chatbot.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    toolName: text("tool_name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    showInQuickMenu: boolean("show_in_quick_menu").notNull().default(false),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [unique().on(table.chatbotId, table.toolName)],
);

// TYPES
export type VisitorAnalytics = InferSelectModel<typeof visitorAnalytics>;
export type Feedback = InferSelectModel<typeof feedback>;
export type IssueReport = InferSelectModel<typeof issueReport>;
export type Knowledge = InferSelectModel<typeof knowledge>;
export type WebsiteSource = InferSelectModel<typeof websiteSource>;
export type DocumentSource = InferSelectModel<typeof documentSource>;
export type TextSource = InferSelectModel<typeof textSource>;
export type Lead = InferSelectModel<typeof lead>;
export type DBMessage = InferSelectModel<typeof message>;
export type Vote = InferSelectModel<typeof vote>;
export type Chat = InferSelectModel<typeof chat>;
export type User = InferSelectModel<typeof user>;
export type Member = InferSelectModel<typeof member>;
export type Invitation = InferSelectModel<typeof invitation>;
export type Organization = InferSelectModel<typeof organization>;
export type Session = InferSelectModel<typeof session>;
export type Account = InferSelectModel<typeof account>;
export type Product = InferSelectModel<typeof product>;
export type Question = InferSelectModel<typeof question>;
export type CreditsUsage = InferSelectModel<typeof creditsUsage>;
export type Chatbot = InferSelectModel<typeof chatbot> & {
  name: string;
};
export type CalendlyIntegration = InferSelectModel<typeof calendlyIntegration>;
export type ActionType = InferSelectModel<typeof Action>;
