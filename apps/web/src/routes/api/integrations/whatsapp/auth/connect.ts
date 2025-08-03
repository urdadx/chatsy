import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import z from "zod";

const connectSchema = z.object({
  organizationId: z.string().min(1),
});

export const ServerRoute = createServerFileRoute(
  "/api/integrations/whatsapp/auth/connect",
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
        return json({ error: parsed.error.format() }, { status: 400 });
      }

      // Generate WhatsApp Business OAuth URL
      const state = btoa(
        JSON.stringify({
          userId: session.user.id,
          organizationId: organizationId,
          timestamp: Date.now(),
        }),
      );

      const oauthUrl = new URL("https://www.facebook.com/v22.0/dialog/oauth");
      oauthUrl.searchParams.set("client_id", process.env.WHATSAPP_APP_ID!);
      oauthUrl.searchParams.set(
        "redirect_uri",
        `${process.env.APP_URL || "http://localhost:3001"}/api/integrations/whatsapp/auth/callback`,
      );
      oauthUrl.searchParams.set(
        "scope",
        "whatsapp_business_management,whatsapp_business_messaging",
      );
      oauthUrl.searchParams.set("state", state);
      oauthUrl.searchParams.set("response_type", "code");

      return json({ authUrl: oauthUrl.toString() });
    } catch (error) {
      console.error("WhatsApp connect error:", error);
      return json({ error: "Failed to create auth URL" }, { status: 500 });
    }
  },
});
