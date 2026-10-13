import { useState } from 'react';
import type { ParticipantRef, Tournament } from '@/shared/api/types';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { ConfirmDialog } from '@/shared/ui/Modal';
import { DiffCell, Table, TableScroll, Td, Th } from '@/shared/ui/Table';
import { errorMessage } from '@/shared/api/http';
import { cn } from '@/shared/lib/cn';
import { playerIdByParticipant } from '../model';
import { PlayerLink } from './PlayerLink';
import type { TournamentActions } from '../queries';
import { ScoreEntry } from './ScoreEntry';

export interface AmericanoBoardProps {
  tournament: Tournament;
  editable: boolean;
  actions?: TournamentActions;
}

/**
 * Американо: пары пересобираются каждый раунд, поэтому личный зачёт считается
 * по очкам, а не по победам пары. Таблицу присылает бэкенд.
 */
export function AmericanoBoard({ tournament, editable, actions }: AmericanoBoardProps) {
  const [clearTarget, setClearTarget] = useState<{ matchId: string; label: string } | null>(null);
  const score = actions?.setAmericanoScore;
  const players = playerIdByParticipant(tournament);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardTitle>Таблица</CardTitle>

        <TableScroll>
          <Table>
            <thead>
              <tr>
                <Th className="w-2/5">Игрок</Th>
                <Th title="Матчи">М</Th>
                <Th title="Победы">В</Th>
                <Th title="Поражения">П</Th>
                <Th title="Очки за / против">Очки</Th>
                <Th title="Разница">±</Th>
                <Th title="Очки турнира" className="text-brand">
                  Т
                </Th>
              </tr>
            </thead>
            <tbody>
              {(tournament.standings ?? []).map((row, index) => (
                <tr key={row.participantId}>
                  <Td>
                    <span className="text-ink-dim mr-1.5 tabular-nums">{index + 1}.</span>
                    <PlayerLink playerId={players.get(row.participantId)} name={row.name} />
                  </Td>
                  <Td>{row.played}</Td>
                  <Td>{row.wins}</Td>
                  <Td>{row.losses}</Td>
                  <Td>
                    {row.goalsFor}:{row.goalsAgainst}
                  </Td>
                  <DiffCell value={row.diff} />
                  <Td className="text-brand font-bold">{row.points}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </Card>

      {(tournament.americanoRounds ?? []).map((round) => (
        <Card key={round.id}>
          <CardTitle>Раунд {round.roundIdx + 1}</CardTitle>

          <div className="flex flex-col gap-2">
            {round.matches.map((match) => {
              const sideAWon = match.played && (match.score1 ?? 0) > (match.score2 ?? 0);
              const sideBWon = match.played && (match.score2 ?? 0) > (match.score1 ?? 0);
              const label = `${sideLabel(match.sideA)} — ${sideLabel(match.sideB)}`;

              return (
                <div
                  key={match.id}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border p-2.5',
                    match.played ? 'border-line bg-surface' : 'border-brand/25 bg-brand/5',
                  )}
                >
                  <Pair
                    side={match.sideA}
                    players={players}
                    className={cn(
                      'min-w-0 flex-1 justify-end text-right text-sm',
                      sideAWon ? 'text-brand font-semibold' : 'text-ink',
                    )}
                  />

                  <div className="w-24 shrink-0 text-center">
                    {match.played ? (
                      <span className="text-base font-bold tabular-nums">
                        {match.score1} : {match.score2}
                      </span>
                    ) : editable ? (
                      <ScoreEntry
                        compact
                        drawPolicy="reject"
                        pending={score?.isPending}
                        onSubmit={(score1, score2) =>
                          score?.mutate({ matchId: match.id, score: { score1, score2 } })
                        }
                      />
                    ) : (
                      <span className="text-ink-dim text-sm">— : —</span>
                    )}
                  </div>

                  <Pair
                    side={match.sideB}
                    players={players}
                    className={cn(
                      'min-w-0 flex-1 text-sm',
                      sideBWon ? 'text-brand font-semibold' : 'text-ink',
                    )}
                  />

                  {match.played && editable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Изменить счёт"
                      onClick={() => setClearTarget({ matchId: match.id, label })}
                    >
                      ✏️
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {round.byes.length > 0 && (
            <p className="text-ink-dim mt-3 text-xs">
              😴 Отдыхают: {round.byes.map((bye) => bye.name).join(', ')}
            </p>
          )}
        </Card>
      ))}

      {score?.isError && <p className="text-danger text-sm">⚠️ {errorMessage(score.error)}</p>}

      <ConfirmDialog
        open={Boolean(clearTarget)}
        onClose={() => setClearTarget(null)}
        onConfirm={() =>
          clearTarget &&
          score?.mutate(
            { matchId: clearTarget.matchId, score: { clear: true } },
            { onSuccess: () => setClearTarget(null) },
          )
        }
        pending={score?.isPending}
        title="✏️ Изменить счёт?"
        description={clearTarget ? `Матч: ${clearTarget.label}. Текущий счёт будет очищен.` : undefined}
      />
    </div>
  );
}

function sideLabel(side: ParticipantRef[]) {
  return side.map((participant) => participant.name).join(' / ');
}

/** Пара в американо: каждое имя — отдельная ссылка на профиль. */
function Pair({
  side,
  players,
  className,
}: {
  side: ParticipantRef[];
  players: Map<string, string>;
  className?: string;
}) {
  return (
    <span className={cn('flex flex-wrap items-center gap-x-1', className)}>
      {side.map((participant, index) => (
        <span key={participant.participantId} className="contents">
          {index > 0 && <span className="text-ink-dim">/</span>}
          <PlayerLink
            playerId={players.get(participant.participantId)}
            name={participant.name}
            className="truncate"
          />
        </span>
      ))}
    </span>
  );
}
