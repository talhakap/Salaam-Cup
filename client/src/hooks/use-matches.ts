import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import type { InsertMatch, Match } from "@shared/schema";

export function useMatches(tournamentId: number) {
  return useQuery({
    queryKey: [api.matches.list.path, tournamentId],
    queryFn: async () => {
      const url = buildUrl(api.matches.list.path, { tournamentId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch matches");
      return api.matches.list.responses[200].parse(await res.json());
    },
    enabled: !!tournamentId,
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertMatch) => {
      const res = await apiRequest("POST", api.matches.create.path, data);
      return res.json() as Promise<Match>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.matches.list.path, variables.tournamentId] });
    },
  });
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertMatch>) => {
      const url = buildUrl(api.matches.update.path, { id });
      const res = await apiRequest("PATCH", url, data);
      return res.json() as Promise<Match>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.matches.list.path, data.tournamentId] });
    },
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tournamentId }: { id: number; tournamentId: number }) => {
      const url = buildUrl(api.matches.delete.path, { id });
      await apiRequest("DELETE", url);
      return { tournamentId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.matches.list.path, data.tournamentId] });
    },
  });
}
