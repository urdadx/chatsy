import { db } from "@/db";
import { member, organization } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getActiveOrganization(userId: string) {
  // Get the user's most recent organization membership
  const [membership] = await db
    .select({
      organizationId: member.organizationId,
      role: member.role,
      createdAt: member.createdAt,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        createdAt: organization.createdAt,
        metadata: organization.metadata,
      },
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, userId))
    .orderBy(desc(member.createdAt))
    .limit(1);

  if (!membership) {
    throw new Error("User has no organization memberships");
  }

  return membership.organization;
}
