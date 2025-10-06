import { db } from "@/db";
import { calendlyIntegration } from "@/db/schema";
import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute(
  "/integrations/calendly/callback",
).methods({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      console.error("Calendly OAuth error:", error);
      return new Response(
        `<html><body><script>window.opener?.postMessage({ type: 'calendly_connected', success: false, error: '${error}' }, '*');window.close();</script><p>Error: ${error}</p></body></html>`,
        { headers: { "Content-Type": "text/html" } },
      );
    }

    if (!code || !state) {
      return new Response(
        `<html><body><script>window.opener?.postMessage({ type: 'calendly_connected', success: false, error: 'Missing authorization code or state' }, '*');window.close();</script><p>Missing authorization code or state</p></body></html>`,
        { headers: { "Content-Type": "text/html" } },
      );
    }

    try {
      // Decode state (support both base64 and base64url just in case)
      let decoded: string;
      try {
        decoded = atob(state);
      } catch {
        decoded = atob(state.replace(/-/g, "+").replace(/_/g, "/"));
      }
      const stateData = JSON.parse(decoded);
      const { userId, chatbotId } = stateData;
      if (!chatbotId) {
        throw new Error(
          "Missing chatbotId in state (ensure activeChatbotId is set before connecting)",
        );
      }

      // Exchange code for token
      const tokenResponse = await fetch(
        "https://auth.calendly.com/oauth/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.CALENDLY_CLIENT_ID!,
            client_secret: process.env.CALENDLY_CLIENT_SECRET!,
            redirect_uri: process.env.CALENDLY_REDIRECT_URI!,
            grant_type: "authorization_code",
            code,
          }),
        },
      );
      const tokenData = await tokenResponse.json();
      if (tokenData.error) {
        throw new Error(
          tokenData.error_description || "Failed to exchange code for token",
        );
      }

      // Fetch user info
      const userResponse = await fetch("https://api.calendly.com/users/me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
      });
      const userData = await userResponse.json();
      if (userData.error) {
        throw new Error(userData.error.message || "Failed to fetch user info");
      }
      const user = userData.resource;

      await db.insert(calendlyIntegration).values({
        userId,
        chatbotId, // store chatbot linkage
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        accessTokenExpiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        scope: tokenData.scope || "default",
        organizationUri: user.current_organization,
        userUri: user.uri,
        eventTypes: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return new Response(
        `<html><body><script>window.opener?.postMessage({ type: 'calendly_connected', success: true }, '*');window.close();</script><p>Calendly connected successfully! You can close this window.</p></body></html>`,
        { headers: { "Content-Type": "text/html" } },
      );
    } catch (e) {
      console.error("Calendly callback error:", e);
      return new Response(
        `<html><body><script>window.opener?.postMessage({ type: 'calendly_connected', success: false, error: '${e}' }, '*');window.close();</script><p>Error connecting Calendly: ${e}</p></body></html>`,
        { headers: { "Content-Type": "text/html" } },
      );
    }
  },
});
