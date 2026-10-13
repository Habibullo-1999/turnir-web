import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Field';
import { useClubs } from '@/features/catalog/api';
import type { DrawClubsInput } from '@/shared/api/types';

/**
 * Жеребьёвка клубов целиком на бэкенде: он же знает, какой клуб был у игрока
 * в прошлый раз, и не выдаст его снова.
 */
export function ClubDrawPanel({
  pending,
  onDraw,
}: {
  pending?: boolean;
  onDraw: (input: DrawClubsInput) => void;
}) {
  const { data: clubs } = useClubs();
  const [league, setLeague] = useState('');
  const [avoidPrevious, setAvoidPrevious] = useState(true);

  const leagues = [...new Set((clubs ?? []).map((club) => club.league))].sort((a, b) =>
    a.localeCompare(b, 'ru'),
  );

  return (
    <div className="border-line bg-surface flex flex-wrap items-center gap-3 rounded-xl border p-3">
      <div className="text-ink-muted text-xs font-semibold">🎲 Раздать клубы</div>

      <Select
        className="w-auto"
        value={league}
        onChange={(event) => setLeague(event.target.value)}
        aria-label="Лига"
      >
        <option value="">Любая лига</option>
        {leagues.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </Select>

      <label className="text-ink-muted flex cursor-pointer items-center gap-2 text-xs">
        <input
          type="checkbox"
          className="accent-brand size-4"
          checked={avoidPrevious}
          onChange={(event) => setAvoidPrevious(event.target.checked)}
        />
        Не повторять клуб из прошлого турнира
      </label>

      <Button
        variant="secondary"
        disabled={pending}
        onClick={() => onDraw({ league: league || undefined, avoidPreviousTournament: avoidPrevious })}
      >
        {pending ? 'Раздаём…' : 'Раздать'}
      </Button>
    </div>
  );
}
