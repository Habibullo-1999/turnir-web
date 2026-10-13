import type { BracketMatch, ParticipantClub, Sport } from '@/shared/api/types';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import { ClubBadge } from './ClubBadge';
import { PlayerLink } from './PlayerLink';
import { ScoreEntry } from './ScoreEntry';
import { bracketSlots, drawPolicyFor, isBracketMatchDecided, isBracketMatchPlayable } from '../model';

export interface BracketMatchCardProps {
  match: BracketMatch;
  sport: Sport;
  clubs: Map<string, ParticipantClub>;
  /** participantId → playerId. */
  players?: Map<string, string>;
  editable: boolean;
  pending?: boolean;
  onSubmit?: (score1: number, score2: number) => void;
  onPenaltyNeeded?: (score1: number, score2: number) => void;
  onClear?: () => void;
}

export function BracketMatchCard({
  match,
  sport,
  clubs,
  players,
  editable,
  pending,
  onSubmit,
  onPenaltyNeeded,
  onClear,
}: BracketMatchCardProps) {
  const slots = bracketSlots(match);
  const slotPlayerIds = [players?.get(match.p1Id ?? ''), players?.get(match.p2Id ?? '')];
  const decided = isBracketMatchDecided(match);
  const playable = isBracketMatchPlayable(match);
  // Пара из двух пустышек «сыграна», но счёта у неё нет и быть не может.
  const showScores = decided && !match.winnerIsBye;

  return (
    <div
      className={cn(
        'w-52 rounded-xl border transition-colors',
        decided ? 'border-line bg-surface' : playable ? 'border-brand/30 bg-brand/5' : 'border-line/60 bg-card',
      )}
    >
      {slots.map((slot, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center gap-2 px-2.5 py-2',
            index === 0 && 'border-line/60 border-b',
            slot.isBye && 'opacity-40',
            slot.isWinner && 'bg-brand/10',
            decided && !slot.isWinner && !slot.isBye && 'opacity-60',
          )}
        >
          <div className="min-w-0 flex-1">
            {slot.isBye || !slot.name ? (
              <div className="text-ink truncate text-sm">—</div>
            ) : (
              <PlayerLink
                playerId={slotPlayerIds[index]}
                name={slot.name}
                className={cn('block truncate text-sm', slot.isWinner ? 'text-brand font-bold' : 'text-ink')}
              />
            )}
            {!slot.isBye && sport.hasClub && slot.name && <ClubBadge club={clubs.get(slot.name)} />}
          </div>

          {slot.isLucky && !decided && (
            <Badge tone="lucky" className="px-1.5 py-0 text-[0.6rem]">
              🍀 LL
            </Badge>
          )}

          {showScores && (
            <span
              className={cn(
                'text-sm tabular-nums',
                slot.isWinner ? 'text-brand font-bold' : 'text-ink-muted',
              )}
            >
              {slot.score ?? ''}
              {slot.pen != null && ` (${slot.pen})`}
            </span>
          )}
        </div>
      ))}

      {playable && editable && (
        <div className="border-line/60 border-t p-2">
          <ScoreEntry
            compact
            pending={pending}
            drawPolicy={drawPolicyFor({ ...sport, isKnockout: true })}
            onSubmit={(score1, score2) => onSubmit?.(score1, score2)}
            onPenaltyNeeded={(score1, score2) => onPenaltyNeeded?.(score1, score2)}
          />
        </div>
      )}

      {showScores && editable && (
        <div className="border-line/60 border-t p-1.5">
          <Button variant="ghost" size="sm" className="w-full" disabled={pending} onClick={onClear}>
            ✏️ Изменить счёт
          </Button>
        </div>
      )}
    </div>
  );
}
