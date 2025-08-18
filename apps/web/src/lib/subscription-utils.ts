import { authClient } from "@/lib/auth-client";
import { getHeaders } from "@tanstack/react-start/server";
import { auth } from "auth";

export interface SubscriptionTier {
  name: string;
  chatbotLimit: number;
  slug: string;
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  starter: {
    name: "Starter",
    chatbotLimit: 1,
    slug: "starter",
  },
  growth: {
    name: "Growth",
    chatbotLimit: 3,
    slug: "growth",
  },
  professional: {
    name: "Professional",
    chatbotLimit: 5,
    slug: "pro",
  },
};

export async function checkChatbotCreationAccess(organizationId: string) {
  try {
    // Get current organization chatbot count
    const { data: subscriptions } =
      await authClient.customer.subscriptions.list({
        query: {
          page: 1,
          limit: 10,
          active: true,
          referenceId: organizationId,
        },
      });

    if (!subscriptions?.result?.items?.length) {
      return {
        canCreate: false,
        reason: "no_subscription",
        message:
          "No active subscription found. Please subscribe to a plan to create chatbots.",
        showUpgrade: true,
      };
    }

    // Find the main subscription (not add-ons)
    const mainSubscription = subscriptions.result.items.find((sub) => {
      const productName = sub.product?.name?.toLowerCase() || "";
      return (
        productName.includes("starter") ||
        productName.includes("growth") ||
        productName.includes("professional") ||
        productName.includes("pro")
      );
    });

    if (!mainSubscription) {
      return {
        canCreate: false,
        reason: "no_main_subscription",
        message: "No main subscription plan found. Please subscribe to a plan.",
        showUpgrade: true,
      };
    }

    // Determine the tier and limits
    const productName = mainSubscription.product?.name?.toLowerCase() || "";
    let tier: SubscriptionTier;

    if (productName.includes("starter")) {
      tier = SUBSCRIPTION_TIERS.starter;
    } else if (productName.includes("growth")) {
      tier = SUBSCRIPTION_TIERS.growth;
    } else if (
      productName.includes("professional") ||
      productName.includes("pro")
    ) {
      tier = SUBSCRIPTION_TIERS.professional;
    } else {
      return {
        canCreate: false,
        reason: "unknown_tier",
        message: "Unable to determine subscription tier.",
        showUpgrade: true,
      };
    }

    // Check for extra chatbot add-ons
    const extraChatbotAddons = subscriptions.result.items.filter((sub) => {
      const productName = sub.product?.name?.toLowerCase() || "";
      return productName.includes("extra") && productName.includes("chatbot");
    });

    const totalChatbotLimit = tier.chatbotLimit + extraChatbotAddons.length;

    return {
      canCreate: true,
      tier,
      currentLimit: totalChatbotLimit,
      hasExtraChatbotAddons: extraChatbotAddons.length > 0,
      extraChatbotCount: extraChatbotAddons.length,
    };
  } catch (error) {
    console.error("Error checking chatbot creation access:", error);
    return {
      canCreate: false,
      reason: "error",
      message: "Unable to verify subscription. Please try again.",
      showUpgrade: false,
    };
  }
}

export async function checkSubscriptionLimits(
  organizationId: string,
  currentChatbotCount: number,
) {
  try {
    const { result } = await auth.api.subscriptions({
      query: {
        page: 1,
        limit: 10,
        active: true,
        referenceId: organizationId,
      },
      headers: getHeaders() as unknown as Headers,
    });

    if (!result?.items?.length) {
      return {
        canCreate: false,
        reason: "no_subscription",
        message:
          "No active subscription found. Please subscribe to a plan to create chatbots.",
        currentCount: currentChatbotCount,
        limit: 0,
      };
    }

    // Find the main subscription (not add-ons)
    const mainSubscription = result.items.find((sub) => {
      const productName = sub.product?.name?.toLowerCase() || "";
      return (
        productName.includes("starter") ||
        productName.includes("growth") ||
        productName.includes("professional") ||
        productName.includes("pro")
      );
    });

    if (!mainSubscription) {
      return {
        canCreate: false,
        reason: "no_main_subscription",
        message: "No main subscription plan found. Please subscribe to a plan.",
        currentCount: currentChatbotCount,
        limit: 0,
      };
    }

    // Determine the tier and limits
    const productName = mainSubscription.product?.name?.toLowerCase() || "";
    let tier: SubscriptionTier;

    if (productName.includes("starter")) {
      tier = SUBSCRIPTION_TIERS.starter;
    } else if (productName.includes("growth")) {
      tier = SUBSCRIPTION_TIERS.growth;
    } else if (
      productName.includes("professional") ||
      productName.includes("pro")
    ) {
      tier = SUBSCRIPTION_TIERS.professional;
    } else {
      return {
        canCreate: false,
        reason: "unknown_tier",
        message: "Unable to determine subscription tier.",
        currentCount: currentChatbotCount,
        limit: 0,
      };
    }

    // Check for extra chatbot add-ons
    const extraChatbotAddons = result.items.filter((sub) => {
      const productName = sub.product?.name?.toLowerCase() || "";
      return productName.includes("extra") && productName.includes("chatbot");
    });

    const totalChatbotLimit = tier.chatbotLimit + extraChatbotAddons.length;

    if (currentChatbotCount >= totalChatbotLimit) {
      return {
        canCreate: false,
        reason: "limit_reached",
        message:
          "You have reached your chatbot limit. Please upgrade your plan or purchase additional chatbot add-ons.",
        currentCount: currentChatbotCount,
        limit: totalChatbotLimit,
      };
    }

    return {
      canCreate: true,
      reason: "success",
      message: "Chatbot creation allowed.",
      currentCount: currentChatbotCount,
      limit: totalChatbotLimit,
      tier,
    };
  } catch (error) {
    console.error("Error checking subscription limits:", error);
    return {
      canCreate: false,
      reason: "error",
      message: "Unable to verify subscription. Please try again.",
      currentCount: currentChatbotCount,
      limit: 0,
    };
  }
}
