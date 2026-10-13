import type { GroupMatch, ParticipantClub, Sport } from '@/shared/api/types';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { ClubMark } from './ClubBadge';
import { PlayerLink } from './PlayerLink';
import { ScoreEntry } from './ScoreEntry';
import { drawPolicyFor } from '../model';

export interface GroupMatchCardProps {
  match: GroupMatch;
  sport: Sport;
  clubs: Map<string, ParticipantClub>;
  /** participantId → playerId. */
  players?: Map<string, string>;
  editable: boolean;
  pending?: boolean;
  onSubmit?: (score1: number, score2: number) => void;
  onClear?: () => void;
}

export function GroupMatchCard({
  match,
  sport,
  clubs,
  players,
  editable,
  pending,
  onSubmit,
  onClear,
}: GroupMatchCardProps) {
  const homeWon = match.played && (match.score1 ?? 0) > (match.score2 ?? 0);
  const awayWon = match.played && (match.score2 ?? 0) > (match.score1 ?? 0);

  return (
    <div
      className={cn(
        'rounded-xl border p-2.5 transition-colors',
        match.played ? 'border-line bg-surface' : 'border-brand/25 bg-brand/5',
      )}
    >
      <div className="flex items-center gap-2">
        <Side
          name={match.p1Name}
          playerId={players?.get(match.p1Id)}
          club={clubs.get(match.p1Name)}
          showClub={sport.hasClub}
          highlight={homeWon}
          align="left"
        />

        <div className="w-24 shrink-0 text-center">
          {match.played ? (
            <span className="text-ink text-base font-bold tabular-nums">
              {match.score1} : {match.score2}
            </span>
          ) : editable ? (
            <ScoreEntry
              compact
              pending={pending}
              drawPolicy={drawPolicyFor({ ...sport, isKnockout: false })}
              onSubmit={(score1, score2) => onSubmit?.(score1, score2)}
            />
          ) : (
            <span className="text-ink-dim text-sm">— : —</span>
          )}
        </div>

        <Side
          name={match.p2Name}
          playerId={players?.get(match.p2Id)}
          club={clubs.get(match.p2Name)}
          showClub={sport.hasClub}
          highlight={awayWon}
          align="right"
        />

        {match.played && editable && (
          <Button
            variant="ghost"
            size="sm"
            title="Изменить счёт"
            aria-label="Изменить счёт"
            disabled={pending}
            onClick={onClear}
          >
            ✏️
          </Button>
        )}
      </div>
    </div>
  );
}

function Side({
  name,
  playerId,
  club,
  showClub,
  highlight,
  align,
}: {
  name: string;
  playerId?: string;
  club?: ParticipantClub;
  showClub: boolean;
  highlight: boolean;
  align: 'left' | 'right';
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 items-center gap-1.5',
        align === 'right' ? 'justify-start' : 'justify-end',
      )}
    >
      {align === 'right' && showClub && <ClubMark club={club} />}
      <PlayerLink
        playerId={playerId}
        name={name}
        className={cn('truncate text-sm', highlight ? 'text-brand font-semibold' : 'text-ink')}
      />
      {align === 'left' && showClub && <ClubMark club={club} />}
    </div>
  );
}
