import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Sport, InsertSport } from "@shared/schema";

export function useSports() {
  return useQuery<Sport[]>({
    queryKey: [api.sports.list.path],
  });
}

export function useCreateSport() {
  return useMutation({
    mutationFn: async (data: InsertSport) => {
      const res = await apiRequest("POST", api.sports.create.path, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sports.list.path] });
    },
  });
}

export function useUpdateSport() {
  return useMutation({
    mutationFn: async (data: Partial<InsertSport> & { id: number }) => {
      const { id, ...rest } = data;
      const url = buildUrl(api.sports.update.path, { id });
      const res = await apiRequest("PATCH", url, rest);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sports.list.path] });
    },
  });
}

export function useDeleteSport() {
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.sports.delete.path, { id });
      const res = await apiRequest("DELETE", url);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sports.list.path] });
    },
  });
}
