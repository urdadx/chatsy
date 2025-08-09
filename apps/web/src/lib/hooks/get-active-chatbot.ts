import { db } from "@/db";
import { chatbot, member } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function getActiveChatbot(userId: string, organizationId: string) {
  // Get the user's most recent chatbot for the specific organization
  const [chatbotData] = await db
    .select({
      id: chatbot.id,
      name: chatbot.name,
      organizationId: chatbot.organizationId,
      image: chatbot.image,
      primaryColor: chatbot.primaryColor,
      theme: chatbot.theme,
      hidePoweredBy: chatbot.hidePoweredBy,
      initialMessage: chatbot.initialMessage,
      suggestedMessages: chatbot.suggestedMessages,
      isEmbeddingEnabled: chatbot.isEmbeddingEnabled,
      embedToken: chatbot.embedToken,
      allowedDomains: chatbot.allowedDomains,
      whatsappEnabled: chatbot.whatsappEnabled,
      whatsappPhoneNumberId: chatbot.whatsappPhoneNumberId,
      whatsappBusinessAccountId: chatbot.whatsappBusinessAccountId,
      whatsappWelcomeMessage: chatbot.whatsappWelcomeMessage,
      whatsappSettings: chatbot.whatsappSettings,
      createdAt: chatbot.createdAt,
      updatedAt: chatbot.updatedAt,
    })
    .from(chatbot)
    .innerJoin(member, eq(chatbot.organizationId, member.organizationId))
    .where(
      and(
        eq(member.userId, userId),
        eq(chatbot.organizationId, organizationId),
      ),
    )
    .orderBy(desc(chatbot.createdAt))
    .limit(1);

  if (!chatbotData) {
    throw new Error("User has no chatbot access for this organization");
  }

  return chatbotData;
}
