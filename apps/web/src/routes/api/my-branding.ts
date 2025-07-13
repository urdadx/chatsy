import { db } from "@/db";
import { branding, member } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute("/api/my-branding").methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get user's active organization from session
    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return new Response("No active organization", { status: 400 });
    }

    // Verify user is a member of the organization
    const [membership] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.user.id),
          eq(member.organizationId, organizationId),
        ),
      );

    if (!membership) {
      return new Response("Forbidden", { status: 403 });
    }

    const [userBranding] = await db
      .select({
        id: branding.id,
        organizationId: branding.organizationId,
        name: branding.name,
        image: branding.image,
        primaryColor: branding.primaryColor,
        theme: branding.theme,
        hidePoweredBy: branding.hidePoweredBy,
        initialMessage: branding.initialMessage,
        suggestedMessages: branding.suggestedMessages,
        createdAt: branding.createdAt,
        updatedAt: branding.updatedAt,
      })
      .from(branding)
      .where(eq(branding.organizationId, organizationId));

    if (!userBranding) {
      return new Response("Not found", { status: 404 });
    }

    return json(userBranding);
  },
  PATCH: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get user's active organization from session
    const organizationId = session.session.activeOrganizationId;
    if (!organizationId) {
      return new Response("No active organization", { status: 400 });
    }

    // Verify user is a member of the organization (optionally check for admin/owner role)
    const [membership] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.user.id),
          eq(member.organizationId, organizationId),
        ),
      );

    if (!membership) {
      return new Response("Forbidden", { status: 403 });
    }

    // Optional: Check if user has admin/owner role for branding changes
    // if (!['admin', 'owner'].includes(membership.role)) {
    //   return new Response("Insufficient permissions", { status: 403 });
    // }

    const body = await request.json();

    try {
      const brandingUpdates = {
        ...(body.name && { name: body.name }),
        ...(body.image && { image: body.image }),
        ...(body.primaryColor && { primaryColor: body.primaryColor }),
        ...(body.theme && { theme: body.theme }),
        ...(typeof body.hidePoweredBy === "boolean" && {
          hidePoweredBy: body.hidePoweredBy,
        }),
        ...(body.initialMessage !== undefined && {
          initialMessage: body.initialMessage,
        }),
        ...(body.suggestedMessages && {
          suggestedMessages: body.suggestedMessages,
        }),
        updatedAt: new Date(),
      };

      const hasUpdates = Object.keys(brandingUpdates).length > 1;
      if (hasUpdates) {
        const [updated] = await db
          .update(branding)
          .set(brandingUpdates)
          .where(eq(branding.organizationId, organizationId))
          .returning();

        if (!updated) {
          return new Response("Branding not found", { status: 404 });
        }
      }

      const [brandingData] = await db
        .select({
          id: branding.id,
          organizationId: branding.organizationId,
          name: branding.name,
          image: branding.image,
          primaryColor: branding.primaryColor,
          theme: branding.theme,
          hidePoweredBy: branding.hidePoweredBy,
          initialMessage: branding.initialMessage,
          suggestedMessages: branding.suggestedMessages,
          createdAt: branding.createdAt,
          updatedAt: branding.updatedAt,
        })
        .from(branding)
        .where(eq(branding.organizationId, organizationId));

      if (!brandingData) {
        return new Response("Branding not found", { status: 404 });
      }

      return json(brandingData);
    } catch (err) {
      console.error("PATCH /api/my-branding error:", err);
      return new Response("Failed to update branding", { status: 500 });
    }
  },
});
