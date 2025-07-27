ALTER TABLE "chatbot" ADD COLUMN "embed_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "chatbot" ADD CONSTRAINT "chatbot_embed_key_unique" UNIQUE("embed_key");