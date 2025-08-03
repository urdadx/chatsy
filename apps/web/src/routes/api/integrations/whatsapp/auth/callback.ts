import { db } from "@/db";
import { whatsappIntegration } from "@/db/schema";
import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute(
  "/api/integrations/whatsapp/auth/callback",
).methods({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      console.error("WhatsApp OAuth error:", error);
      return new Response(
        `<html><body><script>window.close();</script><p>Error: ${error}</p></body></html>`,
        { headers: { "Content-Type": "text/html" } },
      );
    }

    if (!code || !state) {
      return new Response(
        "<html><body><script>window.close();</script><p>Missing authorization code or state</p></body></html>",
        { headers: { "Content-Type": "text/html" } },
      );
    }

    try {
      // Decode state to get user info
      const stateData = JSON.parse(atob(state));
      const { userId, organizationId } = stateData;

      // Exchange code for access token
      const tokenResponse = await fetch(
        "https://graph.facebook.com/v22.0/oauth/access_token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.WHATSAPP_APP_ID!,
            client_secret: process.env.WHATSAPP_APP_SECRET!,
            redirect_uri: `${process.env.APP_URL || "http://localhost:3001"}/api/integrations/whatsapp/auth/callback`,
            code,
          }),
        },
      );

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        throw new Error(
          tokenData.error.message || "Failed to exchange code for token",
        );
      }

      // Get WhatsApp Business Account info
      const businessResponse = await fetch(
        `https://graph.facebook.com/v22.0/me/businesses?access_token=${tokenData.access_token}`,
      );
      const businessData = await businessResponse.json();

      if (businessData.error) {
        throw new Error(
          businessData.error.message || "Failed to fetch business accounts",
        );
      }

      const businessAccountId = businessData.data?.[0]?.id;
      if (!businessAccountId) {
        throw new Error("No business account found");
      }

      // Get WhatsApp Business Account details and phone numbers
      const wabResponse = await fetch(
        `https://graph.facebook.com/v22.0/${businessAccountId}/phone_numbers?access_token=${tokenData.access_token}`,
      );
      const wabData = await wabResponse.json();

      if (wabData.error) {
        throw new Error(
          wabData.error.message || "Failed to fetch phone numbers",
        );
      }

      const phoneNumbers = wabData.data || [];
      const primaryPhoneNumber =
        phoneNumbers.find((phone: any) => phone.verified_name) ||
        phoneNumbers[0];

      // Store the WhatsApp integration in the dedicated table
      await db.insert(whatsappIntegration).values({
        userId,
        organizationId,
        businessAccountId: businessAccountId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        accessTokenExpiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        scope: "whatsapp_business_management,whatsapp_business_messaging",
        phoneNumbers: phoneNumbers.map((phone: any) => ({
          id: phone.id,
          displayPhoneNumber: phone.display_phone_number,
          verifiedName: phone.verified_name,
          status: phone.status,
        })),
        primaryPhoneNumberId: primaryPhoneNumber?.id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return new Response(
        `<html><body><script>
          window.opener?.postMessage({ type: 'whatsapp_connected', success: true }, '*');
          window.close();
        </script><p>WhatsApp connected successfully! You can close this window.</p></body></html>`,
        { headers: { "Content-Type": "text/html" } },
      );
    } catch (error) {
      console.error("WhatsApp callback error:", error);
      return new Response(
        `<html><body><script>
          window.opener?.postMessage({ type: 'whatsapp_connected', success: false, error: '${error}' }, '*');
          window.close();
        </script><p>Error connecting WhatsApp: ${error}</p></body></html>`,
        { headers: { "Content-Type": "text/html" } },
      );
    }
  },
});
