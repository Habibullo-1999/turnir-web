import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/http';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Повторять есть смысл только сетевые сбои: 401/403/404 не «починятся».
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
