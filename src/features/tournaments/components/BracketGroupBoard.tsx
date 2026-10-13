import { useState } from 'react';
import type { ParticipantClub, Sport, Tournament } from '@/shared/api/types';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { ConfirmDialog } from '@/shared/ui/Modal';
import { errorMessage } from '@/shared/api/http';
import { hasGroupStage } from '@/features/catalog/labels';
import {
  allGroupMatchesPlayed,
  hasBracketStarted,
  hasGroupsStarted,
} from '../model';
import type { TournamentActions } from '../queries';
import { BracketView } from './BracketView';
import { GroupStage } from './GroupStage';
import { PenaltyDialog, type PenaltyContext } from './PenaltyDialog';
import { BracketSwapPanel, GroupMovePanel } from './RearrangePanels';
import { ClubDrawPanel } from './ClubDrawPanel';

type ClearTarget = { kind: 'group' | 'bracket'; matchId: string; label: string };

export interface BracketGroupBoardProps {
  tournament: Tournament;
  sport: Sport;
  clubs: Map<string, ParticipantClub>;
  editable: boolean;
  actions?: TournamentActions;
}

/**
 * Движок сетки и групп. Всё продвижение победителей, счастливые проигравшие и
 * очистка нижних матчей делает бэкенд — здесь только ввод и отображение.
 */
export function BracketGroupBoard({
  tournament,
  sport,
  clubs,
  editable,
  actions,
}: BracketGroupBoardProps) {
  const [penalty, setPenalty] = useState<PenaltyContext | null>(null);
  const [clearTarget, setClearTarget] = useState<ClearTarget | null>(null);

  const showGroups = hasGroupStage(tournament.format) && (tournament.groups?.length ?? 0) > 0;
  const showBracket = (tournament.bracketRounds?.length ?? 0) > 0;
  const canAdvance =
    editable &&
    tournament.format === 'group+playoff' &&
    allGroupMatchesPlayed(tournament) &&
    !showBracket;

  const groupScore = actions?.setGroupScore;
  const bracketScore = actions?.setBracketScore;
  const advance = actions?.advanceToPlayoff;

  const lastError =
    groupScore?.error ?? bracketScore?.error ?? advance?.error ?? actions?.drawClubs.error;

  function openPenalty(matchId: string, score1: number, score2: number) {
    const match = tournament.bracketRounds
      ?.flatMap((round) => round.matches)
      .find((candidate) => candidate.id === matchId);
    if (!match) return;

    setPenalty({
      matchId,
      score1,
      score2,
      name1: match.p1Name ?? '—',
      name2: match.p2Name ?? '—',
    });
  }

  function confirmClear() {
    if (!clearTarget) return;
    const mutation = clearTarget.kind === 'group' ? groupScore : bracketScore;
    mutation?.mutate(
      { matchId: clearTarget.matchId, score: { clear: true } },
      { onSuccess: () => setClearTarget(null) },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {editable && sport.hasClub && actions && (
        <ClubDrawPanel pending={actions.drawClubs.isPending} onDraw={actions.drawClubs.mutate} />
      )}

      {showGroups && (
        <Card>
          <CardTitle
            action={
              canAdvance && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={advance?.isPending}
                  onClick={() => advance?.mutate(undefined)}
                >
                  {advance?.isPending ? 'Переходим…' : '⚡ К плей-офф'}
                </Button>
              )
            }
          >
            {tournament.format === 'league' ? 'Лига' : 'Групповой этап'}
          </CardTitle>

          {editable && actions && !hasGroupsStarted(tournament) && tournament.format !== 'league' && (
            <div className="mb-4">
              <GroupMovePanel
                tournament={tournament}
                pending={actions.moveParticipant.isPending}
                onMove={actions.moveParticipant.mutate}
              />
            </div>
          )}

          <GroupStage
            tournament={tournament}
            sport={sport}
            clubs={clubs}
            editable={editable}
            pending={groupScore?.isPending}
            onSubmitScore={(matchId, score1, score2) =>
              groupScore?.mutate({ matchId, score: { score1, score2 } })
            }
            onClearScore={(matchId, label) => setClearTarget({ kind: 'group', matchId, label })}
          />
        </Card>
      )}

      {showBracket && (
        <Card>
          <CardTitle>Плей-офф</CardTitle>

          {editable && actions && !hasBracketStarted(tournament) && (
            <div className="mb-4">
              <BracketSwapPanel
                tournament={tournament}
                pending={actions.swapBracketSlots.isPending}
                onSwap={actions.swapBracketSlots.mutate}
              />
            </div>
          )}

          <BracketView
            tournament={tournament}
            sport={sport}
            clubs={clubs}
            editable={editable}
            pending={bracketScore?.isPending}
            onSubmitScore={(matchId, score1, score2) =>
              bracketScore?.mutate({ matchId, score: { score1, score2 } })
            }
            onPenaltyNeeded={openPenalty}
            onClearScore={(matchId, label) => setClearTarget({ kind: 'bracket', matchId, label })}
          />
        </Card>
      )}

      {lastError && <p className="text-danger text-sm">⚠️ {errorMessage(lastError)}</p>}

      <PenaltyDialog
        context={penalty}
        pending={bracketScore?.isPending}
        onClose={() => setPenalty(null)}
        onConfirm={(pen1, pen2) => {
          if (!penalty) return;
          bracketScore?.mutate(
            {
              matchId: penalty.matchId,
              score: { score1: penalty.score1, score2: penalty.score2, pen1, pen2 },
            },
            { onSuccess: () => setPenalty(null) },
          );
        }}
      />

      <ConfirmDialog
        open={Boolean(clearTarget)}
        onClose={() => setClearTarget(null)}
        onConfirm={confirmClear}
        pending={groupScore?.isPending || bracketScore?.isPending}
        title="✏️ Изменить счёт?"
        description={
          clearTarget
            ? `Матч: ${clearTarget.label}. Счёт будет очищен — вместе со всеми матчами ниже по сетке, куда этот победитель уже прошёл.`
            : undefined
        }
      />
    </div>
  );
}
