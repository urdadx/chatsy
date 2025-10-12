import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUserMember() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: [
      "current-user-member",
      session?.user?.id,
      session?.session?.activeOrganizationId,
    ],
    queryFn: async () => {
      if (!session?.user?.id || !session?.session?.activeOrganizationId) {
        return null;
      }

      try {
        const response = await fetch("/api/current-user-member");
        if (!response.ok) {
          throw new Error("Failed to fetch current user member");
        }
        return await response.json();
      } catch (error) {
        console.error("Error getting current user member:", error);
        return null;
      }
    },
    enabled: !!session?.user?.id && !!session?.session?.activeOrganizationId,
    staleTime: 5 * 60 * 1000,
  });
}
