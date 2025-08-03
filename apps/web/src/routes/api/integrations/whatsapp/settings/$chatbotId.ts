import { db } from "@/db";
import { chatbot, member, whatsappIntegration } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const updateSettingsSchema = z.object({
  whatsappEnabled: z.boolean().optional(),
  whatsappPhoneNumberId: z.string().optional(),
  whatsappBusinessAccountId: z.string().optional(),
  whatsappWelcomeMessage: z.string().optional(),
  whatsappSettings: z.record(z.any()).optional(),
});

// Helper function to fetch phone numbers from WhatsApp API
async function fetchPhoneNumbers(
  businessAccountId: string,
  accessToken: string,
) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${businessAccountId}/phone_numbers?access_token=${accessToken}`,
    );
    const data = await response.json();

    if (data.error) {
      console.error("Error fetching phone numbers:", data.error);
      return [];
    }

    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch phone numbers:", error);
    return [];
  }
}

export const ServerRoute = createServerFileRoute(
  "/api/integrations/whatsapp/settings/$chatbotId",
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

    // Verify user is a member of the organization
    const [membership] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.user.id),
          eq(member.organizationId, organizationId),
        ),
      );

    if (!membership) {
      return json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const [chatbotData] = await db
        .select({
          id: chatbot.id,
          whatsappEnabled: chatbot.whatsappEnabled,
          whatsappPhoneNumberId: chatbot.whatsappPhoneNumberId,
          whatsappBusinessAccountId: chatbot.whatsappBusinessAccountId,
          whatsappWelcomeMessage: chatbot.whatsappWelcomeMessage,
          whatsappSettings: chatbot.whatsappSettings,
        })
        .from(chatbot)
        .where(
          and(
            eq(chatbot.id, params.chatbotId),
            eq(chatbot.organizationId, organizationId),
          ),
        );

      if (!chatbotData) {
        return json({ error: "Chatbot not found" }, { status: 404 });
      }

      // Get WhatsApp account info if connected
      let whatsappAccount = null;
      if (chatbotData.whatsappEnabled) {
        const [integrationData] = await db
          .select()
          .from(whatsappIntegration)
          .where(
            and(
              eq(whatsappIntegration.organizationId, organizationId),
              eq(whatsappIntegration.isActive, true),
            ),
          );

        whatsappAccount = integrationData
          ? {
              connected: true,
              businessAccountId: integrationData.businessAccountId,
              // Use stored phone numbers or fetch fresh ones
              phoneNumbers:
                integrationData.phoneNumbers ||
                (await fetchPhoneNumbers(
                  integrationData.businessAccountId,
                  integrationData.accessToken,
                )),
            }
          : null;
      }

      return json({
        ...chatbotData,
        whatsappAccount,
      });
    } catch (error) {
      console.error("Get WhatsApp settings error:", error);
      return json({ error: "Failed to fetch settings" }, { status: 500 });
    }
  },

  PATCH: async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
    }

    // Verify user is a member of the organization
    const [membership] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.user.id),
          eq(member.organizationId, organizationId),
        ),
      );

    if (!membership) {
      return json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const body = await request.json();
      const parsed = updateSettingsSchema.safeParse(body);

      if (!parsed.success) {
        return json({ error: parsed.error.format() }, { status: 400 });
      }

      const updates = parsed.data;

      // Update chatbot with WhatsApp settings
      const [updatedChatbot] = await db
        .update(chatbot)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(chatbot.id, params.chatbotId),
            eq(chatbot.organizationId, organizationId),
          ),
        )
        .returning();

      if (!updatedChatbot) {
        return json({ error: "Chatbot not found" }, { status: 404 });
      }

      return json(updatedChatbot);
    } catch (error) {
      console.error("Update WhatsApp settings error:", error);
      return json({ error: "Failed to update settings" }, { status: 500 });
    }
  },
});
