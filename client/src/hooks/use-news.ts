import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { News, InsertNews } from "@shared/schema";

export function useNews() {
  return useQuery<News[]>({
    queryKey: [api.news.list.path],
  });
}

export function useCreateNews() {
  return useMutation({
    mutationFn: async (data: InsertNews) => {
      const res = await apiRequest("POST", api.news.create.path, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.news.list.path] });
    },
  });
}

export function useUpdateNews() {
  return useMutation({
    mutationFn: async (data: Partial<InsertNews> & { id: number }) => {
      const { id, ...rest } = data;
      const url = buildUrl(api.news.update.path, { id });
      const res = await apiRequest("PATCH", url, rest);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.news.list.path] });
    },
  });
}

export function useDeleteNews() {
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.news.delete.path, { id });
      const res = await apiRequest("DELETE", url);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.news.list.path] });
    },
  });
}
