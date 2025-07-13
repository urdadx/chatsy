import type { Branding } from "@/db/schema";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useBranding() {
  return useQuery<Branding>({
    queryKey: ["branding"],
    queryFn: async () => {
      const response = await api.get("/my-branding");
      return response.data;
    },
  });
}

export function useUpdateBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Branding) => {
      const response = await api.patch("/my-branding", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding"] });
      toast.success("Saved!");
    },
  });
}
