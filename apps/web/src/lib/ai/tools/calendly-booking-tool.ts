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
            success: false,
            error:
              "I'm sorry, but meeting scheduling is not currently set up for this chatbot. Please contact support",
            userIntent,
          };
        }

        const bestMatch = findBestActionMatch({
          userIntent,
          preferredType: preferredMeetingType,
          actions: calendlyActions,
        });

        if (!bestMatch) {
          const availableTypes = calendlyActions.map((a) => a.name).join(", ");
          return {
            success: false,
            error: `I couldn't find a matching meeting type for your request. Available meeting types: ${availableTypes}. Please try being more specific about which type of meeting you'd like to schedule.`,
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
            success: false,
            error:
              "There's a configuration issue with this meeting type. Kindly contact support.",
            actionId: bestMatch.id,
          };
        }

        return {
          success: true,
          actionId: bestMatch.id,
          name: bestMatch.name,
          description: bestMatch.description,
          eventTypeUri: properties.eventTypeUri,
          eventTypeName: properties.eventTypeName,
          userEmail: properties.userEmail,
          userIntent: userIntent,
          context: context || undefined,
          meetingType: preferredMeetingType,
        };
      } catch (error) {
        console.error("Error executing Calendly booking tool:", error);
        return {
          success: false,
          error:
            "I encountered an error while trying to set up the meeting. Please try again or contact support if the issue persists.",
          userIntent,
        };
      }
    },
  });
