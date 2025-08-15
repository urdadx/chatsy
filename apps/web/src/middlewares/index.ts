import type { CustomerSubscription } from "@polar-sh/sdk/models/components/customersubscription.js";
import { createMiddleware } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { auth } from "auth";

interface SubscriptionContext {
  subscription: CustomerSubscription | undefined;
  hasActiveSubscription: boolean;
  activeOrganizationId: string;
}

export const subscriptionMiddleware = createMiddleware({
  type: "request",
}).server(async ({ request, next }) => {
  try {
    const session = await auth.api.getSession({
      headers: getHeaders() as unknown as Headers,
    });

    const activeOrganizationId = session?.session?.activeOrganizationId || "";

    const subscriptionResponse = await auth.api.subscriptions({
      query: {
        page: 1,
        limit: 1,
        active: true,
        referenceId: activeOrganizationId,
      },
      headers: request.headers,
    });

    const subscription = subscriptionResponse?.result?.items?.[0] as
      | CustomerSubscription
      | undefined;
    const hasActiveSubscription = subscription?.status === "active";

    console.log("📊 Subscription middleware:", {
      hasSubscription: hasActiveSubscription,
    });

    return await next({
      context: {
        subscription,
        hasActiveSubscription,
        activeOrganizationId,
      } satisfies SubscriptionContext,
    });
  } catch (error) {
    console.error("💥 Error in subscription middleware:", error);

    return await next({
      context: {
        subscription: undefined,
        hasActiveSubscription: false,
        activeOrganizationId: "",
      } satisfies SubscriptionContext,
    });
  }
});
