import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Faq, InsertFaq } from "@shared/schema";

export function useFaqs() {
  return useQuery<Faq[]>({
    queryKey: [api.faqs.list.path],
  });
}

export function useFeaturedFaqs() {
  return useQuery<Faq[]>({
    queryKey: [api.faqs.featured.path],
  });
}

export function useCreateFaq() {
  return useMutation({
    mutationFn: async (data: InsertFaq) => {
      const res = await apiRequest("POST", api.faqs.create.path, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.faqs.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.faqs.featured.path] });
    },
  });
}

export function useUpdateFaq() {
  return useMutation({
    mutationFn: async (data: Partial<InsertFaq> & { id: number }) => {
      const { id, ...rest } = data;
      const url = buildUrl(api.faqs.update.path, { id });
      const res = await apiRequest("PATCH", url, rest);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.faqs.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.faqs.featured.path] });
    },
  });
}

export function useDeleteFaq() {
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.faqs.delete.path, { id });
      const res = await apiRequest("DELETE", url);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.faqs.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.faqs.featured.path] });
    },
  });
}
