import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { TournamentSponsor, InsertTournamentSponsor } from "@shared/schema";

export function useTournamentSponsors(tournamentId: number) {
  const path = buildUrl(api.tournamentSponsors.list.path, { tournamentId });
  return useQuery<TournamentSponsor[]>({
    queryKey: ['/api/tournaments', tournamentId, 'sponsors'],
    queryFn: async () => {
      const res = await fetch(path);
      if (!res.ok) throw new Error("Failed to fetch tournament sponsors");
      return res.json();
    },
    enabled: !!tournamentId,
  });
}

export function useCreateTournamentSponsor() {
  return useMutation({
    mutationFn: async (data: Omit<InsertTournamentSponsor, 'tournamentId'> & { tournamentId: number }) => {
      const { tournamentId, ...rest } = data;
      const url = buildUrl(api.tournamentSponsors.create.path, { tournamentId });
      const res = await apiRequest("POST", url, rest);
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', variables.tournamentId, 'sponsors'] });
    },
  });
}

export function useUpdateTournamentSponsor() {
  return useMutation({
    mutationFn: async (data: Partial<InsertTournamentSponsor> & { id: number; tournamentId: number }) => {
      const { id, tournamentId, ...rest } = data;
      const url = buildUrl(api.tournamentSponsors.update.path, { id });
      const res = await apiRequest("PATCH", url, rest);
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', variables.tournamentId, 'sponsors'] });
    },
  });
}

export function useDeleteTournamentSponsor() {
  return useMutation({
    mutationFn: async ({ id, tournamentId }: { id: number; tournamentId: number }) => {
      const url = buildUrl(api.tournamentSponsors.delete.path, { id });
      const res = await apiRequest("DELETE", url);
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', variables.tournamentId, 'sponsors'] });
    },
  });
}
