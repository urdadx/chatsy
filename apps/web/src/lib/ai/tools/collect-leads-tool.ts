import { db } from "@/db";
import { Action } from "@/db/schema";
import { findBestActionMatch } from "@/lib/utils/action-matching";
import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const collectLeadsTool = (chatbotId: string) =>
  tool({
    description: `Collect lead information from users when they express interest or when configured to do so. Only use this tool when the user's request clearly matches one of the available lead collection descriptions for this chatbot.`,
    inputSchema: z.object({
      userIntent: z
        .string()
        .describe("Description of what the user is trying to do or asking for"),
      context: z
        .string()
        .optional()
        .describe("Additional context about the conversation"),
    }),
    execute: async ({ userIntent, context }) => {
      try {
        // Get all active collect leads actions for this chatbot
        const collectLeadsActions = await db
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
              eq(Action.toolName, "collect_leads"),
              eq(Action.isActive, true),
              eq(Action.chatbotId, chatbotId),
            ),
          );

        if (!collectLeadsActions.length) {
          return {
            error: "No lead collection actions configured",
            userIntent,
          };
        }

        const bestMatch = findBestActionMatch({
          userIntent,
          actions: collectLeadsActions,
        });

        if (!bestMatch) {
          return {
            error:
              "No matching lead collection action found for the user's intent",
            userIntent,
            availableActions: collectLeadsActions.map((a) => ({
              name: a.name,
              description: a.description,
            })),
          };
        }

        // Return the action configuration for the UI to display the form
        return {
          success: true,
          action: {
            id: bestMatch.id,
            name: bestMatch.name,
            description: bestMatch.description,
            properties: bestMatch.actionProperties,
            showInQuickMenu: bestMatch.showInQuickMenu,
          },
          userIntent,
          context,
        };
      } catch (error) {
        console.error("Error in collectLeadsTool:", error);
        return {
          error: "Failed to process lead collection request",
          details: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  });
