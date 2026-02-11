import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { AboutContent, InsertAboutContent } from "@shared/schema";

export function useAboutContent() {
  return useQuery<AboutContent | null>({
    queryKey: [api.aboutContent.get.path],
  });
}

export function useUpsertAboutContent() {
  return useMutation({
    mutationFn: async (data: InsertAboutContent) => {
      const res = await apiRequest("POST", api.aboutContent.upsert.path, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.aboutContent.get.path] });
    },
  });
}
