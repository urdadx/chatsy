import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

interface Subscription {
  id: string;
  [key: string]: any;
}

export function useSubscription(organizationId?: string) {
  return useQuery<Subscription | null>({
    queryKey: ["subscription", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      const { data } = await authClient.customer.subscriptions.list({
        query: {
          page: 1,
          limit: 10,
          active: true,
          referenceId: organizationId,
        },
      });
      console.log("Subscription Data:", data);
      return data?.result?.items?.[0] || null;
    },
    enabled: !!organizationId,
  });
}
