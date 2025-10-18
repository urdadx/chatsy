import { db } from "@/db";
import { organization } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Checks if an organization has an active subscription
 * @param organizationId - The ID of the organization to check
 * @returns true if the organization has an active subscription, false otherwise
 */
export async function checkOrganizationSubscription(
  organizationId: string,
): Promise<boolean> {
  try {
    const [org] = await db
      .select({
        externalCustomerId: organization.externalCustomerId,
      })
      .from(organization)
      .where(eq(organization.id, organizationId))
      .limit(1);

    // If organization has an external customer ID, they have a subscription
    return !!org?.externalCustomerId;
  } catch (error) {
    console.error("Error checking organization subscription:", error);
    return false;
  }
}
