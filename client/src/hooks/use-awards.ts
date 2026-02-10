import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Award } from "@shared/schema";

export function useAwards(tournamentId: number) {
  return useQuery<Award[]>({
    queryKey: ["/api/tournaments", tournamentId, "awards"],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}/awards`);
      if (!res.ok) throw new Error("Failed to fetch awards");
      return res.json();
    },
    enabled: !!tournamentId,
  });
}

export function useCreateAward() {
  return useMutation({
    mutationFn: async (data: Omit<Award, "id">) => {
      const res = await apiRequest("POST", "/api/awards", data);
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", variables.tournamentId, "awards"] });
    },
  });
}

export function useUpdateAward() {
  return useMutation({
    mutationFn: async (data: Partial<Award> & { id: number; tournamentId: number }) => {
      const { id, tournamentId, ...body } = data;
      const res = await apiRequest("PATCH", `/api/awards/${id}`, body);
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", variables.tournamentId, "awards"] });
    },
  });
}

export function useDeleteAward() {
  return useMutation({
    mutationFn: async ({ id, tournamentId }: { id: number; tournamentId: number }) => {
      const res = await apiRequest("DELETE", `/api/awards/${id}`);
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", variables.tournamentId, "awards"] });
    },
  });
}
