ALTER TABLE "action" ADD COLUMN "chatbot_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "action" ADD CONSTRAINT "action_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action" ADD CONSTRAINT "action_chatbot_id_tool_name_unique" UNIQUE("chatbot_id","tool_name");