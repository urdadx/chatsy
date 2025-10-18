import { db } from "@/db";
import {
  chatbot,
  invitation,
  member,
  organization,
  session as sessionTable,
  user,
} from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute(
  "/api/accept-invitation/$invitationId",
).methods({
  GET: async ({ request, params }) => {
    const { invitationId } = params;

    if (!invitationId) {
      return json({ error: "Invitation ID is required" }, { status: 400 });
    }

    try {
      // Fetch the invitation details
      const [invitationData] = await db
        .select()
        .from(invitation)
        .where(eq(invitation.id, invitationId))
        .limit(1);

      if (!invitationData) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/invitation-error?type=invalid",
          },
        });
      }

      // Check if invitation is expired
      if (new Date() > invitationData.expiresAt) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/invitation-error?type=expired",
          },
        });
      }

      // Check if invitation is already accepted
      if (invitationData.status === "accepted") {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/invitation-error?type=accepted",
          },
        });
      }

      // Check if user is authenticated
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      // If user is not logged in, redirect to setup with invitation details
      if (!session) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: `/setup?invitationId=${invitationId}&email=${encodeURIComponent(invitationData.email)}`,
          },
        });
      }

      // User is logged in - verify email matches invitation
      if (session.user.email !== invitationData.email) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: `/invitation-error?type=mismatch&message=${encodeURIComponent(`You are logged in as ${session.user.email}, but this invitation was sent to ${invitationData.email}`)}`,
          },
        });
      }

      // Check if user is already a member of this organization
      const [existingMember] = await db
        .select()
        .from(member)
        .where(
          and(
            eq(member.userId, session.user.id),
            eq(member.organizationId, invitationData.organizationId),
          ),
        )
        .limit(1);

      if (existingMember) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/invitation-already-member",
          },
        });
      }

      // Accept the invitation using better-auth
      await auth.api.acceptInvitation({
        body: {
          invitationId,
        },
        headers: request.headers,
      });

      // Mark user's email as verified and subscribed (inheriting from organization)
      await db
        .update(user)
        .set({
          emailVerified: true,
          isSubscribed: true,
        })
        .where(eq(user.id, session.user.id));

      // Get the organization's chatbot for the session
      const [orgChatbot] = await db
        .select()
        .from(chatbot)
        .where(eq(chatbot.organizationId, invitationData.organizationId))
        .limit(1);

      // Update the user's session with the organization and chatbot IDs
      // This prevents them from being redirected to onboarding
      await db
        .update(sessionTable)
        .set({
          activeOrganizationId: invitationData.organizationId,
          activeChatbotId: orgChatbot?.id || null,
          updatedAt: new Date(),
        })
        .where(eq(sessionTable.userId, session.user.id));

      // Get organization name for success message
      const [org] = await db
        .select({ name: organization.name })
        .from(organization)
        .where(eq(organization.id, invitationData.organizationId))
        .limit(1);

      console.log(
        `✅ Updated session for user ${session.user.id} with organization ${invitationData.organizationId}`,
      );

      // Redirect to success page
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/invitation-success?organizationName=${encodeURIComponent(org?.name || "")}`,
        },
      });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      return json(
        {
          error: "An error occurred while accepting the invitation",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
});
