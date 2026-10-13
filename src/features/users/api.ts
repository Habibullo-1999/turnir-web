import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/http';
import type { Page, Role, User } from '@/shared/api/types';

export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  displayName?: string;
  role: Role;
}

export interface UpdateUserInput {
  displayName?: string;
  role?: Role;
  isActive?: boolean;
  password?: string;
}

const usersKey = ['users'] as const;

export function useUsers() {
  return useQuery({
    queryKey: usersKey,
    queryFn: () => api.get<Page<User>>('/users', { query: { pageSize: 200 } }),
  });
}

function useUsersMutation<TInput>(mutationFn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usersKey }),
  });
}

export function useCreateUser() {
  return useUsersMutation((input: CreateUserInput) => api.post<User>('/users', input));
}

export function useUpdateUser() {
  return useUsersMutation((input: { id: string } & UpdateUserInput) => {
    const { id, ...body } = input;
    return api.patch<User>(`/users/${id}`, body);
  });
}

export function useDeleteUser() {
  return useUsersMutation((id: string) => api.delete<null>(`/users/${id}`));
}
