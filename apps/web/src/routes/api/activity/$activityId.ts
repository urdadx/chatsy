import { db } from "@/db";
import { feedback, lead } from "@/db/schema";
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

    if (!type || !["lead", "feedback"].includes(type)) {
      return json(
        { error: "Invalid or missing type parameter" },
        { status: 400 },
      );
    }

    let result: any;

    if (type === "lead") {
      const leadResult = await db
        .select()
        .from(lead)
        .where(eq(lead.id, activityId))
        .limit(1);

      result = leadResult[0] ? { ...leadResult[0], type: "lead" } : null;
    } else {
      const feedbackResult = await db
        .select()
        .from(feedback)
        .where(eq(feedback.id, activityId))
        .limit(1);

      result = feedbackResult[0]
        ? { ...feedbackResult[0], type: "feedback" }
        : null;
    }

    if (!result) {
      return json({ error: "Item not found" }, { status: 404 });
    }

    return json({ item: result });
  },
});
