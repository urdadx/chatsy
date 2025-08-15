import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";

export const ServerRoute = createServerFileRoute(
  "/api/accept-invitation/$invitationId",
).methods({
  GET: async ({ request, params }) => {
    const { invitationId } = params;

    if (!invitationId) {
      return json({ error: "Invitation ID is required" }, { status: 400 });
    }

    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/setup?invitationId=${invitationId}`,
        },
      });
    }

    const data = await auth.api.acceptInvitation({
      body: {
        invitationId,
      },
      headers: request.headers,
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/setup?invitationId=${invitationId}&email=${data?.invitation.email}`,
      },
    });
  },
});
