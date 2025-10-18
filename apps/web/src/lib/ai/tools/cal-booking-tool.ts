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
            error: "No Cal.com booking actions configured",
            userIntent,
          };
        }

        const bestMatch = findBestActionMatch({
          userIntent,
          preferredType: preferredMeetingType,
          actions: calActions,
        });

        if (!bestMatch) {
          return {
            error: "No matching Cal.com booking found for this request",
            userIntent,
            availableActions: calActions.map((a) => ({
              name: a.name,
              description: a.description,
            })),
          };
        }

        const properties = bestMatch.actionProperties as {
          eventTypeId: number;
          eventTypeName?: string;
          duration?: number;
        } | null;

        if (!properties || !properties.eventTypeId) {
          return {
            error: "Invalid Cal.com configuration - missing event type ID",
            actionId: bestMatch.id,
          };
        }

        return {
          success: true,
          actionId: bestMatch.id,
          name: bestMatch.name,
          description: bestMatch.description,
          eventTypeId: properties.eventTypeId,
          eventTypeName: properties.eventTypeName,
          duration: properties.duration,
          userIntent: userIntent,
          context: context || undefined,
          meetingType: preferredMeetingType,
        };
      } catch (error) {
        console.error("Error executing Cal.com booking tool:", error);
        return {
          error: "Failed to process Cal.com booking request",
          userIntent,
        };
      }
    },
  });
