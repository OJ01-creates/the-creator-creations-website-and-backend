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

export function useUpdates() {
  return useQuery({ queryKey: ["updates"], queryFn: api.getUpdates, ...liveOptions });
}

/**
 * True once every query the homepage depends on has finished its first
 * fetch attempt — successfully or not (our api.ts getters fail soft and
 * resolve to null rather than throwing, so "finished" here just means
 * "we've heard back, one way or another").
 *
 * Calling these hooks again here doesn't cause extra network requests —
 * React Query shares one cached result per queryKey, so this just reads
 * the same in-flight/resolved queries every section component already
 * subscribes to.
 *
 * Used by LoadingScreen to hold the reveal until real content is in hand,
 * instead of always revealing after a fixed animation length and risking a
 * flash of default/fallback content before the live data swaps in.
 */
export function useInitialDataReady(): boolean {
  const settings = useSettings();
  const projects = useProjects();
  const services = useServices();
  const skills = useSkills();
  const tools = useTools();
  const featuredSlides = useFeaturedSlides();
  const milestones = useMilestones();
  const stats = useStats();
  const updates = useUpdates();

  return ![settings, projects, services, skills, tools, featuredSlides, milestones, stats, updates].some(
    (query) => query.isLoading
  );
}
