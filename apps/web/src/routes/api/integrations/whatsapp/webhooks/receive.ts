import { createHmac } from "node:crypto";
import { db } from "@/db";
import { chat, chatbot, message, whatsappMessageMetadata } from "@/db/schema";

import {
  generateAIResponse,
  sendWhatsAppMessage,
} from "@/lib/ai/whatsapp-message-processor";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";

function verifyWebhookSignature(
  body: string,
  signature: string | null,
): boolean {
  if (!signature) return false;

  const expectedSignature = createHmac(
    "sha256",
    process.env.WHATSAPP_APP_SECRET!,
  )
    .update(body)
    .digest("hex");

  return signature === `sha256=${expectedSignature}`;
}

async function processWhatsAppMessage(messageData: any) {
  try {
    const { messages, metadata } = messageData;
    if (!messages || messages.length === 0) return;

    const incomingMessage = messages[0];
    const { from, id: whatsappMessageId, text, type } = incomingMessage;
    const phoneNumberId = metadata.phone_number_id;

    // Find chatbot by phone number ID
    const [chatbotData] = await db
      .select()
      .from(chatbot)
      .where(eq(chatbot.whatsappPhoneNumberId, phoneNumberId));

    if (!chatbotData || !chatbotData.whatsappEnabled) {
      console.log("No enabled chatbot found for phone number:", phoneNumberId);
      return;
    }

    // Create or find existing chat
    let existingChat = await db.query.chat.findFirst({
      where: and(
        eq(chat.organizationId, chatbotData.organizationId),
        eq(chat.channel, "whatsapp"),
        eq(chat.externalUserId, from),
      ),
    });

    if (!existingChat) {
      const [newChat] = await db
        .insert(chat)
        .values({
          title: `WhatsApp: ${from}`,
          organizationId: chatbotData.organizationId,
          channel: "whatsapp",
          externalUserId: from,
          externalUserName: metadata.display_phone_number || from,
          userId: null, // Anonymous external user
          visibility: "private",
        })
        .returning();

      existingChat = newChat;
    }

    // Store incoming message
    const messageContent = text?.body || `[${type} message]`;
    const [newMessage] = await db
      .insert(message)
      .values({
        chatId: existingChat.id,
        role: "user",
        content: messageContent,
        parts: [{ type: "text", content: messageContent }],
      })
      .returning();

    // Store WhatsApp metadata
    await db.insert(whatsappMessageMetadata).values({
      messageId: newMessage.id,
      whatsappMessageId,
      status: "received",
      timestamp: new Date(),
    });

    // Generate AI response using existing chat system
    const response = await generateAIResponse(
      existingChat.id,
      chatbotData,
      messageContent,
    );

    // Send response via WhatsApp
    await sendWhatsAppMessage(
      phoneNumberId,
      from,
      response,
      chatbotData.organizationId,
    );

    console.log("Successfully processed WhatsApp message and sent response");
  } catch (error) {
    console.error("Error processing WhatsApp message:", error);
  }
}

export const ServerRoute = createServerFileRoute(
  "/api/integrations/whatsapp/webhooks/receive",
).methods({
  GET: async ({ request }) => {
    // Handle webhook verification (same as verify endpoint)
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (
      mode === "subscribe" &&
      token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
    ) {
      return new Response(challenge, { status: 200 });
    }

    return new Response("Verification failed", { status: 403 });
  },

  POST: async ({ request }) => {
    const signature = request.headers.get("x-hub-signature-256");
    const body = await request.text();

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 401 });
    }

    try {
      const data = JSON.parse(body);

      // Process each webhook entry
      for (const entry of data.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === "messages") {
            await processWhatsAppMessage(change.value);
          }
        }
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Error processing WhatsApp webhook:", error);
      return new Response("Processing failed", { status: 500 });
    }
  },
});
