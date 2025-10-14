import { db } from "@/db";
import { calendlyIntegration, chatbot } from "@/db/schema";
import { isUserMemberOfOrganization } from "@/lib/ai/chat-functions";
import { ensureCalendlyAccessToken } from "@/lib/integrations/calendly";
import { withCache } from "@/lib/redis/cache";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";
import z from "zod";

const updateSettingsSchema = z.object({});

async function fetchEventTypes(
  organizationUri: string,
  accessToken: string,
  userUri?: string,
) {
  try {
    const collected: any[] = [];
    let nextPage: string | undefined;

    const base = new URL("https://api.calendly.com/event_types");
    base.searchParams.set("organization", organizationUri);
    if (userUri) base.searchParams.set("user", userUri);
    base.searchParams.set("count", "100");

    do {
      const url = new URL(base.toString());
      if (nextPage) url.searchParams.set("page_token", nextPage);

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        console.error(
          "Calendly auth error while fetching event types",
          await response.text(),
        );
        break;
      }
      if (response.status === 429) {
        console.warn("Calendly rate limited while fetching event types");
        break;
      }

      const data = await response.json();
      if (data.error) {
        console.error("Error fetching event types:", data.error);
        break;
      }

      if (Array.isArray(data.collection)) collected.push(...data.collection);
      nextPage = data.pagination?.next_page;
    } while (nextPage);

    return collected;
  } catch (error) {
    console.error("Failed to fetch event types:", error);
    return [];
  }
}

export const ServerRoute = createServerFileRoute(
  "/api/integrations/calendly/settings/$chatbotId",
).methods({
  GET: async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
    }

    const membership = await isUserMemberOfOrganization(
      session.user.id,
      organizationId,
    );
    if (!membership) {
      return json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const settingsData = await withCache(
        `calendly-settings:${params.chatbotId}`,
        async () => {
          const [bot] = await db
            .select({ id: chatbot.id, organizationId: chatbot.organizationId })
            .from(chatbot)
            .where(
              and(
                eq(chatbot.id, params.chatbotId),
                eq(chatbot.organizationId, organizationId),
              ),
            );
          if (!bot) {
            throw new Error("Chatbot not found");
          }

          const { integration: integrationData } =
            await ensureCalendlyAccessToken(params.chatbotId);

          let calendlyAccount: any = null;
          if (integrationData) {
            let userEmail: string | undefined;
            if (integrationData.userUri) {
              try {
                const userResponse = await fetch(
                  `https://api.calendly.com/users/${integrationData.userUri.split("/").pop()}`,
                  {
                    headers: {
                      Authorization: `Bearer ${integrationData.accessToken}`,
                      "Content-Type": "application/json",
                    },
                  },
                );

                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  userEmail = userData.resource?.email;
                }
              } catch (e) {
                console.warn("Failed to fetch Calendly user email:", e);
              }
            }

            const eventTypes =
              Array.isArray(integrationData.eventTypes) &&
              integrationData.eventTypes.length > 0
                ? integrationData.eventTypes
                : await fetchEventTypes(
                    integrationData.organizationUri,
                    integrationData.accessToken,
                    integrationData.userUri,
                  );

            // Persist fetched event types if we had none stored previously
            if (
              (!integrationData.eventTypes ||
                (Array.isArray(integrationData.eventTypes) &&
                  integrationData.eventTypes.length === 0)) &&
              eventTypes.length > 0
            ) {
              try {
                await db
                  .update(calendlyIntegration)
                  .set({ eventTypes, updatedAt: new Date() })
                  .where(eq(calendlyIntegration.id, integrationData.id));
              } catch (e) {
                console.warn("Failed to persist Calendly event types", e);
              }
            }

            calendlyAccount = {
              connected: true,
              organizationUri: integrationData.organizationUri,
              userUri: integrationData.userUri,
              userEmail,
              eventTypes,
              accessTokenExpiresAt: integrationData.accessTokenExpiresAt,
            };
          }

          return { chatbotId: bot.id, calendlyAccount };
        },
        { ttl: 300 }, // 5 minutes TTL for integration settings
      );

      return json(settingsData);
    } catch (error) {
      console.error("Get Calendly settings error:", error);
      if (error instanceof Error && error.message === "Chatbot not found") {
        return json({ error: "Chatbot not found" }, { status: 404 });
      }
      return json({ error: "Failed to fetch settings" }, { status: 500 });
    }
  },

  PATCH: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
    }

    const membership = await isUserMemberOfOrganization(
      session.user.id,
      organizationId,
    );

    if (!membership) {
      return json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const body = await request.json().catch(() => ({}));
      const parsed = updateSettingsSchema.safeParse(body);
      if (!parsed.success) {
        return json({ error: z.treeifyError(parsed.error) }, { status: 400 });
      }
      return json({ ok: true });
    } catch (error) {
      console.error("Update Calendly settings error:", error);
      return json({ error: "Failed to update settings" }, { status: 500 });
    }
  },
});
