import type { UIMessage } from "ai";
import z from "zod";
import type { collectFeedbackTool } from "./ai/tools/collect-feedback";
import type { collectLeadsTool } from "./ai/tools/collect-leads";
import type { knowledgeSearchTool } from "./ai/tools/knowledge-search";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null | undefined;
}

export type VisibilityType = "private" | "public";

export type ChatTools = {
  knowledge_base: typeof knowledgeSearchTool;
  collect_feedback: typeof collectFeedbackTool;
  collect_leads: typeof collectLeadsTool;
};

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  appendMessage: string;
  id: string;
  title: string;
  clear: null;
  finish: null;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;
