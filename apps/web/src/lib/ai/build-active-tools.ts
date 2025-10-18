import { cache } from "@/lib/ai/tool-cache";
import { calBookingTool } from "@/lib/ai/tools/cal-booking-tool";
import { calendlyBookingTool } from "@/lib/ai/tools/calendly-booking-tool";
import { collectFeedbackTool } from "@/lib/ai/tools/collect-feedback-tool";
import { collectLeadsTool } from "@/lib/ai/tools/collect-leads-tool";
import { customButtonTool } from "@/lib/ai/tools/custom-button-tool";
import { escalateToHumanTool } from "@/lib/ai/tools/escalate-to-human-tool";
import { knowledgeSearchTool } from "@/lib/ai/tools/knowledge-search-tool";
import type { ValidToolName } from "./get-active-tools";

interface BuildToolsParams {
  activeToolNames: ValidToolName[];
  chatbotId: string;
  chatId: string;
  organizationId: string;
}

/**
 * Dynamically builds the tools object based on active tool names.
 * Only registers tools that are marked as active for the chatbot.
 * All tools are wrapped with cache() for performance optimization.
 */
export function buildActiveTools({
  activeToolNames,
  chatbotId,
  chatId,
  organizationId,
}: BuildToolsParams): Record<string, any> {
  const tools: Record<string, any> = {};

  if (activeToolNames.includes("knowledge_base")) {
    tools.knowledge_base = cache(knowledgeSearchTool(chatbotId));
  }

  if (activeToolNames.includes("collect_feedback")) {
    tools.collect_feedback = cache(collectFeedbackTool);
  }

  if (activeToolNames.includes("collect_leads")) {
    tools.collect_leads = cache(collectLeadsTool(chatbotId));
  }

  if (activeToolNames.includes("custom_button")) {
    tools.custom_button = cache(customButtonTool(chatbotId));
  }

  if (activeToolNames.includes("calendly_booking")) {
    tools.calendly_booking = cache(calendlyBookingTool(chatbotId));
  }

  if (activeToolNames.includes("cal_booking")) {
    tools.cal_booking = cache(calBookingTool(chatbotId));
  }

  if (activeToolNames.includes("escalate_to_human")) {
    tools.escalate_to_human = cache(
      escalateToHumanTool({
        chatId,
        chatbotId,
        organizationId,
      }),
    );
  }

  return tools;
}
