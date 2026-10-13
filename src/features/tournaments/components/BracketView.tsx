import type { ParticipantClub, Sport, Tournament } from '@/shared/api/types';
import { BracketMatchCard } from './BracketMatchCard';
import { playerIdByParticipant } from '../model';

export interface BracketViewProps {
  tournament: Tournament;
  sport: Sport;
  clubs: Map<string, ParticipantClub>;
  editable: boolean;
  pending?: boolean;
  onSubmitScore?: (matchId: string, score1: number, score2: number) => void;
  onPenaltyNeeded?: (matchId: string, score1: number, score2: number) => void;
  onClearScore?: (matchId: string, label: string) => void;
}

export function BracketView({
  tournament,
  sport,
  clubs,
  editable,
  pending,
  onSubmitScore,
  onPenaltyNeeded,
  onClearScore,
}: BracketViewProps) {
  const rounds = tournament.bracketRounds ?? [];
  if (!rounds.length) return null;

  const players = playerIdByParticipant(tournament);

  const hasLucky = rounds.some((round) => round.matches.some((m) => m.p1Lucky || m.p2Lucky));

  return (
    <div className="flex flex-col gap-3">
      {hasLucky && (
        <p className="border-lucky/25 bg-lucky/5 text-lucky rounded-lg border px-3 py-2 text-xs">
          🍀 <strong>Lucky Loser</strong> — лучший проигравший предыдущего раунда по разнице{' '}
          {sport.diffGenitive}
        </p>
      )}

      <div className="overflow-x-auto pb-2">
        <div className="flex items-start gap-6">
          {rounds.map((round) => (
            <div key={round.id} className="flex shrink-0 flex-col gap-3">
              <div className="text-ink-dim text-center text-xs font-semibold tracking-wider uppercase">
                {round.label}
              </div>

              {/* Отступ удваивается с каждым раундом — так пары визуально
                  сходятся к финалу, как в бумажной сетке. */}
              <div
                className="flex flex-col"
                style={{ gap: `${Math.pow(2, round.roundIdx) * 0.75}rem` }}
              >
                {round.matches.map((match) => (
                  <BracketMatchCard
                    key={match.id}
                    match={match}
                    sport={sport}
                    clubs={clubs}
                    players={players}
                    editable={editable}
                    pending={pending}
                    onSubmit={(score1, score2) => onSubmitScore?.(match.id, score1, score2)}
                    onPenaltyNeeded={(score1, score2) =>
                      onPenaltyNeeded?.(match.id, score1, score2)
                    }
                    onClear={() =>
                      onClearScore?.(match.id, `${match.p1Name ?? '—'} — ${match.p2Name ?? '—'}`)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
