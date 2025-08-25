import { db } from "@/db";
import { member } from "@/db/schema";
import { isUserMemberOfOrganization } from "@/lib/ai/chat-functions";
import { checkMemberInvitationLimits } from "@/lib/subscription/subscription-utils";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { count, eq } from "drizzle-orm";
import z from "zod";

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["member", "owner"], {
    errorMap: () => ({ message: "Role must be either 'member' or 'owner'" }),
  }),
});

export const ServerRoute = createServerFileRoute("/api/invite-member").methods({
  POST: async ({ request }) => {
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      const userId = session?.user?.id;
      const organizationId = session?.session?.activeOrganizationId;

      if (!userId || !organizationId) {
        return json(
          { message: "Unauthorized: Please log in" },
          { status: 401 },
        );
      }

      const isMember = await isUserMemberOfOrganization(userId, organizationId);
      if (!isMember) {
        return json({ message: "Forbidden" }, { status: 403 });
      }

      // Get current user's role to check if they can invite
      const [currentMember] = await db
        .select({ role: member.role })
        .from(member)
        .where(
          eq(member.userId, userId) &&
            eq(member.organizationId, organizationId),
        );

      if (
        !currentMember ||
        (currentMember.role !== "owner" && currentMember.role !== "admin")
      ) {
        return json(
          { message: "Only owners and admins can invite members" },
          { status: 403 },
        );
      }

      const body = await request.json();
      const parseResult = inviteMemberSchema.safeParse(body);

      if (!parseResult.success) {
        return json(
          {
            message: "Invalid request data",
            details: parseResult.error.errors,
          },
          { status: 400 },
        );
      }

      const { email, role } = parseResult.data;

      const [memberCountResult] = await db
        .select({ count: count(member.id) })
        .from(member)
        .where(eq(member.organizationId, organizationId));

      const currentMemberCount = memberCountResult?.count || 0;

      const limitCheck = await checkMemberInvitationLimits(
        organizationId,
        currentMemberCount,
      );

      if (!limitCheck.canInvite) {
        const statusCode = limitCheck.reason === "limit_reached" ? 402 : 400;
        return json(
          {
            message: limitCheck.message,
            reason: limitCheck.reason,
            currentCount: limitCheck.currentCount,
            limit: limitCheck.limit,
          },
          { status: statusCode },
        );
      }

      const invitationData = await auth.api.createInvitation({
        body: {
          email,
          role,
          organizationId,
          resend: true,
        },
        headers: request.headers,
      });

      if (!invitationData || !invitationData.id) {
        return json(
          {
            message: "Failed to create invitation",
          },
          { status: 400 },
        );
      }

      return json({
        success: true,
        message: `Invitation sent to ${email}`,
        invitation: invitationData,
      });
    } catch (error) {
      console.error("Error creating invitation:", error);
      return json({ message: "Internal server error" }, { status: 500 });
    }
  },
});
