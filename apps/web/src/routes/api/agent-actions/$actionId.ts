import { db } from "@/db";
import { Action } from "@/db/schema";
import { ChatSDKError } from "@/lib/errors";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { subscriptionMiddleware } from "@/middlewares";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";
import z from "zod";

const updateActionSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  toolName: z.string().min(1, "Tool name is required").optional(),
  showInQuickMenu: z.boolean().optional(),
  actionProperties: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional(),
});

export const ServerRoute = createServerFileRoute(
  "/api/agent-actions/$actionId",
).methods((api) => ({
  GET: api
    .middleware([subscriptionMiddleware])
    .handler(async ({ request, params }) => {
      try {
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session) {
          return new Response("Unauthorized: No session found", {
            status: 401,
          });
        }

        const userId = session?.user.id || "";
        const { actionId } = params;

        const chatbotId =
          session?.session?.activeChatbotId ||
          (await getActiveChatbotId(userId));

        if (!chatbotId) {
          const error = new ChatSDKError(
            "bad_request:api",
            "No active chatbot selected",
          );
          return error.toResponse();
        }

        // Get the specific action
        const [action] = await db
          .select()
          .from(Action)
          .where(and(eq(Action.id, actionId), eq(Action.chatbotId, chatbotId)));

        if (!action) {
          const error = new ChatSDKError("not_found:api", "Action not found");
          return error.toResponse();
        }

        return json({ action }, { status: 200 });
      } catch (error) {
        console.error("Error fetching action:", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    }),

  PUT: api
    .middleware([subscriptionMiddleware])
    .handler(async ({ request, params }) => {
      try {
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session) {
          return new Response("Unauthorized: No session found", {
            status: 401,
          });
        }

        const userId = session?.user.id || "";
        const { actionId } = params;

        const chatbotId =
          session?.session?.activeChatbotId ||
          (await getActiveChatbotId(userId));

        if (!chatbotId) {
          const error = new ChatSDKError(
            "bad_request:api",
            "No active chatbot selected",
          );
          return error.toResponse();
        }

        // First verify the action exists and belongs to the chatbot
        const [existingAction] = await db
          .select()
          .from(Action)
          .where(and(eq(Action.id, actionId), eq(Action.chatbotId, chatbotId)));

        if (!existingAction) {
          const error = new ChatSDKError("not_found:api", "Action not found");
          return error.toResponse();
        }

        const body = await request.json();
        const parsed = updateActionSchema.safeParse(body);

        if (!parsed.success) {
          return json(
            {
              error: "Validation failed",
              details: parsed.error.format(),
            },
            { status: 400 },
          );
        }

        const updateData = {
          ...parsed.data,
          updatedAt: new Date(),
        };

        const [updatedAction] = await db
          .update(Action)
          .set(updateData)
          .where(eq(Action.id, actionId))
          .returning();

        return json(
          {
            success: true,
            action: updatedAction,
            message: "Action updated successfully",
          },
          { status: 200 },
        );
      } catch (error) {
        console.error("Error updating action:", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    }),

  DELETE: api
    .middleware([subscriptionMiddleware])
    .handler(async ({ request, params }) => {
      try {
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session) {
          return new Response("Unauthorized: No session found", {
            status: 401,
          });
        }

        const userId = session?.user.id || "";
        const { actionId } = params;

        const chatbotId =
          session?.session?.activeChatbotId ||
          (await getActiveChatbotId(userId));

        if (!chatbotId) {
          const error = new ChatSDKError(
            "bad_request:api",
            "No active chatbot selected",
          );
          return error.toResponse();
        }

        // First verify the action exists and belongs to the chatbot
        const [existingAction] = await db
          .select()
          .from(Action)
          .where(and(eq(Action.id, actionId), eq(Action.chatbotId, chatbotId)));

        if (!existingAction) {
          const error = new ChatSDKError("not_found:api", "Action not found");
          return error.toResponse();
        }

        // Delete the action
        await db.delete(Action).where(eq(Action.id, actionId));

        return json(
          { success: true, message: "Action deleted successfully" },
          { status: 200 },
        );
      } catch (error) {
        console.error("Error deleting action:", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    }),
}));
