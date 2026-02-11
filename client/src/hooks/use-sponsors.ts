import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Sponsor, InsertSponsor } from "@shared/schema";

export function useSponsors() {
  return useQuery<Sponsor[]>({
    queryKey: [api.sponsors.list.path],
  });
}

export function useCreateSponsor() {
  return useMutation({
    mutationFn: async (data: InsertSponsor) => {
      const res = await apiRequest("POST", api.sponsors.create.path, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sponsors.list.path] });
    },
  });
}

export function useUpdateSponsor() {
  return useMutation({
    mutationFn: async (data: Partial<InsertSponsor> & { id: number }) => {
      const { id, ...rest } = data;
      const url = buildUrl(api.sponsors.update.path, { id });
      const res = await apiRequest("PATCH", url, rest);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sponsors.list.path] });
    },
  });
}

export function useDeleteSponsor() {
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.sponsors.delete.path, { id });
      const res = await apiRequest("DELETE", url);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sponsors.list.path] });
    },
  });
}
