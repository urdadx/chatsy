import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";

export const ServerRoute = createServerFileRoute(
  "/api/accept-invitation/$invitationId",
).methods({
  GET: async ({ params }) => {
    const { invitationId } = params;

    if (!invitationId) {
      return json({ error: "Invitation ID is required" }, { status: 400 });
    }

    const data = await auth.api.acceptInvitation({
      body: {
        invitationId,
      },
    });

    return json(
      {
        redirect: `/setup?email=${data?.invitation.email}&invitationId=${invitationId}`,
      },
      { status: 200 },
    );
  },
});
