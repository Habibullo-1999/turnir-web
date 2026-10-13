import type { OrgRole } from '@/shared/api/types';

export const ORG_ROLE_LABELS: Record<OrgRole, string> = {
  owner: 'Владелец',
  admin: 'Администратор',
  member: 'Участник',
};

/** Владельца в приглашении выдать нельзя — только он сам может передать роль. */
export const INVITE_ROLE_OPTIONS: Array<{ value: OrgRole; label: string }> = [
  { value: 'member', label: ORG_ROLE_LABELS.member },
  { value: 'admin', label: ORG_ROLE_LABELS.admin },
];

export const MEMBER_ROLE_OPTIONS: Array<{ value: OrgRole; label: string }> = [
  { value: 'owner', label: ORG_ROLE_LABELS.owner },
  ...INVITE_ROLE_OPTIONS,
];
