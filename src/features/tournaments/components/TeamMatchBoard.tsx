import { useEffect, useMemo, useState } from 'react';
import type { MatchTeam, TeamMatchInput, Tournament } from '@/shared/api/types';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Field';
import { ConfirmDialog } from '@/shared/ui/Modal';
import { errorMessage } from '@/shared/api/http';
import { goals as pluralGoals } from '@/shared/lib/plural';
import { formatLongDate, fromDateInputValue, toDateInputValue } from '@/shared/lib/date';
import { cn } from '@/shared/lib/cn';
import { attributedGoals, playerIdByParticipant, teamsBySide } from '../model';
import { PlayerLink } from './PlayerLink';
import type { TournamentActions } from '../queries';

export interface TeamMatchBoardProps {
  tournament: Tournament;
  editable: boolean;
  actions?: TournamentActions;
}

type Draft = [MatchTeam, MatchTeam];

function toDraft(tournament: Tournament): Draft | null {
  const [home, away] = teamsBySide(tournament);
  return home && away ? [structuredClone(home), structuredClone(away)] : null;
}

function toPayload(draft: Draft, playedAt?: number): TeamMatchInput {
  return {
    ...(playedAt ? { playedAt } : {}),
    teams: draft.map((team) => ({
      side: team.side,
      name: team.name,
      score: team.score,
      players: team.players.map((player) => ({
        participantId: player.participantId,
        goals: player.goals,
      })),
    })) as TeamMatchInput['teams'],
  };
}

/**
 * Реальный футбол — это одна запись об одном матче: две команды, счёт и авторы
 * голов. Правки применяются на месте; черновик нужен, чтобы имя команды не
 * улетало на сервер на каждую нажатую букву.
 */
export function TeamMatchBoard({ tournament, editable, actions }: TeamMatchBoardProps) {
  const save = actions?.saveTeamMatch;
  const canEdit = editable && tournament.status === 'active';

  const [draft, setDraft] = useState<Draft | null>(() => toDraft(tournament));
  const [reshuffleOpen, setReshuffleOpen] = useState(false);
  const players = playerIdByParticipant(tournament);

  // Сервер — источник правды: после каждого сохранения (и после чужой правки)
  // черновик пересобирается из свежего ответа.
  useEffect(() => {
    setDraft(toDraft(tournament));
  }, [tournament]);

  const playedAt = tournament.playedAt ?? tournament.createdAt;

  const scorers = useMemo(
    () =>
      (draft ?? [])
        .flatMap((team) => team.players.map((player) => ({ ...player, team: team.name })))
        .filter((player) => player.goals > 0)
        .sort((a, b) => b.goals - a.goals),
    [draft],
  );

  if (!draft) {
    return (
      <Card>
        <CardTitle>{tournament.name || 'Матч'}</CardTitle>
        <p className="text-ink-muted text-sm">Составы ещё не созданы.</p>
      </Card>
    );
  }

  function commit(next: Draft, playedAtOverride?: number) {
    setDraft(next);
    save?.mutate(toPayload(next, playedAtOverride));
  }

  function patchTeam(side: 0 | 1, patch: (team: MatchTeam) => MatchTeam): Draft {
    return draft!.map((team) => (team.side === side ? patch(structuredClone(team)) : team)) as Draft;
  }

  function bumpGoal(side: 0 | 1, participantId: string, delta: number) {
    commit(
      patchTeam(side, (team) => {
        team.players = team.players.map((player) =>
          player.participantId === participantId
            ? { ...player, goals: Math.max(0, player.goals + delta) }
            : player,
        );
        // Счёт не может быть меньше расписанных голов — бэкенд иначе откажет.
        team.score = Math.max(team.score, attributedGoals(team));
        return team;
      }),
    );
  }

  function movePlayer(fromSide: 0 | 1, participantId: string) {
    const toSide = (1 - fromSide) as 0 | 1;
    const player = draft!
      .find((team) => team.side === fromSide)
      ?.players.find((candidate) => candidate.participantId === participantId);
    if (!player) return;

    commit(
      draft!.map((team) => {
        const copy = structuredClone(team);
        if (copy.side === fromSide) {
          copy.players = copy.players.filter((p) => p.participantId !== participantId);
        }
        if (copy.side === toSide) {
          copy.players = [...copy.players, { ...player, teamId: copy.id, goals: 0 }];
        }
        copy.score = Math.max(copy.score, attributedGoals(copy));
        return copy;
      }) as Draft,
    );
  }

  function reshuffle() {
    const everyone = draft!
      .flatMap((team) => team.players.map((player) => ({ ...player, goals: 0 })))
      .map((player) => ({ player, order: Math.random() }))
      .sort((a, b) => a.order - b.order)
      .map(({ player }) => player);

    const half = Math.ceil(everyone.length / 2);

    commit(
      draft!.map((team, index) => ({
        ...structuredClone(team),
        players: (index === 0 ? everyone.slice(0, half) : everyone.slice(half)).map((player) => ({
          ...player,
          teamId: team.id,
        })),
      })) as Draft,
    );
    setReshuffleOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardTitle>{tournament.name || 'Матч'}</CardTitle>

        <div className="mb-4">
          {canEdit ? (
            <label className="text-ink-muted flex items-center gap-2 text-xs">
              Дата игры
              <Input
                type="date"
                className="w-auto"
                value={toDateInputValue(playedAt)}
                onChange={(event) =>
                  commit(draft, fromDateInputValue(event.target.value, playedAt))
                }
              />
            </label>
          ) : (
            <span className="text-ink-muted text-sm">📅 {formatLongDate(playedAt)}</span>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {draft.map((team) => {
            const opponent = draft.find((other) => other.side !== team.side);
            const attributed = attributedGoals(team);
            const isWinning = team.score > (opponent?.score ?? 0);

            return (
              <div
                key={team.side}
                className={cn(
                  'flex flex-col gap-3 rounded-xl border p-3',
                  isWinning ? 'border-brand/40 bg-brand/5' : 'border-line bg-surface',
                )}
              >
                <div className="flex items-center gap-2">
                  {canEdit ? (
                    <Input
                      className="flex-1 font-semibold"
                      aria-label="Название команды"
                      value={team.name}
                      onChange={(event) =>
                        setDraft(patchTeam(team.side, (item) => ({ ...item, name: event.target.value })))
                      }
                      onBlur={() => save?.mutate(toPayload(draft))}
                    />
                  ) : (
                    <div className="flex-1 font-semibold">{team.name}</div>
                  )}

                  {canEdit ? (
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={attributed}
                      max={99}
                      aria-label="Счёт команды"
                      className="w-16 text-center text-lg font-bold tabular-nums"
                      value={String(team.score)}
                      onChange={(event) =>
                        setDraft(
                          patchTeam(team.side, (item) => ({
                            ...item,
                            score: Math.max(0, Number(event.target.value) || 0),
                          })),
                        )
                      }
                      onBlur={() => save?.mutate(toPayload(draft))}
                    />
                  ) : (
                    <div className={cn('text-2xl font-bold tabular-nums', isWinning && 'text-brand')}>
                      {team.score}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  {team.players.map((player) => (
                    <div
                      key={player.participantId}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <PlayerLink
                        playerId={players.get(player.participantId)}
                        name={player.name}
                        className="truncate"
                      />

                      {canEdit ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Минус гол"
                            disabled={!player.goals}
                            onClick={() => bumpGoal(team.side, player.participantId, -1)}
                          >
                            −
                          </Button>
                          <span className="w-5 text-center tabular-nums">{player.goals}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Плюс гол"
                            onClick={() => bumpGoal(team.side, player.participantId, 1)}
                          >
                            +
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Перевести в другую команду"
                            aria-label="Перевести в другую команду"
                            onClick={() => movePlayer(team.side, player.participantId)}
                          >
                            ⇄
                          </Button>
                        </div>
                      ) : (
                        <span className={player.goals ? 'text-brand' : 'text-ink-dim'}>
                          {player.goals ? `⚽ ${player.goals}` : '—'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <p
                  className={cn(
                    'text-xs',
                    attributed > team.score ? 'text-danger' : 'text-ink-dim',
                  )}
                >
                  {attributed > team.score
                    ? `⚠️ расписано ${pluralGoals(attributed)}, а забито ${team.score}`
                    : team.score === 0
                      ? '⚽ голов нет'
                      : attributed === team.score
                        ? `⚽ все ${pluralGoals(team.score)} расписаны`
                        : `⚽ расписано ${attributed} из ${team.score} · без автора: ${team.score - attributed}`}
                </p>
              </div>
            );
          })}
        </div>

        {scorers.length > 0 && (
          <div className="mt-4">
            <div className="text-ink-dim mb-2 text-xs font-semibold tracking-wider uppercase">
              Забили
            </div>
            <div className="flex flex-wrap gap-2">
              {scorers.map((scorer) => (
                <span
                  key={scorer.participantId}
                  className="border-line bg-surface text-ink inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                >
                  <PlayerLink
                    playerId={players.get(scorer.participantId)}
                    name={scorer.name}
                    className="font-bold"
                  />{' '}
                  ⚽{scorer.goals}
                  <span className="text-ink-dim">{scorer.team}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {save?.isError && <p className="text-danger mt-3 text-sm">⚠️ {errorMessage(save.error)}</p>}

        {canEdit && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="primary"
              disabled={actions?.finish.isPending}
              onClick={() => actions?.finish.mutate(undefined)}
            >
              🏁 Завершить матч
            </Button>
            <Button variant="secondary" onClick={() => setReshuffleOpen(true)}>
              🎲 Разделить заново
            </Button>
          </div>
        )}

        {actions?.finish.isError && (
          <p className="text-danger mt-3 text-sm">⚠️ {errorMessage(actions.finish.error)}</p>
        )}
      </Card>

      <ConfirmDialog
        open={reshuffleOpen}
        onClose={() => setReshuffleOpen(false)}
        onConfirm={reshuffle}
        title="🎲 Разделить заново?"
        description="Составы соберутся случайно. Авторы голов сбросятся — счёт команд останется."
        confirmLabel="Разделить"
      />
    </div>
  );
}
