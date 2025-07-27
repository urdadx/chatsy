import { db } from "@/db";
import { chatbot, member } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";
import z from "zod";

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

      let result: any;

      if (existingChatbot.length === 0) {
        result = await db.insert(chatbot).values({
          organizationId,
          primaryColor,
        });
      } else {
        result = await db
          .update(chatbot)
          .set({
            primaryColor,
            updatedAt: new Date(),
          })
          .where(eq(chatbot.organizationId, organizationId));
      }

      return {
        success: true,
        message: "Primary color updated successfully",
        chatbot: result[0],
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
