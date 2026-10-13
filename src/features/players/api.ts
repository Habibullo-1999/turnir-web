import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/http';
import type {
  MergePlayersInput,
  UpdatePlayerInput,
  MergeResult,
  Page,
  PlayerProfile,
  Tournament,
} from '@/shared/api/types';

export function usePlayers(query: { org?: string; q?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['players', query],
    queryFn: () => api.get<Page<PlayerProfile>>('/players', { query }),
    placeholderData: (previous) => previous,
  });
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string } & UpdatePlayerInput) => {
      const { id, ...body } = input;
      return api.patch<PlayerProfile>(`/players/${id}`, body);
    },
    onSuccess: (player) => {
      queryClient.setQueryData(['players', 'profile', player.id, 'all'], player);
      void queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
}

/** Аватарка уходит multipart-ом: файл в JSON не завернёшь. */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: Blob }) => {
      const form = new FormData();
      form.append('file', file, 'avatar.jpg');
      return api.post<PlayerProfile>(`/players/${id}/avatar`, form);
    },
    onSuccess: () => {
      // Аватарка видна в профиле, списке игроков и на баннере победителя.
      void queryClient.invalidateQueries();
    },
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<PlayerProfile>(`/players/${id}/avatar`),
    onSuccess: () => void queryClient.invalidateQueries(),
  });
}

/** Слияние дублей — операция управляющего организации, необратимая. */
export function useMergePlayers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MergePlayersInput) => api.post<MergeResult>('/players/merge', input),
    onSuccess: () => {
      // Слияние переписывает участия, статистику и таблицы турниров.
      void queryClient.invalidateQueries();
    },
  });
}

export function usePlayerProfile(id: string | undefined, sport?: string) {
  return useQuery({
    queryKey: ['players', 'profile', id, sport ?? 'all'],
    queryFn: () => api.get<PlayerProfile>(`/players/${id}`, { query: { sport } }),
    enabled: Boolean(id),
  });
}

/**
 * Турниры игрока. Страница большая намеренно: список фильтруется по виду спорта
 * уже в браузере, и порция в двадцать записей выглядела бы как «почти не играл».
 */
export function usePlayerTournaments(id: string | undefined) {
  return useQuery({
    queryKey: ['players', 'tournaments', id],
    queryFn: () =>
      api.get<Page<Tournament>>(`/players/${id}/tournaments`, { query: { pageSize: 200 } }),
    enabled: Boolean(id),
  });
}
