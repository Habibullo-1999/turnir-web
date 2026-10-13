import { useState } from 'react';
import type { Tournament } from '@/shared/api/types';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Field';
import { Table, TableScroll, Td, Th } from '@/shared/ui/Table';
import { errorMessage } from '@/shared/api/http';
import { reps as pluralReps } from '@/shared/lib/plural';
import { cn } from '@/shared/lib/cn';
import { ladderView, playerIdByParticipant } from '../model';
import { PlayerLink } from './PlayerLink';
import type { TournamentActions } from '../queries';

export interface LadderBoardProps {
  tournament: Tournament;
  editable: boolean;
  actions?: TournamentActions;
}

/**
 * Турник — лестница на выбывание: каждый раунд планка выше на одно
 * подтягивание. Кто не выполнил — называет, сколько успел: это нужно и для
 * общей статистики, и как tie-break при равном раунде вылета.
 */
export function LadderBoard({ tournament, editable, actions }: LadderBoardProps) {
  const view = ladderView(tournament.ladder);
  const players = playerIdByParticipant(tournament);
  const isFinished = tournament.status === 'finished';
  const canEdit = editable && !isFinished;

  const [failing, setFailing] = useState<{ participantId: string; reps: string } | null>(null);
  const [repsError, setRepsError] = useState<string | null>(null);

  const attempt = actions?.recordLadderAttempt;
  const advance = actions?.advanceLadder;

  function markPassed(participantId: string) {
    attempt?.mutate({ participantId, passed: true });
  }

  function confirmFail() {
    if (!failing) return;
    const reps = Number(failing.reps);
    if (!Number.isInteger(reps) || reps < 0) {
      setRepsError('Введите, сколько подтягиваний получилось.');
      return;
    }

    setRepsError(null);
    attempt?.mutate(
      { participantId: failing.participantId, passed: false, reps },
      { onSuccess: () => setFailing(null) },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardTitle
          action={
            canEdit && (
              <Button
                variant="primary"
                size="sm"
                disabled={!view.allMarked || advance?.isPending}
                onClick={() => advance?.mutate(undefined)}
              >
                {advance?.isPending ? 'Переходим…' : `Начать раунд ${view.round + 1} →`}
              </Button>
            )
          }
        >
          {isFinished ? 'Итоги турника' : `Раунд ${view.round} · ${pluralReps(view.round)}`}
        </CardTitle>

        <div className="flex flex-col gap-2">
          {view.active.map((row) => {
            const isFailing = failing?.participantId === row.participantId;

            return (
              <div
                key={row.participantId}
                className="border-line bg-surface flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-ink truncate text-sm font-medium">
                    {isFinished && '🥇 '}
                    <PlayerLink playerId={players.get(row.participantId)} name={row.name} />
                  </div>
                  {!isFinished && !isFailing && (
                    <div className={cn('text-xs', row.passed ? 'text-brand' : 'text-ink-dim')}>
                      {row.passed ? '✅ Выполнил' : canEdit ? 'Ожидает отметки' : '—'}
                    </div>
                  )}
                </div>

                {canEdit &&
                  (isFailing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        autoFocus
                        placeholder="0"
                        aria-label="Сколько подтягиваний"
                        className="w-16 text-center tabular-nums"
                        value={failing.reps}
                        onChange={(event) =>
                          setFailing({ ...failing, reps: event.target.value })
                        }
                        onKeyDown={(event) => event.key === 'Enter' && confirmFail()}
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={attempt?.isPending}
                        onClick={confirmFail}
                      >
                        Ок
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setFailing(null)}>
                        Отмена
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={attempt?.isPending}
                        onClick={() => markPassed(row.participantId)}
                      >
                        ✅ Выполнил
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={attempt?.isPending}
                        onClick={() => {
                          setRepsError(null);
                          setFailing({ participantId: row.participantId, reps: '' });
                        }}
                      >
                        ❌ Не выполнил
                      </Button>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>

        {repsError && <p className="text-danger mt-2 text-xs">{repsError}</p>}
        {(attempt?.isError || advance?.isError) && (
          <p className="text-danger mt-2 text-sm">
            ⚠️ {errorMessage(attempt?.error ?? advance?.error)}
          </p>
        )}
      </Card>

      {view.eliminated.length > 0 && (
        <Card>
          <CardTitle>Выбывшие</CardTitle>

          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <Th className="w-16">Место</Th>
                  <Th>Участник</Th>
                  <Th>Выбыл в раунде</Th>
                  <Th>Подтягиваний</Th>
                </tr>
              </thead>
              <tbody>
                {view.eliminated.map((row) => (
                  <tr key={row.participantId}>
                    <Td>{row.rank}</Td>
                    <Td>
                      <PlayerLink playerId={players.get(row.participantId)} name={row.name} />
                    </Td>
                    <Td>{row.eliminatedRound}</Td>
                    <Td>{row.reps ?? '—'}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        </Card>
      )}
    </div>
  );
}
