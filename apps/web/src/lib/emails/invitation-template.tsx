import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OrganizationInvitationEmailProps {
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
}

export const OrganizationInvitationEmail = ({
  invitedByUsername = "John Doe",
  invitedByEmail = "john@example.com",
  teamName = "Acme Corp",
  inviteLink = "https://example.com/accept-invitation/123",
}: OrganizationInvitationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {teamName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You've been invited to join {teamName}</Heading>

          <Text style={text}>Hello,</Text>

          <Text style={text}>
            <strong>{invitedByUsername}</strong> ({invitedByEmail}) has invited
            you to join the organization <strong>{teamName}</strong>.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={inviteLink}>
              Accept Invitation
            </Button>
          </Section>

          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>

          <Link href={inviteLink} style={link}>
            {inviteLink}
          </Link>

          <Text style={footer}>
            If you didn't expect this invitation, you can safely ignore this
            email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrganizationInvitationEmail;

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#007bff",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  fontWeight: "bold",
};

const link = {
  color: "#007bff",
  fontSize: "14px",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0 0 0",
};
