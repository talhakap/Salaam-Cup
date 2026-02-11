import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Award } from "@shared/schema";

export function useAllAwards() {
  return useQuery<Award[]>({
    queryKey: ["/api/awards"],
    queryFn: async () => {
      const res = await fetch("/api/awards");
      if (!res.ok) throw new Error("Failed to fetch awards");
      return res.json();
    },
  });
}

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

function invalidateAllAwardQueries() {
  queryClient.invalidateQueries({ queryKey: ["/api/awards"] });
  queryClient.invalidateQueries({ queryKey: ["/api/tournaments"], predicate: (query) => {
    const key = query.queryKey;
    return Array.isArray(key) && key.length >= 3 && key[2] === "awards";
  }});
}

export function useCreateAward() {
  return useMutation({
    mutationFn: async (data: Omit<Award, "id">) => {
      const res = await apiRequest("POST", "/api/awards", data);
      return res.json();
    },
    onSuccess: invalidateAllAwardQueries,
  });
}

export function useUpdateAward() {
  return useMutation({
    mutationFn: async (data: Partial<Award> & { id: number }) => {
      const { id, ...body } = data;
      const res = await apiRequest("PATCH", `/api/awards/${id}`, body);
      return res.json();
    },
    onSuccess: invalidateAllAwardQueries,
  });
}

export function useDeleteAward() {
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const res = await apiRequest("DELETE", `/api/awards/${id}`);
      return res.json();
    },
    onSuccess: invalidateAllAwardQueries,
  });
}
