import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { MediaYearWithItems, MediaYear, MediaItem } from "@shared/schema";

export function useMediaYears() {
  return useQuery<MediaYearWithItems[]>({
    queryKey: ["/api/media/years"],
  });
}

export function useCreateMediaYear() {
  return useMutation({
    mutationFn: (data: { year: number; sortOrder?: number }) =>
      apiRequest("POST", "/api/media/years", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media/years"] });
    },
  });
}

export function useUpdateMediaYear() {
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; year?: number; sortOrder?: number }) =>
      apiRequest("PATCH", `/api/media/years/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media/years"] });
    },
  });
}

export function useDeleteMediaYear() {
  return useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/media/years/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media/years"] });
    },
  });
}

export function useCreateMediaItem() {
  return useMutation({
    mutationFn: (data: { mediaYearId: number; imageUrl: string; category: string; tournamentName: string; linkUrl?: string; sortOrder?: number }) =>
      apiRequest("POST", "/api/media/items", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media/years"] });
    },
  });
}

export function useUpdateMediaItem() {
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; imageUrl?: string; category?: string; tournamentName?: string; linkUrl?: string; sortOrder?: number }) =>
      apiRequest("PATCH", `/api/media/items/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media/years"] });
    },
  });
}

export function useDeleteMediaItem() {
  return useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/media/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media/years"] });
    },
  });
}
