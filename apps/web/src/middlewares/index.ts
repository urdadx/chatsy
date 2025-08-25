import { getCustomerExternalId } from "@/lib/subscription/subscription-functions";
import type { CustomerSubscription } from "@polar-sh/sdk/models/components/customersubscription.js";
import { createMiddleware } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { auth, polarClient } from "auth";

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

export const tokenUsageMiddleware = createMiddleware({
  type: "request",
}).server(async ({ next }) => {
  try {
    const externalCustomerId = (await getCustomerExternalId()) || "";

    const result = await polarClient.customers.getStateExternal({
      externalId: externalCustomerId,
    });

    // Get the first item in active_meters and calculate tokensLeft
    const meterItem = result?.activeMeters?.[0];
    const tokensLeft = meterItem
      ? meterItem.creditedUnits - meterItem.consumedUnits
      : 0;
    console.log("Tokens left for ai_usage_two:", tokensLeft);

    return await next({
      context: {
        tokensLeft,
      },
    });
  } catch (error) {
    console.error("💥 Error in tokens left middleware:", error);

    return await next({
      context: {
        tokensLeft: 0,
      },
    });
  }
});
