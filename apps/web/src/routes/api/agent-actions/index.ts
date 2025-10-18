import { db } from "@/db";
import { Action } from "@/db/schema";
import { ChatSDKError } from "@/lib/errors";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { subscriptionMiddleware } from "@/middlewares";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { auth } from "../../../../auth";

const createActionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  toolName: z.string().min(1, "Tool name is required"),
  showInQuickMenu: z.boolean().optional().default(false),
  actionProperties: z.record(z.string(), z.any()).optional(),
});

export const ServerRoute = createServerFileRoute("/api/agent-actions/").methods(
  (api) => ({
    GET: api
      .middleware([subscriptionMiddleware])
      .handler(async ({ request }) => {
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

          const actions = await db
            .select()
            .from(Action)
            .where(eq(Action.chatbotId, chatbotId));

          return json({ actions }, { status: 200 });
        } catch (error) {
          console.error("Error fetching actions:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      }),

    POST: api
      .middleware([subscriptionMiddleware])
      .handler(async ({ request }) => {
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

          const body = await request.json();
          const parsed = createActionSchema.safeParse(body);

          if (!parsed.success) {
            return json(
              {
                error: "Validation failed",
                details: parsed.error.format(),
              },
              { status: 400 },
            );
          }

          const {
            name,
            description,
            toolName,
            showInQuickMenu,
            actionProperties,
          } = parsed.data;

          const [newAction] = await db
            .insert(Action)
            .values({
              chatbotId,
              name,
              description,
              toolName,
              showInQuickMenu,
              actionProperties: actionProperties || null,
              isActive: true,
            })
            .returning();

          return json(
            {
              success: true,
              action: newAction,
              message: "Action created successfully",
            },
            { status: 201 },
          );
        } catch (error) {
          console.error("Error creating action:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      }),

    PATCH: api
      .middleware([subscriptionMiddleware])
      .handler(async ({ request }) => {
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

          const { actionId, isActive, showInQuickMenu, description } =
            await request.json();

          if (!actionId) {
            const error = new ChatSDKError(
              "bad_request:api",
              "Missing required field: actionId",
            );
            return error.toResponse();
          }

          const updateData: any = {};

          if (typeof isActive === "boolean") {
            updateData.isActive = isActive;
          }

          if (typeof showInQuickMenu === "boolean") {
            updateData.showInQuickMenu = showInQuickMenu;
          }

          if (typeof description === "string") {
            updateData.description = description;
          }

          // Check if at least one field to update is provided
          if (
            typeof isActive !== "boolean" &&
            typeof showInQuickMenu !== "boolean" &&
            typeof description !== "string"
          ) {
            const error = new ChatSDKError(
              "bad_request:api",
              "At least one field must be provided: isActive, showInQuickMenu, or description",
            );
            return error.toResponse();
          }

          const [updatedAction] = await db
            .update(Action)
            .set(updateData)
            .where(eq(Action.id, actionId))
            .returning();

          if (!updatedAction) {
            const error = new ChatSDKError("not_found:api", "Action not found");
            return error.toResponse();
          }

          return json(
            { success: true, action: updatedAction },
            { status: 200 },
          );
        } catch (error) {
          return new Response("Internal Server Error", { status: 500 });
        }
      }),

    DELETE: api
      .middleware([subscriptionMiddleware])
      .handler(async ({ request }) => {
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

          const { actionId } = await request.json();

          if (!actionId) {
            const error = new ChatSDKError(
              "bad_request:api",
              "Missing required field: actionId",
            );
            return error.toResponse();
          }

          const [existingAction] = await db
            .select()
            .from(Action)
            .where(eq(Action.id, actionId));

          if (!existingAction) {
            const error = new ChatSDKError("not_found:api", "Action not found");
            return error.toResponse();
          }

          if (existingAction.chatbotId !== chatbotId) {
            const error = new ChatSDKError(
              "forbidden:api",
              "Action does not belong to your chatbot",
            );
            return error.toResponse();
          }

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
  }),
);
