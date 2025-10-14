import type { UIMessage } from "ai";
import z from "zod";
import type { collectFeedbackTool } from "./ai/tools/collect-feedback";
import type { collectLeadsTool } from "./ai/tools/collect-leads-tool";
import type { customButtonTool } from "./ai/tools/custom-button-tool";
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
  custom_button: typeof customButtonTool;
};

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
  originalRole: z.string().optional(),
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

export type ChatbotDetails = {
  id: string;
  organizationId: string;
  name: string | null;
  image: string | null;
  primaryColor: string;
  theme: string;
  hidePoweredBy: boolean;
  personality: "support" | "sales" | "lead";
  initialMessage: string;
  suggestedMessages: string[] | null;
  trainingStatus: string | null;
  lastTrainedAt: Date | null;
  sourcesCount: number;
  isEmbeddingEnabled: boolean;
  embedToken: string | null;
  allowedDomains: string[] | null;
  whatsappEnabled: boolean;
  whatsappPhoneNumberId: string | null;
  whatsappBusinessAccountId: string | null;
  whatsappWelcomeMessage: string | null;
  whatsappSettings: any;
  createdAt: Date;
  updatedAt: Date;
};

export type DeviceInfo = {
  type: "mobile" | "tablet" | "desktop" | "unknown";
  os: string;
  browser: string;
  isIOS: boolean;
  isAndroid: boolean;
  isMac: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  model?: string;
};

export type ChatMetaData = {
  country?: string;
  city?: string;
  timezone?: string;
  device?: DeviceInfo;
};

export type ChatData = {
  id: string;
  createdAt: Date;
  title: string;
  userId: string | null;
  chatbotId: string;
  visibility: string;
  channel: string;
  status: string;
  agentAssigned: string | null;
  chatMetaData: unknown;
  assignedUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};
