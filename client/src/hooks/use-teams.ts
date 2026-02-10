import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertTeam, Team } from "@shared/schema";

export function useTeams(tournamentId: number, params?: { status?: string, divisionId?: string }) {
  return useQuery({
    queryKey: [api.teams.list.path, tournamentId, params],
    queryFn: async () => {
      let url = buildUrl(api.teams.list.path, { tournamentId });
      if (params) {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.set("status", params.status);
        if (params.divisionId) queryParams.set("divisionId", params.divisionId);
        url += `?${queryParams.toString()}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch teams");
      return api.teams.list.responses[200].parse(await res.json());
    },
    enabled: !!tournamentId,
  });
}

export function useTeam(id: number) {
  return useQuery({
    queryKey: [api.teams.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.teams.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch team");
      return api.teams.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertTeam) => {
      const res = await fetch(api.teams.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create team");
      return api.teams.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.teams.list.path, variables.tournamentId] });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertTeam>) => {
      const url = buildUrl(api.teams.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update team");
      return api.teams.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.teams.get.path, data.id] });
      queryClient.invalidateQueries({ queryKey: [api.teams.list.path, data.tournamentId] });
    },
  });
}
