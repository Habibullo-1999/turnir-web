import { api } from '@/shared/api/http';
import type {
  CreateInviteInput,
  CreateOrganizationInput,
  InvitePreview,
  Organization,
  OrganizationInvite,
  OrganizationMember,
  UpdateMemberInput,
} from '@/shared/api/types';

export const organizationsApi = {
  listMine: () => api.get<Organization[]>('/organizations'),

  get: (id: string) => api.get<Organization>(`/organizations/${id}`),

  create: (input: CreateOrganizationInput) => api.post<Organization>('/organizations', input),

  update: (id: string, input: { name: string }) =>
    api.patch<Organization>(`/organizations/${id}`, input),

  remove: (id: string) => api.delete<null>(`/organizations/${id}`),

  members: (id: string) => api.get<OrganizationMember[]>(`/organizations/${id}/members`),

  updateMember: (id: string, userId: string, input: UpdateMemberInput) =>
    api.patch<OrganizationMember[]>(`/organizations/${id}/members/${userId}`, input),

  removeMember: (id: string, userId: string) =>
    api.delete<null>(`/organizations/${id}/members/${userId}`),

  invites: (id: string) => api.get<OrganizationInvite[]>(`/organizations/${id}/invites`),

  createInvite: (id: string, input: CreateInviteInput) =>
    api.post<OrganizationInvite>(`/organizations/${id}/invites`, input),

  revokeInvite: (id: string, inviteId: string) =>
    api.delete<null>(`/organizations/${id}/invites/${inviteId}`),

  /** Открыто без входа: по ссылке нужно понять, куда зовут. */
  previewInvite: (token: string) => api.get<InvitePreview>('/public/invites', { query: { token } }),

  acceptInvite: (token: string) =>
    api.post<Organization>('/organizations/invites/accept', { token }),
};
