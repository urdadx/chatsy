import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface EscalationEmailProps {
  chatId: string;
  reason: string;
  chatbotName: string;
  createdAt?: string;
  summary?: string;
}

const reasonLabels = {
  "complex-issue": "Complex Issue",
  "customer-request": "Customer Request",
  "technical-problem": "Technical Problem",
  billing: "Billing Issue",
  other: "Other",
};

export const EscalationEmail = ({
  chatId,
  createdAt,
  reason,
  chatbotName,
  summary,
}: EscalationEmailProps) => {
  const appUrl =
    import.meta.env.VITE_NODE_ENV === "development"
      ? "http://localhost:3001"
      : "https://padyna.com";
  return (
    <Html>
      <Head />
      <Preview>
        🚨 Chat Escalation
        {reasonLabels[reason as keyof typeof reasonLabels]}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Attention Is Required </Heading>

          <Text style={bodyText}>
            A customer's conversation with {chatbotName} has been escalated and
            requires human attention. Please review and respond to the customer
            as soon as possible.
          </Text>

          {summary && (
            <Section style={summarySection}>
              <Text style={summaryTitle}>
                <strong>Conversation Summary:</strong>
              </Text>
              <Text style={summaryText}>{summary}</Text>
            </Section>
          )}

          <Section style={infoSection}>
            <Text style={infoText}>
              <strong>Date created:</strong> {createdAt || "Unknown"}
            </Text>
          </Section>

          <Section style={reasonSection}>
            <Text style={reasonText}>
              <strong>Reason for escalation:</strong>{" "}
              {reasonLabels[reason as keyof typeof reasonLabels]}
            </Text>
          </Section>

          <Section style={buttonSection}>
            <Link
              style={button}
              href={`${appUrl}/admin/chat-history?chatId=${chatId}&filter=7d&status=escalated`}
            >
              View Conversation
            </Link>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This is an automated notification from your padyna account. If you
              have any questions, please contact{" "}
              <Link href="mailto:support@padyna.com">support@padyna.com</Link>.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const h1 = {
  color: "#374151",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "40px",
  margin: "0 0 20px",
};

const infoSection = {
  backgroundColor: "#f3f4f6",
  borderRadius: "4px",
  padding: "15px",
  margin: "20px 0",
};

const summarySection = {
  backgroundColor: "#eff6ff",
  borderLeft: "4px solid #3b82f6",
  borderRadius: "4px",
  padding: "15px",
  margin: "20px 0",
};

const summaryTitle = {
  color: "#1e40af",
  fontSize: "14px",
  margin: "0 0 8px 0",
  lineHeight: "20px",
};

const summaryText = {
  color: "#374151",
  fontSize: "14px",
  margin: "0",
  lineHeight: "22px",
  fontStyle: "italic" as const,
};

const infoText = {
  color: "#374151",
  fontSize: "14px",
  margin: "8px 0",
  lineHeight: "20px",
};

const reasonSection = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  borderRadius: "4px",
  padding: "15px",
  margin: "20px 0",
};

const reasonText = {
  color: "#374151",
  fontSize: "14px",
  margin: "0",
  lineHeight: "20px",
};

const bodyText = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  fontWeight: "600",
};

const footer = {
  borderTop: "1px solid #e5e7eb",
  marginTop: "30px",
  paddingTop: "20px",
};

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
};

export default EscalationEmail;
