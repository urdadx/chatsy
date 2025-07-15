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

export async function sendOrganizationInvitation(
  data: OrganizationInvitationData,
) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [data.email],
      subject: `You've been invited to join ${data.teamName}`,
      react: OrganizationInvitationEmail({
        invitedByUsername: data.invitedByUsername,
        invitedByEmail: data.invitedByEmail,
        teamName: data.teamName,
        inviteLink: data.inviteLink,
      }),
    });

    if (error) {
      console.error("Error sending organization invitation:", error);
      throw new Error("Failed to send invitation email");
    }

    console.log("Organization invitation sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Error sending organization invitation:", error);
    throw error;
  }
}
