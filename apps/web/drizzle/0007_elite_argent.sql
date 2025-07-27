CREATE TABLE "embedded_chat_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"chatbot_embed_key" text NOT NULL,
	"session_id" text NOT NULL,
	"domain" text,
	"user_agent" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_activity" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "embedded_chat_session_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "embedded_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"role" varchar NOT NULL,
	"content" text NOT NULL,
	"parts" json NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "embedded_chat_session" ADD CONSTRAINT "embedded_chat_session_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embedded_chat_session" ADD CONSTRAINT "embedded_chat_session_chatbot_embed_key_chatbot_embed_key_fk" FOREIGN KEY ("chatbot_embed_key") REFERENCES "public"."chatbot"("embed_key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embedded_message" ADD CONSTRAINT "embedded_message_session_id_embedded_chat_session_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."embedded_chat_session"("session_id") ON DELETE cascade ON UPDATE no action;