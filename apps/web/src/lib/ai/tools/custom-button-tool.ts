import { db } from "@/db";
import { Action } from "@/db/schema";
import { findBestActionMatch } from "@/lib/utils/action-matching";
import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const customButtonTool = (chatbotId: string) =>
  tool({
    description: `Display a custom button when user requests match configured actions. Only use this tool when the user's request clearly matches one of the available custom button descriptions for this chatbot.`,
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
        // Get all active custom button actions for this chatbot
        const customButtonActions = await db
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
              eq(Action.toolName, "custom_button"),
              eq(Action.isActive, true),
              eq(Action.chatbotId, chatbotId),
            ),
          );

        if (!customButtonActions.length) {
          return {
            error: "No custom button actions configured",
            userIntent,
          };
        }

        const bestMatch = findBestActionMatch({
          userIntent,
          actions: customButtonActions,
        });

        if (!bestMatch) {
          return {
            error: "No matching custom button found for this request",
            userIntent,
            availableActions: customButtonActions.map((a) => ({
              name: a.name,
              description: a.description,
            })),
          };
        }

        const properties = bestMatch.actionProperties as {
          buttonText: string;
          buttonUrl: string;
        } | null;

        if (!properties || !properties.buttonText || !properties.buttonUrl) {
          return {
            error: "Invalid button configuration",
            actionId: bestMatch.id,
          };
        }

        return {
          success: true,
          actionId: bestMatch.id,
          name: bestMatch.name,
          description: bestMatch.description,
          buttonText: properties.buttonText,
          buttonUrl: properties.buttonUrl,
          userIntent,
          context: context || undefined,
        };
      } catch (error) {
        console.error("Error executing custom button tool:", error);
        return {
          error: "Failed to load custom button",
          userIntent,
        };
      }
    },
  });
