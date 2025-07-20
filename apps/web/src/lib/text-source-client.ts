import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type TextSource = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export const useTextSources = () => {
  return useQuery<TextSource[]>({
    queryKey: ["textSources"],
    queryFn: async () => {
      const { data } = await api.get("/text-sources");
      return data;
    },
  });
};

export const useCreateTextSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (textSource: { title: string; content: string }) => {
      const { data } = await api.post("/text-sources", textSource);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["textSources"] });
    },
  });
};

export const useUpdateTextSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (textSource: Partial<TextSource>) => {
      const { data } = await api.patch("/text-sources", textSource);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["textSources"] });
    },
  });
};

export const useDeleteTextSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete("/text-sources", { data: { id } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["textSources"] });
    },
  });
};
