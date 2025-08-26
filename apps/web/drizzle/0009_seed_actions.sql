CREATE TABLE "action" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"tool_name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stream" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"createdAt" timestamp NOT NULL,
	CONSTRAINT "stream_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "Chat" RENAME COLUMN "organization_id" TO "chatbot_id";--> statement-breakpoint
ALTER TABLE "document_source" RENAME COLUMN "organization_id" TO "chatbot_id";--> statement-breakpoint
ALTER TABLE "feedback" RENAME COLUMN "organization_id" TO "chatbot_id";--> statement-breakpoint
ALTER TABLE "knowledge" RENAME COLUMN "organization_id" TO "chatbot_id";--> statement-breakpoint
ALTER TABLE "lead" RENAME COLUMN "organization_id" TO "chatbot_id";--> statement-breakpoint
ALTER TABLE "product" RENAME COLUMN "organization_id" TO "chatbot_id";--> statement-breakpoint
ALTER TABLE "question" RENAME COLUMN "organization_id" TO "chatbot_id";--> statement-breakpoint
ALTER TABLE "subscription" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "text_source" RENAME COLUMN "organization_id" TO "chatbot_id";--> statement-breakpoint
ALTER TABLE "visitor_analytics" RENAME COLUMN "organization_id" TO "chatbot_id";--> statement-breakpoint
ALTER TABLE "website_source" RENAME COLUMN "organization_id" TO "chatbot_id";--> statement-breakpoint
ALTER TABLE "whatsapp_integration" RENAME COLUMN "organization_id" TO "chatbot_id";--> statement-breakpoint
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "document_source" DROP CONSTRAINT "document_source_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "knowledge" DROP CONSTRAINT "knowledge_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "lead" DROP CONSTRAINT "lead_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "product" DROP CONSTRAINT "product_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "question" DROP CONSTRAINT "question_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "text_source" DROP CONSTRAINT "text_source_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "visitor_analytics" DROP CONSTRAINT "visitor_analytics_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "website_source" DROP CONSTRAINT "website_source_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "whatsapp_integration" DROP CONSTRAINT "whatsapp_integration_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "status" varchar DEFAULT 'unresolved' NOT NULL;--> statement-breakpoint
ALTER TABLE "chatbot" ADD COLUMN "training_status" text DEFAULT 'idle';--> statement-breakpoint
ALTER TABLE "chatbot" ADD COLUMN "last_trained_at" timestamp;--> statement-breakpoint
ALTER TABLE "chatbot" ADD COLUMN "sources_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "external_customer_id" uuid;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "chatbot_count" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_chatbot_id" uuid;--> statement-breakpoint
ALTER TABLE "stream" ADD CONSTRAINT "stream_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_source" ADD CONSTRAINT "document_source_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge" ADD CONSTRAINT "knowledge_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead" ADD CONSTRAINT "lead_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_active_chatbot_id_chatbot_id_fk" FOREIGN KEY ("active_chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "text_source" ADD CONSTRAINT "text_source_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor_analytics" ADD CONSTRAINT "visitor_analytics_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_source" ADD CONSTRAINT "website_source_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_integration" ADD CONSTRAINT "whatsapp_integration_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Message" DROP COLUMN "content";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "training_status";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "last_trained_at";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "sources_count";--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_external_customer_id_unique" UNIQUE("external_customer_id");--> statement-breakpoint

-- Seed the action table with the default actions
INSERT INTO "action" ("name", "tool_name", "description", "is_active") VALUES
('Knowledge base', 'knowledge_base', 'Search the knowledge base for relevant information', true),
('Feedback form', 'collect_feedback', 'Collects feedback from users using a form', true),
('Collect leads', 'collect_leads', 'Captures leads from conversations with customers', true),
('Escalate to human', 'escalate_to_human', 'Escalates the conversation to a human agent', true);