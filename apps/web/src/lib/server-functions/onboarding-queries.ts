import { db } from "@/db";
import { chatbot } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "auth";
import { eq } from "drizzle-orm";
import z from "zod";
import { isUserMemberOfOrganization } from "../ai/chat-functions";

const UpdateChatbotSchema = z.object({
  primaryColor: z.string().optional(),
  personality: z.enum(["support", "sales", "lead", "custom"]).optional(),
  name: z.string().optional(),
  theme: z.string().optional(),
  hidePoweredBy: z.boolean().optional(),
  initialMessage: z.string().optional(),
});

export const updateChatbot = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    try {
      return UpdateChatbotSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation failed: ${error.issues.map((e) => e.message).join(", ")}`,
        );
      }
      throw new Error("Invalid input data");
    }
  })
  .handler(async ({ data }) => {
    try {
      const request = getWebRequest();
      const session = await auth.api.getSession({
        headers: request?.headers || new Headers(),
      });

      if (!session?.user?.id) {
        throw new Error("Unauthorized: Please log in to update your chatbot");
      }

      const organizationId = session?.session?.activeOrganizationId;
      if (!organizationId) {
        throw new Error("No active organization");
      }

      const isMember = await isUserMemberOfOrganization(
        session.user.id,
        organizationId,
      );

      if (!isMember) {
        throw new Error("Forbidden: You are not a member of this organization");
      }

      const existingChatbot = await db
        .select({ id: chatbot.id })
        .from(chatbot)
        .where(eq(chatbot.organizationId, organizationId))
        .limit(1);

      if (existingChatbot.length === 0) {
        throw new Error("Chatbot not found for this organization");
      }

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (data.primaryColor !== undefined) {
        updateData.primaryColor = data.primaryColor;
      }
      if (data.personality !== undefined) {
        updateData.personality = data.personality;
      }

      const [updatedChatbot] = await db
        .update(chatbot)
        .set(updateData)
        .where(eq(chatbot.organizationId, organizationId))
        .returning({
          id: chatbot.id,
          organizationId: chatbot.organizationId,
          name: chatbot.name,
          image: chatbot.image,
          primaryColor: chatbot.primaryColor,
          personality: chatbot.personality,
        });

      return {
        success: true,
        message: "Chatbot updated successfully",
        chatbot: {
          ...updatedChatbot,
        },
      };
    } catch (error) {
      console.error("Error updating chatbot:", error);

      if (error instanceof Error) {
        if (
          error.message.startsWith("Unauthorized") ||
          error.message.startsWith("Validation failed") ||
          error.message.startsWith("Chatbot not found") ||
          error.message.startsWith("Forbidden") ||
          error.message.startsWith("No active organization") ||
          error.message.startsWith("Insufficient permissions")
        ) {
          throw error;
        }
      }

      throw new Error("Failed to update chatbot. Please try again later.");
    }
  });
