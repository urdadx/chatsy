import { db } from "@/db";
import { Action } from "@/db/schema";
import { ChatSDKError } from "@/lib/errors";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { subscriptionMiddleware } from "@/middlewares";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { eq } from "drizzle-orm";

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
            return new Response("No active chatbot found", { status: 404 });
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

          // Get all actions
          const actions = await db.select().from(Action).where(eq(Action.chatbotId, chatbotId));

          return json({ actions }, { status: 200 });
        } catch (error) {
          return new Response("Error fetching actions", { status: 404 });
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
            return new Response("No active chatbot found", { status: 404 });
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

          const { actionId, isActive } = await request.json();

          if (!actionId || typeof isActive !== "boolean") {
            const error = new ChatSDKError(
              "bad_request:api",
              "Missing required fields: actionId, isActive",
            );
            return error.toResponse();
          }

          const [updatedAction] = await db
            .update(Action)
            .set({
              isActive,
              updatedAt: new Date(),
            })
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
          console.error("Error updating action:", error);
          return new Response("Error fetching actions", { status: 404 });
        }
      }),
  }),
);
