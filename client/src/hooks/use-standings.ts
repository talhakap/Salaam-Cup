import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useStandings(tournamentId: number) {
  return useQuery({
    queryKey: [api.standings.list.path, tournamentId],
    queryFn: async () => {
      const url = buildUrl(api.standings.list.path, { tournamentId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch standings");
      return res.json();
    },
    enabled: !!tournamentId,
  });
}
