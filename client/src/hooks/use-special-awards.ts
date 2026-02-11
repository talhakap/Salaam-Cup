import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SpecialAward, InsertSpecialAward } from "@shared/schema";

export function useSpecialAwards() {
  return useQuery<SpecialAward[]>({
    queryKey: [api.specialAwards.list.path],
  });
}

export function useCreateSpecialAward() {
  return useMutation({
    mutationFn: async (data: InsertSpecialAward) => {
      const res = await apiRequest("POST", api.specialAwards.create.path, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.specialAwards.list.path] });
    },
  });
}

export function useUpdateSpecialAward() {
  return useMutation({
    mutationFn: async (data: Partial<InsertSpecialAward> & { id: number }) => {
      const { id, ...rest } = data;
      const url = buildUrl(api.specialAwards.update.path, { id });
      const res = await apiRequest("PATCH", url, rest);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.specialAwards.list.path] });
    },
  });
}

export function useDeleteSpecialAward() {
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.specialAwards.delete.path, { id });
      const res = await apiRequest("DELETE", url);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.specialAwards.list.path] });
    },
  });
}
