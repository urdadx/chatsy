import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export function useUsage() {
  return useQuery({
    queryKey: ["customerMeters"],
    queryFn: async () => {
      const { data } = await authClient.usage.meters.list({
        query: { page: 1, limit: 10 },
      });
      return data?.result?.items?.[0];
    },
  });
}
