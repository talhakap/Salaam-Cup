import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import type { InsertTeam, Team } from "@shared/schema";

export function useMyTeams() {
  return useQuery<Team[]>({
    queryKey: [api.myTeams.list.path],
    queryFn: async () => {
      const res = await fetch(api.myTeams.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch my teams");
      return res.json();
    },
  });
}

export function useAllTeams(status?: string) {
  return useQuery<Team[]>({
    queryKey: [api.allTeams.list.path, status],
    queryFn: async () => {
      let url = api.allTeams.list.path;
      if (status) url += `?status=${status}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch all teams");
      return res.json();
    },
  });
}

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
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to create team" }));
        throw new Error(err.message || "Failed to create team");
      }
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
      const res = await apiRequest("PATCH", url, updates);
      return res.json() as Promise<Team>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.teams.get.path, data.id] });
      queryClient.invalidateQueries({ queryKey: [api.teams.list.path, data.tournamentId] });
      queryClient.invalidateQueries({ queryKey: [api.allTeams.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.myTeams.list.path] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.teams.delete.path, { id });
      await apiRequest("DELETE", url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.allTeams.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.teams.list.path] });
    },
  });
}
