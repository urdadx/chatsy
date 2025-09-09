import { Resend } from "resend";
import OrganizationInvitationEmail from "./invitation-template";
import VerificationEmail from "./verification-email-template";

export const resendClient = new Resend(process.env.RESEND_API_KEY!);

interface OrganizationInvitationData {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
}

interface VerificationEmailData {
  email: string;
  username: string;
  verificationLink: string;
}

export async function sendOrganizationInvitations(
  invitations: OrganizationInvitationData[],
) {
  try {
    const emailBatch = invitations.map((data) => ({
      from: "Padyna <onboarding@padyna.com>",
      to: [data.email],
      subject: `You've been invited to join ${data.teamName}`,
      react: OrganizationInvitationEmail({
        invitedByUsername: data.invitedByUsername,
        invitedByEmail: data.invitedByEmail,
        teamName: data.teamName,
        inviteLink: data.inviteLink,
      }),
    }));

    const { data: result, error } = await resendClient.batch.send(emailBatch);

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


export async function sendVerificationEmail(data: VerificationEmailData) {
  try {
    const { data: result, error } = await resendClient.emails.send({
      from: "Padyna <verify@padyna.com>",
      to: [data.email],
      subject: "Verify your email address",
      react: VerificationEmail({
        username: data.username,
        verificationLink: data.verificationLink,
      }),
    });

    if (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email");
    }

    console.log("Verification email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}


