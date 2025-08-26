import { db } from "@/db";
import { Action } from "@/db/schema";
import { eq } from "drizzle-orm";

// Define the valid tool names as a const array to ensure type safety
const VALID_TOOL_NAMES = [
  "knowledge_base",
  "collect_feedback",
  "collect_leads",
  "escalate_to_human",
] as const;

// Create a type from the valid tool names
export type ValidToolName = (typeof VALID_TOOL_NAMES)[number];

export async function getActiveTools(): Promise<ValidToolName[]> {
  try {
    const activeActions = await db
      .select({ toolName: Action.toolName })
      .from(Action)
      .where(eq(Action.isActive, true));

    // Filter to only include valid tool names and cast to the correct type
    return activeActions
      .map((action) => action.toolName)
      .filter((toolName): toolName is ValidToolName =>
        VALID_TOOL_NAMES.includes(toolName as ValidToolName),
      );
  } catch (error) {
    console.error("Error fetching active tools:", error);
    return [
      "knowledge_base",
      "collect_feedback",
      "collect_leads",
      "escalate_to_human",
    ];
  }
}
