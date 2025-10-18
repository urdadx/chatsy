import { db } from "@/db";
import { Action } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const VALID_TOOL_NAMES = [
  "knowledge_base",
  "collect_feedback",
  "collect_leads",
  "escalate_to_human",
  "custom_button",
  "calendly_booking",
  "cal_booking",
] as const;

export type ValidToolName = (typeof VALID_TOOL_NAMES)[number];

// Map database tool names to the expected tool names in code
const TOOL_NAME_MAPPING: Record<string, ValidToolName> = {
  caldotcom: "cal_booking",
  cal_booking: "cal_booking",
  calendly_booking: "calendly_booking",
  custom_button: "custom_button",
  collect_leads: "collect_leads",
  collect_feedback: "collect_feedback",
  escalate_to_human: "escalate_to_human",
  knowledge_base: "knowledge_base",
};

export interface ActiveToolInfo {
  toolName: ValidToolName;
  actions: Array<{
    id: string;
    name: string;
    description: string | null;
    actionProperties: any;
  }>;
}

/**
 * Get all active tools for a specific chatbot with their associated actions
 * This eliminates the need for separate queries for each tool type
 */
export async function getActiveToolsWithActions(chatbotId: string): Promise<{
  activeToolNames: ValidToolName[];
  toolsMap: Map<ValidToolName, ActiveToolInfo>;
}> {
  try {
    const activeActions = await db
      .select({
        id: Action.id,
        toolName: Action.toolName,
        name: Action.name,
        description: Action.description,
        actionProperties: Action.actionProperties,
      })
      .from(Action)
      .where(and(eq(Action.chatbotId, chatbotId), eq(Action.isActive, true)));

    const toolsMap = new Map<ValidToolName, ActiveToolInfo>();
    const toolNamesSet = new Set<ValidToolName>();

    // Always include knowledge_base, collect_feedback, and escalate_to_human as they're core features
    const coreTools: ValidToolName[] = [
      "knowledge_base",
      "collect_feedback",
      "escalate_to_human",
    ];

    for (const coreTool of coreTools) {
      toolNamesSet.add(coreTool);
      if (!toolsMap.has(coreTool)) {
        toolsMap.set(coreTool, {
          toolName: coreTool,
          actions: [],
        });
      }
    }

    // Group actions by normalized tool name
    for (const action of activeActions) {
      const normalizedToolName = TOOL_NAME_MAPPING[action.toolName];

      if (normalizedToolName) {
        toolNamesSet.add(normalizedToolName);

        if (!toolsMap.has(normalizedToolName)) {
          toolsMap.set(normalizedToolName, {
            toolName: normalizedToolName,
            actions: [],
          });
        }

        toolsMap.get(normalizedToolName)?.actions.push({
          id: action.id,
          name: action.name,
          description: action.description,
          actionProperties: action.actionProperties,
        });
      } else {
        console.warn(
          `Unknown tool name in database: ${action.toolName}. Please update TOOL_NAME_MAPPING.`,
        );
      }
    }

    return {
      activeToolNames: Array.from(toolNamesSet),
      toolsMap,
    };
  } catch (error) {
    console.error("Error fetching active tools:", error);
    // Return default core tools on error
    return {
      activeToolNames: [
        "knowledge_base",
        "collect_feedback",
        "escalate_to_human",
      ],
      toolsMap: new Map(),
    };
  }
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use getActiveToolsWithActions instead for better performance
 */
export async function getActiveTools(
  chatbotId?: string,
): Promise<ValidToolName[]> {
  if (!chatbotId) {
    console.warn(
      "getActiveTools called without chatbotId - returning default tools",
    );
    return ["knowledge_base", "collect_feedback", "escalate_to_human"];
  }

  const { activeToolNames } = await getActiveToolsWithActions(chatbotId);
  return activeToolNames;
}
