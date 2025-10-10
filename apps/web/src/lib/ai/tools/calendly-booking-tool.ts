import { db } from "@/db";
import { Action } from "@/db/schema";
import { findBestActionMatch } from "@/lib/utils/action-matching";
import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const calendlyBookingTool = (chatbotId: string) =>
  tool({
    description:
      "Allows users to book, schedule, or arrange meetings, calls, demos, or appointments when they express intent to do so.",
    inputSchema: z.object({
      userIntent: z
        .string()
        .describe(
          "Description of what the user is trying to schedule or their meeting request",
        ),
      context: z
        .string()
        .optional()
        .describe("Additional context about the meeting request"),
      preferredMeetingType: z
        .string()
        .optional()
        .describe(
          "Type of meeting if specified (e.g., demo, consultation, sales call)",
        ),
    }),
    execute: async ({ userIntent, context, preferredMeetingType }) => {
      try {
        const calendlyActions = await db
          .select({
            id: Action.id,
            name: Action.name,
            description: Action.description,
            actionProperties: Action.actionProperties,
            showInQuickMenu: Action.showInQuickMenu,
          })
          .from(Action)
          .where(
            and(
              eq(Action.toolName, "calendly_booking"),
              eq(Action.isActive, true),
              eq(Action.chatbotId, chatbotId),
            ),
          );

        if (!calendlyActions.length) {
          return {
            error: "No Calendly booking actions configured",
            userIntent,
          };
        }

        const bestMatch = findBestActionMatch({
          userIntent,
          preferredType: preferredMeetingType,
          actions: calendlyActions,
        });

        if (!bestMatch) {
          return {
            error: "No matching Calendly booking found for this request",
            userIntent,
            availableActions: calendlyActions.map((a) => ({
              name: a.name,
              description: a.description,
            })),
          };
        }

        const properties = bestMatch.actionProperties as {
          eventTypeUri: string;
          eventTypeName?: string;
          userEmail?: string;
        } | null;

        if (!properties || !properties.eventTypeUri) {
          return {
            error: "Invalid Calendly configuration - missing event type",
            actionId: bestMatch.id,
          };
        }

        // Extract the event type slug/name from the URI for the booking URL
        const eventTypeSlug = extractEventTypeSlug(
          properties.eventTypeUri,
          properties.eventTypeName,
        );

        // Generate the Calendly booking URL
        const calendlyUrl = generateCalendlyUrl(
          properties.eventTypeUri,
          eventTypeSlug,
        );

        return {
          success: true,
          actionId: bestMatch.id,
          name: bestMatch.name,
          description: bestMatch.description,
          eventTypeUri: properties.eventTypeUri,
          eventTypeName: properties.eventTypeName,
          userEmail: properties.userEmail,
          calendlyUrl,
          userIntent,
          context: context || undefined,
          meetingType: preferredMeetingType,
        };
      } catch (error) {
        console.error("Error executing Calendly booking tool:", error);
        return {
          error: "Failed to process Calendly booking request",
          userIntent,
        };
      }
    },
  });

function extractEventTypeSlug(
  eventTypeUri: string,
  eventTypeName?: string,
): string {
  if (eventTypeName) {
    return eventTypeName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  const match = eventTypeUri.match(/\/event_types\/([^\/]+)$/);
  if (match) {
    return match[1];
  }

  return "meeting";
}

// Generate Calendly booking URL
function generateCalendlyUrl(
  eventTypeUri: string,
  eventTypeSlug: string,
): string {
  const match = eventTypeUri.match(/\/event_types\/(.+)/);
  if (match) {
    return `https://calendly.com/book/${eventTypeSlug}`;
  }
  return `https://calendly.com/book/${eventTypeSlug}`;
}
