import { db } from "@/db";
import { feedback, issueReport, lead } from "@/db/schema";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { desc, eq, sql } from "drizzle-orm";
import { unionAll } from "drizzle-orm/pg-core";
import { auth } from "../../../../auth";

export const ServerRoute = createServerFileRoute("/api/activity/").methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const activeChatbotId =
      session?.session?.activeChatbotId ||
      (await getActiveChatbotId(session.user.id));

    const unionQuery = unionAll(
      db
        .select({
          id: lead.id,
          created_at: lead.createdAt,
          name: sql<string>`COALESCE(NULLIF(TRIM(${lead.name}), ''), 'Anonymous')`.as(
            "name",
          ),
          contact: lead.contact,
          location: lead.location,
          type: sql<string>`'lead'`.as("type"),
        })
        .from(lead)
        .where(eq(lead.chatbotId, activeChatbotId)),

      db
        .select({
          id: feedback.id,
          created_at: feedback.createdAt,
          name: sql<string>`COALESCE(NULLIF(TRIM(${feedback.email}), ''), 'Anonymous')`.as(
            "name",
          ),
          contact: feedback.email,
          location: feedback.location,
          type: sql<string>`'feedback'`.as("type"),
        })
        .from(feedback)
        .where(eq(feedback.chatbotId, activeChatbotId)),

      db
        .select({
          id: issueReport.id,
          created_at: issueReport.createdAt,
          name: sql<string>`COALESCE(NULLIF(TRIM(${issueReport.email}), ''), 'Anonymous')`.as(
            "name",
          ),
          contact: sql<string>`COALESCE(${issueReport.email}, '')`.as(
            "contact",
          ),
          location: issueReport.location,
          type: sql<string>`'issue'`.as("type"),
        })
        .from(issueReport)
        .where(eq(issueReport.chatbotId, activeChatbotId)),
    ).as("combined");

    const result = await db
      .select({
        id: unionQuery.id,
        date: unionQuery.created_at,
        name: unionQuery.name,
        contact: unionQuery.contact,
        location: unionQuery.location,
        type: unionQuery.type,
      })
      .from(unionQuery)
      .orderBy(desc(unionQuery.created_at));

    return json({ items: result });
  },
});
