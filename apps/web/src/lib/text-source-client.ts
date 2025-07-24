import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "./auth-client";

export type TextSource = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export const useTextSources = () => {
  const { data: session } = useSession();
  const organizationId = session?.session?.activeOrganizationId;
  return useQuery<TextSource[]>({
    queryKey: ["text-sources", organizationId],
    queryFn: async () => {
      const { data } = await api.get("/text-sources");
      return data;
    },
    enabled: !!organizationId,
  });
};

export const useCreateTextSource = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const organizationId = session?.session?.activeOrganizationId;
  return useMutation({
    mutationFn: async (textSource: { title: string; content: string }) => {
      const { data } = await api.post("/text-sources", textSource);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["text-sources", organizationId],
      });
    },
  });
};

export const useUpdateTextSource = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const organizationId = session?.session?.activeOrganizationId;
  return useMutation({
    mutationFn: async (textSource: Partial<TextSource>) => {
      const { data } = await api.patch("/text-sources", textSource);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["text-sources", organizationId],
      });
    },
  });
};

export const useDeleteTextSource = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const organizationId = session?.session?.activeOrganizationId;
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete("/text-sources", { data: { id } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["text-sources", organizationId],
      });
    },
  });
};
