import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

interface Subscription {
  id: string;
  [key: string]: any;
}

const organizationId = (await authClient.organization.list())?.data?.[0]?.id;

export function useSubscription() {
  return useQuery<Subscription | null>({
    queryKey: ["subscription", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      const { data } = await authClient.customer.subscriptions.list({
        query: {
          page: 1,
          limit: 1,
          active: true,
          referenceId: organizationId,
        },
      });
      return data?.result?.items?.[0] || null;
    },
    enabled: !!organizationId,
  });
}
