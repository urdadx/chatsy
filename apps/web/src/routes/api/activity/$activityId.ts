import { db } from "@/db";
import { feedback, issueReport, lead } from "@/db/schema";
import { withCache } from "@/lib/redis/cache";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute(
  "/api/activity/$activityId",
).methods({
  GET: async ({ request, params }: any) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { activityId } = params;
    const searchParams = new URL(request.url).searchParams;
    const type = searchParams.get("type");

    if (!type || !["lead", "feedback", "issue"].includes(type)) {
      return json(
        { error: "Invalid or missing type parameter" },
        { status: 400 },
      );
    }

    const result = await withCache(
      `activity-detail:${type}:${activityId}`,
      async () => {
        let item: any;

        if (type === "lead") {
          const leadResult = await db
            .select()
            .from(lead)
            .where(eq(lead.id, activityId))
            .limit(1);

          item = leadResult[0] ? { ...leadResult[0], type: "lead" } : null;
        } else if (type === "feedback") {
          const feedbackResult = await db
            .select()
            .from(feedback)
            .where(eq(feedback.id, activityId))
            .limit(1);

          item = feedbackResult[0]
            ? { ...feedbackResult[0], type: "feedback" }
            : null;
        } else if (type === "issue") {
          const issueResult = await db
            .select()
            .from(issueReport)
            .where(eq(issueReport.id, activityId))
            .limit(1);

          item = issueResult[0] ? { ...issueResult[0], type: "issue" } : null;
        }

        return item;
      },
      { ttl: 60 },
    );

    if (!result) {
      return json({ error: "Item not found" }, { status: 404 });
    }

    return json({ item: result });
  },
});
