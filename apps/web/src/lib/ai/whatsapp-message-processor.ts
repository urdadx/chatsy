import { db } from "@/db";
import { message, whatsappIntegration } from "@/db/schema";
import { knowledgeSearchTool } from "@/lib/ai/tools/knowledge-search";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { and, eq } from "drizzle-orm";
import { systemPrompt } from "./prompts/system-prompt";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

/**
 * Generates AI response for WhatsApp messages using the existing chat system
 */
export async function generateAIResponse(
  chatId: string,
  chatbotData: any,
  _userMessage: string,
) {
  try {
    // Get chat history for context
    const chatHistory = await db
      .select()
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(message.createdAt);

    // Convert to AI SDK format
    const messages = chatHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Generate AI response
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt(chatbotData.name || "Assistant"),
      messages,
      tools: {
        knowledge_base: knowledgeSearchTool(chatbotData.organizationId),
      },
    });

    // Save assistant response to database
    await db.insert(message).values({
      chatId,
      role: "assistant",
      content: text,
      parts: [{ type: "text", content: text }],
    });

    return text;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm sorry, I'm having trouble responding right now. Please try again later.";
  }
}

/**
 * Sends a WhatsApp message using the business API
 */
export async function sendWhatsAppMessage(
  phoneNumberId: string,
  to: string,
  messageText: string,
  organizationId: string,
) {
  try {
    // Get WhatsApp access token from whatsappIntegration table
    const [whatsappAccount] = await db
      .select()
      .from(whatsappIntegration)
      .where(
        and(
          eq(whatsappIntegration.organizationId, organizationId),
          eq(whatsappIntegration.isActive, true),
        ),
      );

    if (!whatsappAccount?.accessToken) {
      throw new Error("No WhatsApp access token found");
    }

    const response = await fetch(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${whatsappAccount.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: messageText },
        }),
      },
    );

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error.message);
    }

    return result;
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    throw error;
  }
}
