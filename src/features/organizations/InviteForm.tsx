import { useState } from 'react';
import type { CreateInviteInput, OrgRole, OrganizationInvite } from '@/shared/api/types';
import { Button } from '@/shared/ui/Button';
import { Field, Input, Select } from '@/shared/ui/Field';
import { errorMessage } from '@/shared/api/http';
import { usePlayers } from '@/features/players/api';
import { INVITE_ROLE_OPTIONS } from './labels';
import { useCreateInvite } from './queries';

/**
 * Главное в приглашении — привязка к профилю игрока: человек получает учётку
 * вместе со своей прошлой статистикой, а не пустого двойника.
 */
export function InviteForm({
  orgId,
  onCreated,
}: {
  orgId: string;
  /** Созданное приглашение отдаётся наверх: ссылку надо показать сразу. */
  onCreated: (invite: OrganizationInvite) => void;
}) {
  const create = useCreateInvite(orgId);
  const { data: players } = usePlayers({ org: orgId, pageSize: 200 });

  const [role, setRole] = useState<OrgRole>('member');
  const [playerId, setPlayerId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [note, setNote] = useState('');

  // Учётку получает либо существующий игрок, либо новый — но не оба сразу.
  const unclaimed = (players?.items ?? []).filter((player) => !player.userId);

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const input: CreateInviteInput = { role, note: note.trim() || undefined };
    if (playerId) input.playerId = playerId;
    else if (playerName.trim()) input.playerName = playerName.trim();

    create.mutate(input, {
      onSuccess: (invite) => {
        setPlayerId('');
        setPlayerName('');
        setNote('');
        onCreated(invite);
      },
    });
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Кого зовём" hint="Игрок из реестра — тогда к нему перейдёт вся его история">
          <Select
            value={playerId}
            onChange={(event) => {
              setPlayerId(event.target.value);
              if (event.target.value) setPlayerName('');
            }}
          >
            <option value="">Новый человек</option>
            {unclaimed.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Роль">
          <Select value={role} onChange={(event) => setRole(event.target.value as OrgRole)}>
            {INVITE_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {!playerId && (
        <Field label="Имя нового игрока" hint="Необязательно: без него учётка будет без профиля">
          <Input
            placeholder="Например: Салим"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
          />
        </Field>
      )}

      <Field label="Заметка" hint="Для себя — кому выдали ссылку">
        <Input value={note} onChange={(event) => setNote(event.target.value)} />
      </Field>

      {create.isError && <p className="text-danger text-sm">⚠️ {errorMessage(create.error)}</p>}

      <Button type="submit" variant="primary" disabled={create.isPending}>
        {create.isPending ? 'Создаём…' : '🔗 Создать ссылку'}
      </Button>
    </form>
  );
}
