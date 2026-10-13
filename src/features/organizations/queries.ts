import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateInviteInput,
  CreateOrganizationInput,
  UpdateMemberInput,
} from '@/shared/api/types';
import { organizationsApi } from './api';

export const orgKeys = {
  mine: ['organizations'] as const,
  detail: (id: string) => ['organizations', id] as const,
  members: (id: string) => ['organizations', id, 'members'] as const,
  invites: (id: string) => ['organizations', id, 'invites'] as const,
  invitePreview: (token: string) => ['invite-preview', token] as const,
};

export function useOrganizations() {
  return useQuery({
    queryKey: orgKeys.mine,
    queryFn: () => organizationsApi.listMine(),
    staleTime: 5 * 60_000,
  });
}

export function useOrganization(id: string | undefined) {
  return useQuery({
    queryKey: orgKeys.detail(id!),
    queryFn: () => organizationsApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useMembers(id: string | undefined) {
  return useQuery({
    queryKey: orgKeys.members(id!),
    queryFn: () => organizationsApi.members(id!),
    enabled: Boolean(id),
  });
}

export function useInvites(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: orgKeys.invites(id!),
    queryFn: () => organizationsApi.invites(id!),
    enabled: Boolean(id) && enabled,
  });
}

/** Предпросмотр приглашения — единственный запрос организаций без входа. */
export function useInvitePreview(token: string | null) {
  return useQuery({
    queryKey: orgKeys.invitePreview(token!),
    queryFn: () => organizationsApi.previewInvite(token!),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrganizationInput) => organizationsApi.create(input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: orgKeys.mine }),
  });
}

export function useRenameOrganization(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => organizationsApi.update(id, { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgKeys.mine });
      void queryClient.invalidateQueries({ queryKey: orgKeys.detail(id) });
    },
  });
}

export function useUpdateMember(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: string } & UpdateMemberInput) => {
      const { userId, ...rest } = input;
      return organizationsApi.updateMember(orgId, userId, rest);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: orgKeys.members(orgId) }),
  });
}

export function useRemoveMember(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => organizationsApi.removeMember(orgId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgKeys.members(orgId) });
      // Выйти можно и самому — тогда меняется список своих организаций.
      void queryClient.invalidateQueries({ queryKey: orgKeys.mine });
    },
  });
}

export function useCreateInvite(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateInviteInput) => organizationsApi.createInvite(orgId, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: orgKeys.invites(orgId) }),
  });
}

export function useRevokeInvite(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => organizationsApi.revokeInvite(orgId, inviteId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: orgKeys.invites(orgId) }),
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => organizationsApi.acceptInvite(token),
    onSuccess: () => {
      // Принятое приглашение открывает доступ ко всему содержимому организации.
      void queryClient.invalidateQueries();
    },
  });
}
