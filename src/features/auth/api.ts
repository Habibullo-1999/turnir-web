import { api } from '@/shared/api/http';
import type { TokenPair, UpdateProfileInput, User } from '@/shared/api/types';

export interface LoginInput {
  login: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export const authApi = {
  login: (input: LoginInput) => api.post<TokenPair>('/auth/login', input),
  register: (input: RegisterInput) => api.post<TokenPair>('/auth/register', input),
  logout: () => api.post<null>('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
  updateProfile: (input: UpdateProfileInput) => api.patch<User>('/auth/me', input),
  changePassword: (input: { oldPassword: string; newPassword: string }) =>
    api.post<null>('/auth/change-password', input),
};
