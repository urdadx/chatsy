import { searchKnowledge } from "@/lib/ai/search";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().optional().default(10),
});

export const ServerRoute = createServerFileRoute(
  "/api/similarity-search",
).methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = searchSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const results = await searchKnowledge(
      parsed.data.query,
      organizationId,
      parsed.data.limit,
    );

    return json({ results });
  },
});
