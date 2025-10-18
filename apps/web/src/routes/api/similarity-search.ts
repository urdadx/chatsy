import { searchKnowledge } from "@/lib/ai/search";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import z from "zod";

const searchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().optional().default(10),
});

export const ServerRoute = createServerFileRoute(
  "/api/similarity-search",
).methods({
  POST: async ({ request }) => {
    const chatbotId = request.headers.get("X-Chatbot-Id");
    if (!chatbotId) {
      return json({ error: "No chatbot ID provided" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = searchSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const results = await searchKnowledge(
      parsed.data.query,
      chatbotId,
      parsed.data.limit,
    );

    return json({ results });
  },
});
