import { db } from "@/db";
import { organization } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute("/api/training-status").methods(
  {
    GET: async ({ request }) => {
      const session = await auth.api.getSession({
        headers: request.headers || new Headers(),
      });

      const organizationId = session?.session?.activeOrganizationId;

      if (!organizationId) {
        return json(
          { error: "Authentication or organization context is missing." },
          { status: 400 },
        );
      }

      try {
        const result = await db
          .select({ trainingStatus: organization.trainingStatus })
          .from(organization)
          .where(eq(organization.id, organizationId));

        if (result.length === 0) {
          return json({ status: "idle" });
        }

        return json({ status: result[0].trainingStatus });
      } catch (error) {
        console.error("Error fetching training status:", error);
        return json(
          { error: "Failed to fetch training status." },
          { status: 500 },
        );
      }
    },
  },
);
