CREATE TABLE "credits_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"credit_count" integer DEFAULT 0 NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"reset_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"modifiedAt" timestamp,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"recurringInterval" text NOT NULL,
	"status" text NOT NULL,
	"currentPeriodStart" timestamp NOT NULL,
	"currentPeriodEnd" timestamp NOT NULL,
	"cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
	"canceledAt" timestamp,
	"startedAt" timestamp NOT NULL,
	"endsAt" timestamp,
	"endedAt" timestamp,
	"customerId" text NOT NULL,
	"productId" text NOT NULL,
	"discountId" text,
	"checkoutId" text NOT NULL,
	"customerCancellationReason" text,
	"customerCancellationComment" text,
	"metadata" text,
	"customFieldData" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitor_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"visitor_id" text NOT NULL,
	"user_agent" text,
	"device_type" text,
	"platform" text,
	"city" text,
	"region" text,
	"country" text,
	"country_code" text,
	"continent" text,
	"ip" text,
	"referer" text,
	"event" text,
	"duration_ms" integer,
	"extra" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_integration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" text NOT NULL,
	"business_account_id" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"scope" text,
	"phone_numbers" jsonb,
	"primary_phone_number_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_message_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"whatsapp_message_id" text,
	"status" varchar DEFAULT 'sent' NOT NULL,
	"timestamp" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_message_metadata_whatsapp_message_id_unique" UNIQUE("whatsapp_message_id")
);
--> statement-breakpoint
ALTER TABLE "embedded_chat_session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "embedded_message" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "embedded_chat_session" CASCADE;--> statement-breakpoint
DROP TABLE "embedded_message" CASCADE;--> statement-breakpoint
ALTER TABLE "chatbot" DROP CONSTRAINT "chatbot_embed_key_unique";--> statement-breakpoint
ALTER TABLE "lead" DROP CONSTRAINT "lead_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "Chat" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "channel" varchar DEFAULT 'web' NOT NULL;--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "external_user_id" text;--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "external_user_name" text;--> statement-breakpoint
ALTER TABLE "chatbot" ADD COLUMN "is_embedding_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "chatbot" ADD COLUMN "embed_token" text;--> statement-breakpoint
ALTER TABLE "chatbot" ADD COLUMN "allowed_domains" text[];--> statement-breakpoint
ALTER TABLE "chatbot" ADD COLUMN "whatsapp_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chatbot" ADD COLUMN "whatsapp_phone_number_id" text;--> statement-breakpoint
ALTER TABLE "chatbot" ADD COLUMN "whatsapp_business_account_id" text;--> statement-breakpoint
ALTER TABLE "chatbot" ADD COLUMN "whatsapp_welcome_message" text;--> statement-breakpoint
ALTER TABLE "chatbot" ADD COLUMN "whatsapp_settings" jsonb;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "organization_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "contact" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "last_trained_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "external_id" text;--> statement-breakpoint
ALTER TABLE "credits_usage" ADD CONSTRAINT "credits_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor_analytics" ADD CONSTRAINT "visitor_analytics_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_integration" ADD CONSTRAINT "whatsapp_integration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_integration" ADD CONSTRAINT "whatsapp_integration_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_message_metadata" ADD CONSTRAINT "whatsapp_message_metadata_message_id_Message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."Message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot" DROP COLUMN "embed_key";--> statement-breakpoint
ALTER TABLE "lead" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "lead" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "lead" DROP COLUMN "company";--> statement-breakpoint
ALTER TABLE "lead" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "lead" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "chatbot" ADD CONSTRAINT "chatbot_embed_token_unique" UNIQUE("embed_token");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_external_id_unique" UNIQUE("external_id");