import { db } from "@/db";
import { Action } from "@/db/schema";
import { findBestActionMatch } from "@/lib/utils/action-matching";
import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const calBookingTool = (chatbotId: string) =>
  tool({
    description:
      "Allows users to book, schedule, or arrange meetings, calls, demos, or appointments using Cal.com when they express intent to do so.",
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
        const calActions = await db
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
              eq(Action.toolName, "cal_booking"),
              eq(Action.isActive, true),
              eq(Action.chatbotId, chatbotId),
            ),
          );

        if (!calActions.length) {
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
          actions: calActions,
        });

        if (!bestMatch) {
          const availableTypes = calActions.map((a) => a.name).join(", ");
          return {
            success: false,
            error: `I couldn't find a matching meeting type for your request. Available meeting types: ${availableTypes}. Please try being more specific about which type of meeting you'd like to schedule.`,
            userIntent,
            availableActions: calActions.map((a) => ({
              name: a.name,
              description: a.description,
            })),
          };
        }

        const properties = bestMatch.actionProperties as {
          eventTypeUrl: string;
          eventTypeName?: string;
          duration?: number;
        } | null;

        if (!properties || !properties.eventTypeUrl) {
          return {
            success: false,
            error:
              "There's a configuration issue with this meeting type. Please contact support.",
            actionId: bestMatch.id,
          };
        }

        // Parse the Cal.com URL to extract username and event slug
        // Format: https://cal.com/username/event-slug
        const urlPattern = /^https:\/\/cal\.com\/([^\/]+)\/([^\/]+)$/;
        const match = properties.eventTypeUrl.match(urlPattern);

        if (!match) {
          return {
            success: false,
            error: "Please contact support to fix the configuration.",
            actionId: bestMatch.id,
          };
        }

        const [, username, eventSlug] = match;

        return {
          success: true,
          actionId: bestMatch.id,
          name: bestMatch.name,
          description: bestMatch.description,
          username,
          eventSlug,
          eventTypeName: properties.eventTypeName,
          duration: properties.duration,
          userIntent: userIntent,
          context: context || undefined,
          meetingType: preferredMeetingType,
        };
      } catch (error) {
        console.error("Error executing Cal.com booking tool:", error);
        return {
          success: false,
          error:
            "I encountered an error while trying to set up the meeting. Please try again or contact support if the issue persists.",
          userIntent,
        };
      }
    },
  });
