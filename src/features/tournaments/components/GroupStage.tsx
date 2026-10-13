import type { ParticipantClub, Sport, Tournament } from '@/shared/api/types';
import { advanceCount, groupStandings, playerIdByParticipant, scheduleTours } from '../model';
import { GroupMatchCard } from './GroupMatchCard';
import { StandingsTable } from './StandingsTable';

export interface GroupStageProps {
  tournament: Tournament;
  sport: Sport;
  clubs: Map<string, ParticipantClub>;
  editable: boolean;
  pending?: boolean;
  onSubmitScore?: (matchId: string, score1: number, score2: number) => void;
  onClearScore?: (matchId: string, label: string) => void;
}

/** Группы и лига рисуются одинаково — отличается только заголовок группы. */
export function GroupStage({
  tournament,
  sport,
  clubs,
  editable,
  pending,
  onSubmitScore,
  onClearScore,
}: GroupStageProps) {
  const isLeague = tournament.format === 'league';
  const advancing = advanceCount(tournament);
  const players = playerIdByParticipant(tournament);

  return (
    <div className="flex flex-col gap-8">
      {(tournament.groups ?? []).map((group) => (
        <section key={group.id} className="flex flex-col gap-3">
          <h3 className="text-ink text-sm font-bold">{isLeague ? '🏅 Лига' : group.name}</h3>

          <StandingsTable
            rows={groupStandings(tournament, group)}
            sport={sport}
            players={players}
            advanceCount={advancing}
          />

          <div className="flex flex-col gap-4">
            {scheduleTours(group).map((tour, tourIndex) => (
              <div key={tourIndex} className="flex flex-col gap-2">
                <div className="text-ink-dim text-xs font-semibold tracking-wider uppercase">
                  Тур {tourIndex + 1}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {tour.map((match) => (
                    <GroupMatchCard
                      key={match.id}
                      match={match}
                      sport={sport}
                      clubs={clubs}
                      players={players}
                      editable={editable}
                      pending={pending}
                      onSubmit={(score1, score2) => onSubmitScore?.(match.id, score1, score2)}
                      onClear={() => onClearScore?.(match.id, `${match.p1Name} — ${match.p2Name}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
