import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/http';
import { tokenStore } from '@/shared/api/tokenStore';
import type { UpdateProfileInput, User } from '@/shared/api/types';
import { authApi, type LoginInput, type RegisterInput } from './api';

const sessionKey = ['session'] as const;

/**
 * Единственный источник правды о том, кто вошёл. Восстановление сессии после
 * перезагрузки происходит само: `/auth/me` без токена получает 401, http-слой
 * молча обновляет его по refresh-cookie и повторяет запрос.
 */
export function useSession() {
  const query = useQuery({
    queryKey: sessionKey,
    queryFn: async (): Promise<User | null> => {
      try {
        return await authApi.me();
      } catch (error) {
        if (error instanceof ApiError && error.isUnauthorized) return null;
        throw error;
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isPending,
    isAuthenticated: Boolean(query.data),
    canWrite: query.data?.role === 'admin' || query.data?.role === 'organizer',
    isAdmin: query.data?.role === 'admin',
  };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (pair) => {
      tokenStore.set(pair.accessToken);
      queryClient.setQueryData(sessionKey, pair.user ?? null);
      // Публичные данные могли быть загружены как гостю — перечитываем.
      void queryClient.invalidateQueries();
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (pair) => {
      tokenStore.set(pair.accessToken);
      queryClient.setQueryData(sessionKey, pair.user ?? null);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    // Даже если сервер не ответил, локально выходим: токен всё равно мёртв.
    onSettled: () => {
      tokenStore.set(null);
      queryClient.setQueryData(sessionKey, null);
      queryClient.clear();
    },
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: authApi.changePassword });
}

/** Меняет своё имя и почту. Смена почты снимает подтверждение. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => authApi.updateProfile(input),
    onSuccess: (user) => queryClient.setQueryData(sessionKey, user),
  });
}
