CREATE TABLE "calendly_integration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"chatbot_id" uuid NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"scope" text,
	"organization_uri" text NOT NULL,
	"user_uri" text NOT NULL,
	"event_types" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issue_report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatbot_id" uuid NOT NULL,
	"title" text,
	"description" text NOT NULL,
	"screenshot" text,
	"email" text,
	"location" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stream" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "whatsapp_integration" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "whatsapp_message_metadata" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "stream" CASCADE;--> statement-breakpoint
DROP TABLE "whatsapp_integration" CASCADE;--> statement-breakpoint
DROP TABLE "whatsapp_message_metadata" CASCADE;--> statement-breakpoint
ALTER TABLE "action" DROP CONSTRAINT "action_chatbot_id_tool_name_unique";--> statement-breakpoint
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_Chat_id_fk";
--> statement-breakpoint
ALTER TABLE "vote" DROP CONSTRAINT "vote_chatId_Chat_id_fk";
--> statement-breakpoint
ALTER TABLE "vote" DROP CONSTRAINT "vote_messageId_Message_id_fk";
--> statement-breakpoint
ALTER TABLE "chatbot" ALTER COLUMN "initial_message" SET DEFAULT 'Hello there👋, how can I help you today?';--> statement-breakpoint
ALTER TABLE "action" ADD COLUMN "show_in_quick_menu" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "action" ADD COLUMN "action_properties" jsonb;--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "agent_assigned" text;--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "chat_meta_data" jsonb;--> statement-breakpoint
ALTER TABLE "chatbot" ADD COLUMN "personality" varchar DEFAULT 'support' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "meters" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_subscribed" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "calendly_integration" ADD CONSTRAINT "calendly_integration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendly_integration" ADD CONSTRAINT "calendly_integration_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_report" ADD CONSTRAINT "issue_report_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calendly_integration_chatbot_id_idx" ON "calendly_integration" USING btree ("chatbot_id");--> statement-breakpoint
CREATE INDEX "issue_report_chatbot_id_idx" ON "issue_report" USING btree ("chatbot_id");--> statement-breakpoint
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_agent_assigned_member_id_fk" FOREIGN KEY ("agent_assigned") REFERENCES "public"."member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_messageId_Message_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "action_chatbot_id_idx" ON "action" USING btree ("chatbot_id");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_chatbot_id_idx" ON "Chat" USING btree ("chatbot_id");--> statement-breakpoint
CREATE INDEX "chat_user_id_idx" ON "Chat" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "chat_status_idx" ON "Chat" USING btree ("status");--> statement-breakpoint
CREATE INDEX "chat_chatbot_status_idx" ON "Chat" USING btree ("chatbot_id","status");--> statement-breakpoint
CREATE INDEX "chat_created_at_idx" ON "Chat" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "chatbot_organization_id_idx" ON "chatbot" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "credits_usage_user_id_idx" ON "credits_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credits_usage_date_idx" ON "credits_usage" USING btree ("date");--> statement-breakpoint
CREATE INDEX "document_source_chatbot_id_idx" ON "document_source" USING btree ("chatbot_id");--> statement-breakpoint
CREATE INDEX "feedback_chatbot_id_idx" ON "feedback" USING btree ("chatbot_id");--> statement-breakpoint
CREATE INDEX "invitation_organization_id_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "knowledge_chatbot_id_idx" ON "knowledge" USING btree ("chatbot_id");--> statement-breakpoint
CREATE INDEX "knowledge_chatbot_source_idx" ON "knowledge" USING btree ("chatbot_id","source");--> statement-breakpoint
CREATE INDEX "knowledge_source_id_idx" ON "knowledge" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "lead_chatbot_id_idx" ON "lead" USING btree ("chatbot_id");--> statement-breakpoint
CREATE INDEX "lead_created_at_idx" ON "lead" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "member_organization_id_idx" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_user_id_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "member_org_user_idx" ON "member" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "message_chat_id_idx" ON "Message" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "message_created_at_idx" ON "Message" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "product_chatbot_id_idx" ON "product" USING btree ("chatbot_id");--> statement-breakpoint
CREATE INDEX "question_chatbot_id_idx" ON "question" USING btree ("chatbot_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "text_source_chatbot_id_idx" ON "text_source" USING btree ("chatbot_id");--> statement-breakpoint
CREATE INDEX "visitor_analytics_chatbot_id_idx" ON "visitor_analytics" USING btree ("chatbot_id");--> statement-breakpoint
CREATE INDEX "visitor_analytics_created_at_idx" ON "visitor_analytics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "visitor_analytics_chatbot_created_idx" ON "visitor_analytics" USING btree ("chatbot_id","created_at");--> statement-breakpoint
CREATE INDEX "visitor_analytics_event_idx" ON "visitor_analytics" USING btree ("event");--> statement-breakpoint
CREATE INDEX "website_source_chatbot_id_idx" ON "website_source" USING btree ("chatbot_id");--> statement-breakpoint
ALTER TABLE "Chat" DROP COLUMN "external_user_id";--> statement-breakpoint
ALTER TABLE "Chat" DROP COLUMN "external_user_name";--> statement-breakpoint
ALTER TABLE "chatbot" DROP COLUMN "whatsapp_enabled";--> statement-breakpoint
ALTER TABLE "chatbot" DROP COLUMN "whatsapp_phone_number_id";--> statement-breakpoint
ALTER TABLE "chatbot" DROP COLUMN "whatsapp_business_account_id";--> statement-breakpoint
ALTER TABLE "chatbot" DROP COLUMN "whatsapp_welcome_message";--> statement-breakpoint
ALTER TABLE "chatbot" DROP COLUMN "whatsapp_settings";