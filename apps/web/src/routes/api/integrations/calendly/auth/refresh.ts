import { db } from "@/db";
import { calendlyIntegration, chatbot } from "@/db/schema";
import { isUserMemberOfOrganization } from "@/lib/ai/chat-functions";
import { ensureCalendlyAccessToken } from "@/lib/integrations/calendly";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";
import z from "zod";

const bodySchema = z.object({
  chatbotId: z.string().min(1),
});

export const ServerRoute = createServerFileRoute(
  "/api/integrations/calendly/auth/refresh",
).methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = session.session?.activeOrganizationId;
    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const { chatbotId } = parsed.data;

    const membership = await isUserMemberOfOrganization(
      session.user.id,
      organizationId,
    );
    if (!membership) return json({ error: "Forbidden" }, { status: 403 });

    // Ensure chatbot belongs to organization
    const [bot] = await db
      .select({ id: chatbot.id })
      .from(chatbot)
      .where(
        and(
          eq(chatbot.id, chatbotId),
          eq(chatbot.organizationId, organizationId),
        ),
      );
    if (!bot) {
      return json({ error: "Chatbot not found" }, { status: 404 });
    }

    const [integration] = await db
      .select()
      .from(calendlyIntegration)
      .where(
        and(
          eq(calendlyIntegration.chatbotId, chatbotId),
          eq(calendlyIntegration.isActive, true),
        ),
      );
    if (!integration) {
      return json({ error: "No active Calendly integration" }, { status: 404 });
    }

    const { integration: updated, refreshed } =
      await ensureCalendlyAccessToken(chatbotId);

    return json({
      refreshed,
      accessTokenExpiresAt: updated?.accessTokenExpiresAt,
    });
  },
});
