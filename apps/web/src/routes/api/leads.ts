import { db } from "@/db";
import { lead } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
  location: z.string().optional(),
});

export const ServerRoute = createServerFileRoute("/api/leads").methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error }, { status: 400 });
    }

    try {
      await db.insert(lead).values({
        userId: session.user.id,
        organizationId,
        name: parsed.data.name,
        email: parsed.data.email,
        location: parsed.data.location,
        phone: parsed.data.phone,
        company: parsed.data.company,
        message: parsed.data.message,
      });
      return json({ success: true, message: "Lead collected successfully" });
    } catch (error) {
      console.error("Failed to save lead:", error);
      return json({ error: "Failed to save lead" }, { status: 500 });
    }
  },
});
