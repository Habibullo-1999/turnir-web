import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/http';
import type { LadderStats, Page, PlayerStats, ScorerStats, StatsQuery } from '@/shared/api/types';

export function useLeaderboard(query: StatsQuery) {
  return useQuery({
    queryKey: ['stats', 'leaderboard', query],
    queryFn: () => api.get<Page<PlayerStats>>('/stats/leaderboard', { query }),
    placeholderData: (previous) => previous,
  });
}

export function useScorers(query: StatsQuery) {
  return useQuery({
    queryKey: ['stats', 'scorers', query],
    queryFn: () => api.get<Page<ScorerStats>>('/stats/scorers', { query }),
    placeholderData: (previous) => previous,
  });
}

export function useLadderStats(query: StatsQuery) {
  return useQuery({
    queryKey: ['stats', 'ladder', query],
    queryFn: () => api.get<Page<LadderStats>>('/stats/ladder', { query }),
    placeholderData: (previous) => previous,
  });
}
