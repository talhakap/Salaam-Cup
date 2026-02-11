import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Venue, InsertVenue } from "@shared/schema";

export function useVenues() {
  return useQuery<Venue[]>({
    queryKey: [api.venues.list.path],
  });
}

export function useCreateVenue() {
  return useMutation({
    mutationFn: async (data: InsertVenue) => {
      const res = await apiRequest("POST", api.venues.create.path, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.venues.list.path] });
    },
  });
}

export function useUpdateVenue() {
  return useMutation({
    mutationFn: async (data: Partial<InsertVenue> & { id: number }) => {
      const { id, ...rest } = data;
      const url = buildUrl(api.venues.update.path, { id });
      const res = await apiRequest("PATCH", url, rest);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.venues.list.path] });
    },
  });
}

export function useDeleteVenue() {
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.venues.delete.path, { id });
      const res = await apiRequest("DELETE", url);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.venues.list.path] });
    },
  });
}
