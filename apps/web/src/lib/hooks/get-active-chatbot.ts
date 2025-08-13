import { db } from "@/db";
import { chatbot, member, session } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function getActiveChatbotId(userId: string) {
  const [lastSession] = await db
    .select({ activeChatbotId: session.activeChatbotId })
    .from(session)
    .where(eq(session.userId, userId))
    .orderBy(desc(session.updatedAt))
    .limit(1);

  if (lastSession?.activeChatbotId) {
    const [chatbotData] = await db
      .select({ id: chatbot.id })
      .from(chatbot)
      .innerJoin(member, eq(chatbot.organizationId, member.organizationId))
      .where(
        and(
          eq(chatbot.id, lastSession.activeChatbotId),
          eq(member.userId, userId),
        ),
      );

    if (chatbotData) {
      return chatbotData.id;
    }
  }

  const [chatbotData] = await db
    .select({ id: chatbot.id })
    .from(chatbot)
    .innerJoin(member, eq(chatbot.organizationId, member.organizationId))
    .where(eq(member.userId, userId))
    .orderBy(desc(chatbot.updatedAt))
    .limit(1);

  if (!chatbotData) {
    throw new Error("User has no chatbot access");
  }

  return chatbotData.id;
}
