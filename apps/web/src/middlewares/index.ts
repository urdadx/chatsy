import { getCustomerExternalId } from "@/lib/subscription/subscription-functions";
import type { CustomerSubscription } from "@polar-sh/sdk/models/components/customersubscription.js";
import { createMiddleware } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { auth, polarClient } from "../../auth";

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
        referenceId: activeOrganizationId,
      },
      headers: request.headers,
    });

    const subscription = subscriptionResponse?.result?.items?.[0] as
      | CustomerSubscription
      | undefined;

    let hasActiveSubscription = false;

    if (subscription?.status === "active") {
      // If subscription is active (paid), it's always valid regardless of trial end
      hasActiveSubscription = true;
    } else if (subscription?.status === "trialing") {
      // For trialing subscriptions, check if trial has ended
      // @ts-ignore - polar needs to update their types to include trialEnd
      const hasTrialEnded = subscription?.trialEnd
        ? // @ts-ignore
          new Date(subscription.trialEnd) < new Date()
        : false;

      hasActiveSubscription = !hasTrialEnded;
    }

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

// i am using getCustomerExternalId here to get the external customer ID
// then using that to get the active meters from polar
// and then getting the llm_usage meter to find the tokens left
// because polar does not return meter data in subscription object for invited users
// in an organization
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

// Export rate limit middlewares
export {
  rateLimitMiddleware,
  chatRateLimitMiddleware,
  embedChatRateLimitMiddleware,
} from "./rate-limit";
