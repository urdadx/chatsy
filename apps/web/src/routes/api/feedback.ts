import { db } from "@/db";
import { feedback } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { z } from "zod";

const feedbackSchema = z.object({
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(1),
});

export const ServerRoute = createServerFileRoute("/api/feedback").methods({
  POST: async ({ request }) => {
    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error }, { status: 400 });
    }

    try {
      await db.insert(feedback).values({
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
      });
      return json({ success: true, message: "Feedback received" });
    } catch (error) {
      console.error("Failed to save feedback:", error);
      return json({ error: "Failed to save feedback" }, { status: 500 });
    }
  },
});
