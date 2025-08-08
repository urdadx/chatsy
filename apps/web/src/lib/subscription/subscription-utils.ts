import { db } from "@/db";
import { subscription } from "@/db/schema";
import { getHeaders } from "@tanstack/react-start/server";
import { auth } from "auth";
import { eq } from "drizzle-orm";

export type SubscriptionDetails = {
  id: string;
  productId: string;
  status: string;
  amount: number;
  currency: string;
  recurringInterval: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  organizationId: string | null;
};

export type SubscriptionDetailsResult = {
  hasSubscription: boolean;
  subscription?: SubscriptionDetails;
  error?: string;
  errorType?: "CANCELED" | "EXPIRED" | "GENERAL";
};

// Combined function to check Pro status from Polar
async function getComprehensiveProStatus(
  organizationId: string,
): Promise<{ isProUser: boolean; source: "polar" | "none" }> {
  try {
    // Check Polar subscriptions by organizationId
    const orgSubscriptions = await db
      .select()
      .from(subscription)
      .where(eq(subscription.organizationId, organizationId));
    const activeSubscription = orgSubscriptions.find(
      (sub) => sub.status === "active",
    );

    if (activeSubscription) {
      console.log(
        "🔥 Polar subscription found for organization:",
        organizationId,
      );
      return { isProUser: true, source: "polar" };
    }

    return { isProUser: false, source: "none" };
  } catch (error) {
    console.error("Error getting comprehensive pro status:", error);
    return { isProUser: false, source: "none" };
  }
}

// Simple helper to check if user has an active subscription or successful payment
export async function isUserSubscribed(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: getHeaders() as unknown as Headers,
    });

    if (!session?.user?.id) {
      return false;
    }

    const proStatus = await getComprehensiveProStatus(session.user.id);
    return proStatus.isProUser;
  } catch (error) {
    console.error("Error checking user subscription status:", error);
    return false;
  }
}
