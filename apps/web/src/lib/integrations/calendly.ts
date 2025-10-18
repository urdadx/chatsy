import { db } from "@/db";
import { calendlyIntegration } from "@/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * Buffer (in ms) before actual expiry when we proactively refresh.
 * Calendly access tokens are typically short‑lived (3600s). We refresh when
 * there is < 60s remaining to avoid race conditions.
 */
const EXPIRY_BUFFER_MS = 60 * 1000;

export async function ensureCalendlyAccessToken(chatbotId: string) {
  const [integration] = await db
    .select()
    .from(calendlyIntegration)
    .where(
      and(
        eq(calendlyIntegration.chatbotId, chatbotId),
        eq(calendlyIntegration.isActive, true),
      ),
    );

  if (!integration) return { integration: null, refreshed: false } as const;

  const now = Date.now();
  const expiresAt = integration.accessTokenExpiresAt?.getTime();
  const needsRefresh = integration.refreshToken
    ? expiresAt
      ? expiresAt - now <= EXPIRY_BUFFER_MS
      : false
    : false;

  if (!needsRefresh) {
    return { integration, refreshed: false } as const;
  }

  try {
    const tokenResponse = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.CALENDLY_CLIENT_ID!,
        client_secret: process.env.CALENDLY_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: integration.refreshToken!,
      }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || tokenData.error) {
      console.error("Calendly refresh failed", tokenData);
      return { integration, refreshed: false } as const; // Keep old token (may still have a few seconds)
    }

    const updatedExpiry = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : null;

    const [updated] = await db
      .update(calendlyIntegration)
      .set({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || integration.refreshToken,
        accessTokenExpiresAt: updatedExpiry,
        scope: tokenData.scope || integration.scope,
        updatedAt: new Date(),
      })
      .where(eq(calendlyIntegration.id, integration.id))
      .returning();

    return { integration: updated, refreshed: true } as const;
  } catch (e) {
    console.error("Calendly token refresh exception", e);
    return { integration, refreshed: false } as const;
  }
}
