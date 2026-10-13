import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { canManageOrg, type OrgRole, type OrganizationInvite } from '@/shared/api/types';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Field, Input, Select } from '@/shared/ui/Field';
import { Badge } from '@/shared/ui/Badge';
import { ConfirmDialog } from '@/shared/ui/Modal';
import { Table, TableScroll, Td, Th } from '@/shared/ui/Table';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/StateView';
import { errorMessage } from '@/shared/api/http';
import { formatDate } from '@/shared/lib/date';
import { useSession } from '@/features/auth/session';
import { usePlayers } from '@/features/players/api';
import { InviteForm } from './InviteForm';
import { InviteLinkCard } from './InviteLinkCard';
import { MEMBER_ROLE_OPTIONS, ORG_ROLE_LABELS } from './labels';
import {
  useInvites,
  useRevokeInvite,
  useMembers,
  useOrganization,
  useRemoveMember,
  useRenameOrganization,
  useUpdateMember,
} from './queries';

export function OrganizationPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSession();

  const { data: org, isPending, isError, error, refetch } = useOrganization(id);
  const { data: members } = useMembers(id);

  const [freshInvite, setFreshInvite] = useState<OrganizationInvite | null>(null);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} title="Организация не открылась" />;

  const canManage = canManageOrg(org.role);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-ink text-xl font-bold">🏢 {org.name}</h1>
          <p className="text-ink-muted mt-1 text-xs">
            /{org.slug} · {org.memberCount} участников · создана {formatDate(org.createdAt)}
          </p>
        </div>
        <Badge tone={canManage ? 'brand' : 'neutral'}>{ORG_ROLE_LABELS[org.role ?? 'member']}</Badge>
      </Card>

      {canManage && <RenameCard orgId={id} currentName={org.name} />}

      <Card>
        <CardTitle>Состав</CardTitle>
        {canManage && (
          <p className="text-ink-muted mb-3 text-xs">
            Привяжите участника к профилю игрока — тогда его результаты станут его
            собственными: он сможет менять имя, аватарку и видеть свою статистику.
          </p>
        )}

        <TableScroll>
          <Table>
            <thead>
              <tr>
                <Th>Человек</Th>
                <Th>Профиль игрока</Th>
                <Th>Роль</Th>
                <Th>В организации с</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {(members ?? []).map((member) => (
                <MemberRow
                  key={member.userId}
                  orgId={id}
                  member={member}
                  canManage={canManage}
                  isSelf={member.userId === user?.id}
                  onLeft={() => navigate('/organizations', { replace: true })}
                />
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </Card>

      {canManage && (
        <>
          <Card>
            <CardTitle>Позвать человека</CardTitle>
            {freshInvite && (
              <div className="mb-4">
                <InviteLinkCard invite={freshInvite} />
              </div>
            )}
            <InviteForm orgId={id} onCreated={setFreshInvite} />
          </Card>

          <InvitesCard orgId={id} />
        </>
      )}
    </div>
  );
}

function RenameCard({ orgId, currentName }: { orgId: string; currentName: string }) {
  const rename = useRenameOrganization(orgId);
  const [name, setName] = useState(currentName);

  return (
    <Card>
      <CardTitle>Название</CardTitle>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          rename.mutate(name.trim());
        }}
      >
        <Field className="min-w-48 flex-1">
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Button
          type="submit"
          variant="secondary"
          disabled={rename.isPending || name.trim() === currentName || name.trim().length < 2}
        >
          {rename.isPending ? 'Сохраняем…' : 'Переименовать'}
        </Button>
      </form>
      {rename.isError && <p className="text-danger mt-2 text-sm">⚠️ {errorMessage(rename.error)}</p>}
    </Card>
  );
}

function MemberRow({
  orgId,
  member,
  canManage,
  isSelf,
  onLeft,
}: {
  orgId: string;
  member: {
    userId: string;
    username: string;
    displayName: string;
    role: OrgRole;
    playerId: string | null;
    playerName: string | null;
    joinedAt: string;
  };
  canManage: boolean;
  isSelf: boolean;
  onLeft: () => void;
}) {
  const update = useUpdateMember(orgId);
  const remove = useRemoveMember(orgId);
  const [confirmRemove, setConfirmRemove] = useState(false);

  return (
    <tr>
      <Td>
        <span className="font-medium">{member.displayName || member.username}</span>
        {isSelf && <span className="text-ink-dim ml-1.5 text-xs">— это вы</span>}
      </Td>
      <Td>
        {canManage ? (
          <PlayerPicker
            orgId={orgId}
            value={member.playerId}
            disabled={update.isPending}
            onChange={(playerId) => update.mutate({ userId: member.userId, playerId })}
          />
        ) : (
          (member.playerName ?? <span className="text-ink-dim">не привязан</span>)
        )}
      </Td>
      <Td>
        {canManage ? (
          <Select
            className="w-auto py-1 text-xs"
            value={member.role}
            disabled={update.isPending}
            onChange={(event) =>
              update.mutate({ userId: member.userId, role: event.target.value as OrgRole })
            }
          >
            {MEMBER_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        ) : (
          ORG_ROLE_LABELS[member.role]
        )}
      </Td>
      <Td>{formatDate(member.joinedAt)}</Td>
      <Td>
        {(canManage || isSelf) && (
          <Button variant="ghost" size="sm" onClick={() => setConfirmRemove(true)}>
            {isSelf ? 'Выйти' : '🗑'}
          </Button>
        )}

        <ConfirmDialog
          open={confirmRemove}
          onClose={() => setConfirmRemove(false)}
          onConfirm={() =>
            remove.mutate(member.userId, {
              onSuccess: () => {
                setConfirmRemove(false);
                if (isSelf) onLeft();
              },
            })
          }
          pending={remove.isPending}
          variant="danger"
          confirmLabel={isSelf ? 'Выйти' : 'Убрать'}
          title={isSelf ? 'Выйти из организации?' : 'Убрать участника?'}
          description={
            isSelf
              ? 'Вы потеряете доступ к её турнирам и статистике. Вернуться можно только по новому приглашению.'
              : `«${member.displayName || member.username}» потеряет доступ. Его турниры и результаты останутся.`
          }
        />
        {remove.isError && <div className="text-danger text-xs">{errorMessage(remove.error)}</div>}
      </Td>
    </tr>
  );
}

/**
 * Выбор профиля игрока для участника. Показываем свободные профили и текущий:
 * один профиль не может принадлежать двум учёткам — это запрещено в базе.
 */
function PlayerPicker({
  orgId,
  value,
  disabled,
  onChange,
}: {
  orgId: string;
  value: string | null;
  disabled?: boolean;
  /** Пустая строка отвязывает: бэкенд трактует её как «убрать связь». */
  onChange: (playerId: string) => void;
}) {
  const { data: players } = usePlayers({ org: orgId, pageSize: 200 });

  const options = (players?.items ?? []).filter(
    (player) => !player.userId || player.id === value,
  );

  return (
    <Select
      className="w-auto py-1 text-xs"
      value={value ?? ''}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">не привязан</option>
      {options.map((player) => (
        <option key={player.id} value={player.id}>
          {player.name}
        </option>
      ))}
    </Select>
  );
}

function InvitesCard({ orgId }: { orgId: string }) {
  const { data: invites, isPending } = useInvites(orgId);

  if (isPending) return null;

  const pending = (invites ?? []).filter((invite) => !invite.acceptedAt && !invite.revokedAt);

  return (
    <Card>
      <CardTitle>Приглашения</CardTitle>

      {pending.length === 0 ? (
        <EmptyState>Открытых приглашений нет.</EmptyState>
      ) : (
        <TableScroll>
          <Table>
            <thead>
              <tr>
                <Th>Для кого</Th>
                <Th>Роль</Th>
                <Th>Заметка</Th>
                <Th>Действует до</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {pending.map((invite) => (
                <InviteRow key={invite.id} orgId={orgId} invite={invite} />
              ))}
            </tbody>
          </Table>
        </TableScroll>
      )}
    </Card>
  );
}

function InviteRow({ orgId, invite }: { orgId: string; invite: OrganizationInvite }) {
  const revoke = useRevokeInvite(orgId);
  const expired = new Date(invite.expiresAt) < new Date();

  return (
    <tr>
      <Td>{invite.playerName ?? <span className="text-ink-dim">без профиля</span>}</Td>
      <Td>{ORG_ROLE_LABELS[invite.role]}</Td>
      <Td>{invite.note || '—'}</Td>
      <Td className={expired ? 'text-danger' : undefined}>
        {formatDate(invite.expiresAt)}
        {expired && ' (истекло)'}
      </Td>
      <Td>
        <Button variant="ghost" size="sm" disabled={revoke.isPending} onClick={() => revoke.mutate(invite.id)}>
          Отозвать
        </Button>
      </Td>
    </tr>
  );
}

