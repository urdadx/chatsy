import { db } from "@/db";
import { chatbot, member } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";
import z from "zod";

// Get chatbot details server function
export const getChatbotDetails = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const request = getWebRequest();
      const session = await auth.api.getSession({
        headers: request?.headers || new Headers(),
      });

      if (!session?.user?.id) {
        throw new Error("Unauthorized: Please log in to view chatbot details");
      }

      const organizationId = session?.session?.activeOrganizationId;
      if (!organizationId) {
        throw new Error("No active organization");
      }

      // Verify user is a member of the organization
      const [membership] = await db
        .select()
        .from(member)
        .where(
          and(
            eq(member.userId, session.user.id),
            eq(member.organizationId, organizationId),
          ),
        );

      if (!membership) {
        throw new Error("Forbidden: You are not a member of this organization");
      }

      // Get the chatbot details
      const [chatbotDetails] = await db
        .select({
          id: chatbot.id,
          organizationId: chatbot.organizationId,
        })
        .from(chatbot)
        .where(eq(chatbot.organizationId, organizationId))
        .limit(1);

      if (!chatbotDetails) {
        throw new Error("Chatbot not found for this organization");
      }

      return chatbotDetails;
    } catch (error) {
      console.error("Error getting chatbot details:", error);

      if (error instanceof Error) {
        if (
          error.message.startsWith("Unauthorized") ||
          error.message.startsWith("Chatbot not found") ||
          error.message.startsWith("Forbidden") ||
          error.message.startsWith("No active organization")
        ) {
          throw error;
        }
      }

      throw new Error("Failed to get chatbot details. Please try again later.");
    }
  },
);

// STEP TWO QUERY: Add bot's color to database
const PrimaryColorSchema = z.object({
  primaryColor: z.string(),
});

export const updatePrimaryColor = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    try {
      return PrimaryColorSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`,
        );
      }
      throw new Error("Invalid input data");
    }
  })
  .handler(async ({ data: { primaryColor } }) => {
    try {
      const request = getWebRequest();
      const session = await auth.api.getSession({
        headers: request?.headers || new Headers(),
      });

      if (!session?.user?.id) {
        throw new Error(
          "Unauthorized: Please log in to update your bot chatbot",
        );
      }

      const organizationId = session?.session?.activeOrganizationId;
      if (!organizationId) {
        throw new Error("No active organization");
      }

      // Verify user is a member of the organization
      const [membership] = await db
        .select()
        .from(member)
        .where(
          and(
            eq(member.userId, session.user.id),
            eq(member.organizationId, organizationId),
          ),
        );

      if (!membership) {
        throw new Error("Forbidden: You are not a member of this organization");
      }

      const existingChatbot = await db
        .select({ id: chatbot.id })
        .from(chatbot)
        .where(eq(chatbot.organizationId, organizationId))
        .limit(1);

      type ChatbotDetails = {
        id: string;
        organizationId: string;
        name: string | null;
        image: string | null;
        primaryColor: string;
        theme: string;
        hidePoweredBy: boolean;
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

      let chatbotData: ChatbotDetails;

      if (existingChatbot.length === 0) {
        // Create new chatbot and return the complete details
        const [newChatbot] = await db
          .insert(chatbot)
          .values({
            organizationId,
            primaryColor,
          })
          .returning({
            id: chatbot.id,
            organizationId: chatbot.organizationId,
            name: chatbot.name,
            image: chatbot.image,
            primaryColor: chatbot.primaryColor,
            theme: chatbot.theme,
            hidePoweredBy: chatbot.hidePoweredBy,
            initialMessage: chatbot.initialMessage,
            suggestedMessages: chatbot.suggestedMessages,
            trainingStatus: chatbot.trainingStatus,
            lastTrainedAt: chatbot.lastTrainedAt,
            sourcesCount: chatbot.sourcesCount,
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
          });
        chatbotData = newChatbot;
      } else {
        // Update existing chatbot and return the complete details
        const [updatedChatbot] = await db
          .update(chatbot)
          .set({
            primaryColor,
            updatedAt: new Date(),
          })
          .where(eq(chatbot.organizationId, organizationId))
          .returning({
            id: chatbot.id,
            organizationId: chatbot.organizationId,
            name: chatbot.name,
            image: chatbot.image,
            primaryColor: chatbot.primaryColor,
            theme: chatbot.theme,
            hidePoweredBy: chatbot.hidePoweredBy,
            initialMessage: chatbot.initialMessage,
            suggestedMessages: chatbot.suggestedMessages,
            trainingStatus: chatbot.trainingStatus,
            lastTrainedAt: chatbot.lastTrainedAt,
            sourcesCount: chatbot.sourcesCount,
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
          });
        chatbotData = updatedChatbot;
      }

      return {
        success: true,
        message: "Primary color updated successfully",
        chatbot: {
          ...chatbotData,
          whatsappSettings: chatbotData.whatsappSettings || {},
        },
      };
    } catch (error) {
      console.error("Error updating primary color:", error);

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

      throw new Error(
        "Failed to update primary color. Please try again later.",
      );
    }
  });

// Create new chatbot server function
const CreateChatbotSchema = z.object({
  name: z.string().optional(),
  primaryColor: z.string().optional(),
  theme: z.string().optional(),
  hidePoweredBy: z.boolean().optional(),
  initialMessage: z.string().optional(),
});

export const createChatbot = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    try {
      return CreateChatbotSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`,
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
        throw new Error("Unauthorized: Please log in to create a chatbot");
      }

      const organizationId = session?.session?.activeOrganizationId;
      if (!organizationId) {
        throw new Error("No active organization");
      }

      // Verify user is a member of the organization
      const [membership] = await db
        .select()
        .from(member)
        .where(
          and(
            eq(member.userId, session.user.id),
            eq(member.organizationId, organizationId),
          ),
        );

      if (!membership) {
        throw new Error("Forbidden: You are not a member of this organization");
      }

      // Check if chatbot already exists for this organization
      const existingChatbot = await db
        .select({ id: chatbot.id })
        .from(chatbot)
        .where(eq(chatbot.organizationId, organizationId))
        .limit(1);

      if (existingChatbot.length > 0) {
        throw new Error("Chatbot already exists for this organization");
      }

      // Create new chatbot
      const [newChatbot] = await db
        .insert(chatbot)
        .values({
          organizationId,
          name: data.name || null,
          primaryColor: data.primaryColor || "#9333ea",
          theme: data.theme || "light",
          hidePoweredBy: data.hidePoweredBy || false,
          initialMessage:
            data.initialMessage || "Hello there👋, how can i help you today?",
        })
        .returning({
          id: chatbot.id,
          organizationId: chatbot.organizationId,
          name: chatbot.name,
          image: chatbot.image,
          primaryColor: chatbot.primaryColor,
          theme: chatbot.theme,
          hidePoweredBy: chatbot.hidePoweredBy,
          initialMessage: chatbot.initialMessage,
          suggestedMessages: chatbot.suggestedMessages,
          trainingStatus: chatbot.trainingStatus,
          lastTrainedAt: chatbot.lastTrainedAt,
          sourcesCount: chatbot.sourcesCount,
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
        });

      return {
        success: true,
        message: "Chatbot created successfully",
        chatbot: {
          ...newChatbot,
          whatsappSettings: newChatbot.whatsappSettings || {},
        },
      };
    } catch (error) {
      console.error("Error creating chatbot:", error);

      if (error instanceof Error) {
        if (
          error.message.startsWith("Unauthorized") ||
          error.message.startsWith("Validation failed") ||
          error.message.startsWith("Chatbot already exists") ||
          error.message.startsWith("Forbidden") ||
          error.message.startsWith("No active organization")
        ) {
          throw error;
        }
      }

      throw new Error("Failed to create chatbot. Please try again later.");
    }
  });
