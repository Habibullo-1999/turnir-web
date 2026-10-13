import { useState } from 'react';
import type { PlayerProfile } from '@/shared/api/types';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Field, Select } from '@/shared/ui/Field';
import { ConfirmDialog } from '@/shared/ui/Modal';
import { errorMessage } from '@/shared/api/http';
import { useMergePlayers } from './api';

/**
 * Один человек попадает в реестр дважды, если его записывали по-разному —
 * «Хабиб» в футболе и «Хабибулло» в теннисе. Операция необратима и доступна
 * только управляющему организации.
 */
export function MergePlayersCard({ players }: { players: PlayerProfile[] }) {
  const merge = useMergePlayers();
  const [fromId, setFromId] = useState('');
  const [intoId, setIntoId] = useState('');
  const [confirming, setConfirming] = useState(false);

  const from = players.find((player) => player.id === fromId);
  const into = players.find((player) => player.id === intoId);
  const ready = Boolean(from && into && fromId !== intoId);

  return (
    <Card>
      <CardTitle>Объединить дубли</CardTitle>

      <p className="text-ink-muted mb-3 text-xs">
        Участия первого профиля перейдут ко второму, а лишняя запись исчезнет.
        Турниры, где играли оба, останутся нетронутыми — значит это разные люди.
      </p>

      <div className="flex flex-wrap items-end gap-2">
        <Field label="Лишний профиль" className="min-w-44 flex-1">
          <Select value={fromId} onChange={(event) => setFromId(event.target.value)}>
            <option value="">Выберите…</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </Select>
        </Field>

        <span className="text-ink-dim pb-2">→</span>

        <Field label="Останется" className="min-w-44 flex-1">
          <Select value={intoId} onChange={(event) => setIntoId(event.target.value)}>
            <option value="">Выберите…</option>
            {players
              .filter((player) => player.id !== fromId)
              .map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
          </Select>
        </Field>

        <Button variant="danger" disabled={!ready} onClick={() => setConfirming(true)}>
          Объединить
        </Button>
      </div>

      {merge.isError && <p className="text-danger mt-3 text-sm">⚠️ {errorMessage(merge.error)}</p>}

      {merge.isSuccess && (
        <div className="border-brand/30 bg-brand/5 mt-3 rounded-xl border p-3 text-sm">
          <div className="text-brand font-semibold">
            ✅ Готово: перенесено участий — {merge.data.moved}
          </div>
          {merge.data.conflicts.length > 0 && (
            <div className="text-ink-muted mt-2 text-xs">
              Не тронуты турниры, где играли оба: {merge.data.conflicts.join(', ')}. Похоже,
              это всё-таки разные люди — профиль оставлен.
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() =>
          merge.mutate(
            { fromId, intoId },
            {
              onSuccess: () => {
                setConfirming(false);
                setFromId('');
                setIntoId('');
              },
            },
          )
        }
        pending={merge.isPending}
        variant="danger"
        confirmLabel="Объединить"
        title="Объединить профили?"
        description={
          from && into
            ? `Все участия «${from.name}» станут участиями «${into.name}», а профиль «${from.name}» будет удалён. Отменить это нельзя.`
            : undefined
        }
      />
    </Card>
  );
}
