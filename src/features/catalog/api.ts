import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/http';
import type { Club, Sport } from '@/shared/api/types';

/** Справочники меняются раз в год — держим их в кеше всю сессию. */
const CATALOG_STALE_TIME = Infinity;

export function useSports() {
  return useQuery({
    queryKey: ['sports'],
    queryFn: () => api.get<Sport[]>('/sports'),
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useClubs(league?: string) {
  return useQuery({
    queryKey: ['clubs', league ?? 'all'],
    queryFn: () => api.get<Club[]>('/clubs', { query: { league } }),
    staleTime: CATALOG_STALE_TIME,
  });
}

/** Вид спорта по коду; пока справочник грузится — undefined. */
export function useSport(code: string | undefined) {
  const { data, ...rest } = useSports();
  return { ...rest, data: data?.find((sport) => sport.code === code) };
}
