import { authClient } from "@/lib/auth-client";
import { getActiveMeter } from "@/lib/auth-utils";
import { useQuery } from "@tanstack/react-query";

export function useUsage(meterName = "all") {
  return useQuery({
    queryKey: ["customerMeters", meterName],
    queryFn: async () => {
      const { data } = await authClient.usage.meters.list({
        query: { page: 1, limit: 10 },
      });
      const items = data?.result?.items ?? [];
      if (meterName && meterName !== "all") {
        return (
          items.find((item: any) => item.meter?.name === meterName) ?? null
        );
      }
      return items;
    },
    refetchOnWindowFocus: false,
  });
}

export const useActiveMeters = () => {
  return useQuery({
    queryKey: ["active-meters"],
    queryFn: () => getActiveMeter(),
    refetchOnWindowFocus: false,
  });
};
