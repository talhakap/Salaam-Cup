import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
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
      const res = await fetch(api.matches.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create match");
      return api.matches.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.matches.list.path, variables.tournamentId] });
    },
  });
}
