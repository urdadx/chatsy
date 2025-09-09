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

interface VerificationEmailProps {
  username: string;
  verificationLink: string;
}

export default function VerificationEmail({
  username,
  verificationLink,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for Padyna</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={text}>Hi {username},</Text>
            <Text style={text}>
              Please verify your email address by clicking the button below:
            </Text>
            <Button
              href={verificationLink}
              style={button}
            >
              Verify Email Address
            </Button>
            <Text style={text}>
              If you didn't create an account with Padyna, you can safely ignore this email.
            </Text>
            <Text style={footer}>
              This link will expire in 24 hours.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
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
  backgroundColor: "#000",
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