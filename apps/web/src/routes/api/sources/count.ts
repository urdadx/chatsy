import { db } from "@/db";
import {
  documentSource,
  textSource,
  websiteSource,
} from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, count, eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute("/api/sources/count").methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const userId = session?.user?.id;
    const organizationId = session?.session?.activeOrganizationId;

    if (!userId || !organizationId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const textSourcesCount = await db
      .select({ value: count() })
      .from(textSource)
      .where(
        and(
          eq(textSource.userId, userId),
          eq(textSource.organizationId, organizationId),
        ),
      );

    const documentSourcesCount = await db
      .select({ value: count() })
      .from(documentSource)
      .where(
        and(
          eq(documentSource.userId, userId),
          eq(documentSource.organizationId, organizationId),
        ),
      );

    const websiteSourcesCount = await db
      .select({ value: count() })
      .from(websiteSource)
      .where(
        and(
          eq(websiteSource.userId, userId),
          eq(websiteSource.organizationId, organizationId),
        ),
      );

    const totalCount =
      (textSourcesCount[0]?.value || 0) +
      (documentSourcesCount[0]?.value || 0) +
      (websiteSourcesCount[0]?.value || 0);

    return json({ count: totalCount });
  },
});
