import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import type { InsertTournament, Tournament, Division, InsertDivision } from "@shared/schema";

export function useTournaments() {
  return useQuery({
    queryKey: [api.tournaments.list.path],
    queryFn: async () => {
      const res = await fetch(api.tournaments.list.path);
      if (!res.ok) throw new Error("Failed to fetch tournaments");
      return api.tournaments.list.responses[200].parse(await res.json());
    },
  });
}

export function useTournament(id: number) {
  return useQuery({
    queryKey: [api.tournaments.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tournaments.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tournament");
      return api.tournaments.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertTournament) => {
      const res = await fetch(api.tournaments.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create tournament");
      return api.tournaments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tournaments.list.path] });
    },
  });
}

// Divisions are closely related to tournaments
export function useDivisions(tournamentId: number) {
  return useQuery({
    queryKey: [api.divisions.list.path, tournamentId],
    queryFn: async () => {
      const url = buildUrl(api.divisions.list.path, { tournamentId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch divisions");
      return api.divisions.list.responses[200].parse(await res.json());
    },
    enabled: !!tournamentId,
  });
}

export function useUpdateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertTournament>) => {
      const url = buildUrl(api.tournamentUpdate.path, { id });
      const res = await apiRequest("PATCH", url, data);
      return res.json() as Promise<Tournament>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.tournaments.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.tournaments.get.path, data.id] });
    },
  });
}

export function useDeleteTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tournamentDelete.path, { id });
      await apiRequest("DELETE", url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tournaments.list.path] });
    },
  });
}

export function useCreateDivision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertDivision) => {
      const res = await apiRequest("POST", api.divisions.create.path, data);
      return res.json() as Promise<Division>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.divisions.list.path, variables.tournamentId] });
      queryClient.invalidateQueries({ queryKey: [api.tournaments.get.path, variables.tournamentId] });
    },
  });
}

export function useUpdateDivision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertDivision>) => {
      const url = buildUrl(api.divisions.update.path, { id });
      const res = await apiRequest("PATCH", url, data);
      return res.json() as Promise<Division>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.divisions.list.path, data.tournamentId] });
      queryClient.invalidateQueries({ queryKey: [api.tournaments.get.path, data.tournamentId] });
    },
  });
}

export function useDeleteDivision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tournamentId }: { id: number; tournamentId: number }) => {
      const url = buildUrl(api.divisions.delete.path, { id });
      await apiRequest("DELETE", url);
      return { tournamentId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.divisions.list.path, data.tournamentId] });
      queryClient.invalidateQueries({ queryKey: [api.tournaments.get.path, data.tournamentId] });
    },
  });
}

export function useReorderTournaments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: number[]) => {
      await apiRequest("POST", "/api/tournaments/reorder", { orderedIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tournaments.list.path] });
    },
  });
}

export function useReorderDivisions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tournamentId, orderedIds }: { tournamentId: number; orderedIds: number[] }) => {
      await apiRequest("POST", `/api/tournaments/${tournamentId}/divisions/reorder`, { orderedIds });
      return { tournamentId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.divisions.list.path, data.tournamentId] });
      queryClient.invalidateQueries({ queryKey: [api.tournaments.get.path, data.tournamentId] });
    },
  });
}
