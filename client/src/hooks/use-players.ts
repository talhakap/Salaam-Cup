import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import type { InsertPlayer, Player, Team } from "@shared/schema";

export function usePlayers(teamId: number) {
  return useQuery({
    queryKey: [api.players.list.path, teamId],
    queryFn: async () => {
      const url = buildUrl(api.players.list.path, { teamId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch players");
      return api.players.list.responses[200].parse(await res.json());
    },
    enabled: !!teamId,
  });
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPlayer) => {
      const res = await fetch(api.players.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to add player" }));
        throw new Error(err.message || "Failed to add player");
      }
      return api.players.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.players.list.path, variables.teamId] });
      queryClient.invalidateQueries({ queryKey: [api.teams.get.path, variables.teamId] });
    },
  });
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertPlayer>) => {
      const url = buildUrl(api.players.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to update player" }));
        throw new Error(err.message || "Failed to update player");
      }
      return api.players.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.players.list.path, data.teamId] });
      queryClient.invalidateQueries({ queryKey: [api.teams.get.path, data.teamId] });
      queryClient.invalidateQueries({ queryKey: [api.adminPlayers.list.path] });
    },
  });
}

export function useBulkCreatePlayers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, players }: { teamId: number, players: Omit<InsertPlayer, 'teamId'>[] }) => {
      const url = buildUrl(api.players.bulkCreate.path, { teamId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(players),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add players");
      return api.players.bulkCreate.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.players.list.path, variables.teamId] });
      queryClient.invalidateQueries({ queryKey: [api.teams.get.path, variables.teamId] });
    },
  });
}

export function useRegisterPlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPlayer) => {
      const res = await fetch(api.players.register.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to register player");
      return res.json() as Promise<Player>;
    },
    onSuccess: (data) => {
      if (data.teamId) {
        queryClient.invalidateQueries({ queryKey: [api.players.list.path, data.teamId] });
      }
      queryClient.invalidateQueries({ queryKey: [api.adminPlayers.list.path] });
    },
  });
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.players.delete.path, { id });
      await apiRequest("DELETE", url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.adminPlayers.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.players.list.path] });
    },
  });
}

export function useAdminPlayers(status?: string) {
  return useQuery<(Player & { team: Team | null })[]>({
    queryKey: [api.adminPlayers.list.path, status],
    queryFn: async () => {
      let url = api.adminPlayers.list.path;
      if (status) url += `?status=${status}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch players");
      return res.json();
    },
  });
}
