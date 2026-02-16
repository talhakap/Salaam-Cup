import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { StandingsAdjustment } from "@shared/schema";

export function useStandingsAdjustments(tournamentId: number) {
  return useQuery<StandingsAdjustment[]>({
    queryKey: ["/api/tournaments", tournamentId, "standings", "adjustments"],
    queryFn: () => fetch(`/api/tournaments/${tournamentId}/standings/adjustments`).then(r => r.json()),
    enabled: !!tournamentId,
  });
}

export function useUpsertStandingsAdjustment() {
  return useMutation({
    mutationFn: async (data: { tournamentId: number; teamId: number; divisionId: number; pointsAdjustment?: number; winsAdjustment?: number; lossesAdjustment?: number; tiesAdjustment?: number; goalsForAdjustment?: number; goalsAgainstAdjustment?: number; notes?: string }) => {
      const res = await apiRequest("POST", `/api/tournaments/${data.tournamentId}/standings/adjustments`, data);
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", variables.tournamentId, "standings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", variables.tournamentId, "standings", "adjustments"] });
    },
  });
}

export function useDeleteStandingsAdjustment() {
  return useMutation({
    mutationFn: async (data: { id: number; tournamentId: number }) => {
      const res = await apiRequest("DELETE", `/api/tournaments/${data.tournamentId}/standings/adjustments/${data.id}`);
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", variables.tournamentId, "standings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", variables.tournamentId, "standings", "adjustments"] });
    },
  });
}
