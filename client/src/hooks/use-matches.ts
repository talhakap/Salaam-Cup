import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import type { InsertMatch, Match } from "@shared/schema";

export function useMatches(tournamentId: number, includeDrafts: boolean = false) {
  return useQuery({
    queryKey: [api.matches.list.path, tournamentId, { includeDrafts }],
    queryFn: async () => {
      const url = buildUrl(api.matches.list.path, { tournamentId });
      const res = await fetch(`${url}${includeDrafts ? "?includeDrafts=true" : ""}`);
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
      queryClient.invalidateQueries({ queryKey: [api.standings.list.path, data.tournamentId] });
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

export function usePublishMatches() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tournamentId: number) => {
      const res = await apiRequest("POST", `/api/tournaments/${tournamentId}/matches/publish`);
      return res.json() as Promise<{ message: string; published: number }>;
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: [api.matches.list.path, tournamentId] });
      queryClient.invalidateQueries({ queryKey: [api.standings.list.path, tournamentId] });
    },
  });
}

export function useImportMatches() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tournamentId, matches }: { tournamentId: number; matches: Record<string, string>[] }) => {
      const res = await apiRequest("POST", `/api/tournaments/${tournamentId}/matches/import`, { matches });
      return res.json() as Promise<{ created: number; errors: string[]; total: number }>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.matches.list.path, variables.tournamentId] });
    },
  });
}
