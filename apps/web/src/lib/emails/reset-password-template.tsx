import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ResetPasswordEmailProps {
  username: string;
  resetLink: string;
}

export default function ResetPasswordEmail({
  username,
  resetLink,
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password for Padyna</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={text}>Hi {username},</Text>
            <Text style={text}>
              We received a request to reset your password. Click the button below to create a new password:
            </Text>
            <Button href={resetLink} style={button}>
              Reset Password
            </Button>
            <Text style={text}>
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </Text>
            <Text style={footer}>This link will expire in 1 hour for security reasons.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

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

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333",
};

const button = {
  backgroundColor: "#8b5cf6",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
  marginTop: "24px",
  marginBottom: "24px",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
};
