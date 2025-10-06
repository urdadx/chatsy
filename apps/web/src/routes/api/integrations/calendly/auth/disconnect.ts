import { db } from "@/db";
import { calendlyIntegration } from "@/db/schema";
import { isUserMemberOfOrganization } from "@/lib/ai/chat-functions";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";
import z from "zod";

const bodySchema = z.object({
  chatbotId: z.string(),
});

export const ServerRoute = createServerFileRoute(
  "/api/integrations/calendly/auth/disconnect",
).methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id)
      return json({ error: "Unauthorized" }, { status: 401 });

    const organizationId = session.session?.activeOrganizationId;
    if (!organizationId)
      return json({ error: "No active organization" }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success)
      return json({ error: parsed.error.format() }, { status: 400 });

    const { chatbotId } = parsed.data;

    const membership = await isUserMemberOfOrganization(
      session.user.id,
      organizationId,
    );

    if (!membership) return json({ error: "Forbidden" }, { status: 403 });

    const updated = await db
      .update(calendlyIntegration)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(calendlyIntegration.chatbotId, chatbotId),
          eq(calendlyIntegration.isActive, true),
        ),
      )
      .returning();

    if (!updated.length) {
      return json(
        { error: "No active Calendly integration found" },
        { status: 404 },
      );
    }

    return json({ success: true });
  },
});
