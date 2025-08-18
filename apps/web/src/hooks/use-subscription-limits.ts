import { api } from "@/lib/api";
import { authClient, useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export interface SubscriptionLimits {
  canCreateChatbot: boolean;
  currentChatbotCount: number;
  chatbotLimit: number;
  tier?: string;
  hasExtraAddons: boolean;
  reason?: string;
  message?: string;
}

export function useSubscriptionLimits() {
  const { data: session } = useSession();
  const organizationId = session?.session?.activeOrganizationId;

  return useQuery<SubscriptionLimits>({
    queryKey: ["subscription-limits", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return {
          canCreateChatbot: false,
          currentChatbotCount: 0,
          chatbotLimit: 0,
          hasExtraAddons: false,
          reason: "no_organization",
          message: "No active organization found",
        };
      }

      try {
        // Get current chatbot count
        let currentCount = 0;
        try {
          const countResponse = await api.get("/chatbot-count");
          currentCount = countResponse.data.count || 0;
        } catch (error) {
          console.warn("Could not fetch chatbot count:", error);
        }

        // Get organization subscriptions using the same pattern as chatbot-settings
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
            canCreateChatbot: false,
            currentChatbotCount: currentCount,
            chatbotLimit: 0,
            hasExtraAddons: false,
            reason: "no_subscription",
            message: "No active subscription found",
          };
        }

        // Find main subscription tier
        const mainSubscription = subscriptions.result.items.find((sub: any) => {
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
            canCreateChatbot: false,
            currentChatbotCount: currentCount,
            chatbotLimit: 0,
            hasExtraAddons: false,
            reason: "no_main_subscription",
            message: "No main subscription plan found",
          };
        }

        // Determine subscription limits
        const productName = mainSubscription.product?.name?.toLowerCase() || "";
        let baseLimit = 1; // default to starter
        let tier = "starter";

        if (productName.includes("starter")) {
          baseLimit = 1;
          tier = "starter";
        } else if (productName.includes("growth")) {
          baseLimit = 3;
          tier = "growth";
        } else if (
          productName.includes("professional") ||
          productName.includes("pro")
        ) {
          baseLimit = 5;
          tier = "professional";
        }

        // Check for extra chatbot add-ons
        const extraChatbotAddons = subscriptions.result.items.filter(
          (sub: any) => {
            const productName = sub.product?.name?.toLowerCase() || "";
            return (
              productName.includes("extra") && productName.includes("chatbot")
            );
          },
        );

        const totalLimit = baseLimit + extraChatbotAddons.length;

        return {
          canCreateChatbot: currentCount < totalLimit,
          currentChatbotCount: currentCount,
          chatbotLimit: totalLimit,
          tier,
          hasExtraAddons: extraChatbotAddons.length > 0,
        };
      } catch (error) {
        console.error("Error checking subscription limits:", error);
        return {
          canCreateChatbot: true, // Be permissive on error, let server-side handle real validation
          currentChatbotCount: 0,
          chatbotLimit: 999,
          hasExtraAddons: false,
          reason: "error",
          message: "Unable to verify subscription",
        };
      }
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
