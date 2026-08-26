import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/**
 * Shared query options: refetch on window focus (so switching back to the
 * site tab after editing in /admin picks up changes immediately) and poll
 * every 15s as a safety net. staleTime 0 means every mount/focus refetches.
 */
const liveOptions = {
  staleTime: 0,
  refetchOnWindowFocus: true,
  refetchInterval: 15000,
} as const;

export function useSettings() {
  return useQuery({ queryKey: ["settings"], queryFn: api.getSettings, ...liveOptions });
}

export function useProjects() {
  return useQuery({ queryKey: ["projects"], queryFn: api.getProjects, ...liveOptions });
}

export function useServices() {
  return useQuery({ queryKey: ["services"], queryFn: api.getServices, ...liveOptions });
}

export function useSkills() {
  return useQuery({ queryKey: ["skills"], queryFn: api.getSkills, ...liveOptions });
}

export function useTools() {
  return useQuery({ queryKey: ["tools"], queryFn: api.getTools, ...liveOptions });
}

export function useFeaturedSlides() {
  return useQuery({ queryKey: ["featuredSlides"], queryFn: api.getFeaturedSlides, ...liveOptions });
}

export function useMilestones() {
  return useQuery({ queryKey: ["milestones"], queryFn: api.getMilestones, ...liveOptions });
}

export function useStats() {
  return useQuery({ queryKey: ["stats"], queryFn: api.getStats, ...liveOptions });
}
