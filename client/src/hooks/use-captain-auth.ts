import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CaptainUser {
  userId: string;
  email: string;
}

export function useCaptainAuth() {
  const queryClient = useQueryClient();

  const { data: captain, isLoading } = useQuery<CaptainUser | null>({
    queryKey: ["/api/captain/me"],
    queryFn: async () => {
      const res = await fetch("/api/captain/me", { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to check captain auth");
      return res.json();
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/captain/logout", {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/captain/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/my-teams"] });
    },
  });

  return {
    captain,
    isLoading,
    isAuthenticated: !!captain,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
