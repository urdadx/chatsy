import { Resend } from "resend";
import OrganizationInvitationEmail from "./invitation-template";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrganizationInvitationData {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
}

export async function sendOrganizationInvitations(
  invitations: OrganizationInvitationData[],
) {
  try {
    const emailBatch = invitations.map((data) => ({
      from: "Acme <onboarding@resend.dev>",
      to: [data.email],
      subject: `You've been invited to join ${data.teamName}`,
      react: OrganizationInvitationEmail({
        invitedByUsername: data.invitedByUsername,
        invitedByEmail: data.invitedByEmail,
        teamName: data.teamName,
        inviteLink: data.inviteLink,
      }),
    }));

    const { data: result, error } = await resend.batch.send(emailBatch);

    if (error) {
      console.error("Error sending organization invitations:", error);
      throw new Error("Failed to send invitation emails");
    }

    console.log("Organization invitations sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Error sending organization invitations:", error);
    throw error;
  }
}

export async function sendOrganizationInvitation(
  data: OrganizationInvitationData,
) {
  return sendOrganizationInvitations([data]);
}
