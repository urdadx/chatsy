import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import z from "zod";

const connectSchema = z.object({
  organizationId: z.string().min(1),
});

export const ServerRoute = createServerFileRoute(
  "/api/integrations/calendly/auth/connect",
).methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
    }

    try {
      const body = await request.json();
      const parsed = connectSchema.safeParse(body);
      if (!parsed.success) {
        return json({ error: z.treeifyError(parsed.error) }, { status: 400 });
      }

      const redirectUri = process.env.CALENDLY_REDIRECT_URI!;

      const statePayload = {
        userId: session.user.id,
        organizationId,
        chatbotId: session.session?.activeChatbotId || null,
        ts: Date.now(),
      };

      const state = Buffer.from(JSON.stringify(statePayload)).toString(
        "base64",
      );

      const oauthUrl = new URL("https://auth.calendly.com/oauth/authorize");
      oauthUrl.searchParams.set("client_id", process.env.CALENDLY_CLIENT_ID!);
      oauthUrl.searchParams.set("redirect_uri", redirectUri);
      oauthUrl.searchParams.set("response_type", "code");
      oauthUrl.searchParams.set("scope", "default");
      oauthUrl.searchParams.set("state", state);

      return json({ authUrl: oauthUrl.toString() });
    } catch (error) {
      console.error("Calendly connect error:", error);
      return json({ error: "Failed to create auth URL" }, { status: 500 });
    }
  },
});
