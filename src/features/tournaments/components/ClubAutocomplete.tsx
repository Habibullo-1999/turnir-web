import { useMemo, useState } from 'react';
import type { Club, ParticipantClub } from '@/shared/api/types';
import { Input } from '@/shared/ui/Field';
import { useClubs } from '@/features/catalog/api';
import { ClubMark } from './ClubBadge';

const MAX_SUGGESTIONS = 12;

function toParticipantClub(club: Club): ParticipantClub {
  return {
    clubId: club.id,
    club: club.name,
    league: club.league,
    flag: club.flag,
    icon: club.iconPath,
  };
}

export function ClubAutocomplete({
  value,
  onSelect,
  placeholder = '🔍 Клуб (необязательно)',
}: {
  value: ParticipantClub | null;
  onSelect: (club: ParticipantClub | null) => void;
  placeholder?: string;
}) {
  const { data: clubs } = useClubs();
  const [query, setQuery] = useState(value?.club ?? '');
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ru-RU');
    if (!needle || !clubs) return [];

    return clubs
      .filter(
        (club) =>
          club.name.toLocaleLowerCase('ru-RU').includes(needle) ||
          club.league.toLocaleLowerCase('ru-RU').includes(needle),
      )
      .slice(0, MAX_SUGGESTIONS);
  }, [clubs, query]);

  return (
    <div className="relative min-w-0 flex-1 basis-0">
      <Input
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          if (value) onSelect(null);
          setOpen(true);
        }}
        onFocus={() => query && setOpen(true)}
        // Закрываем после клика, а не до него: onMouseDown в пункте успевает сработать.
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />

      {open && suggestions.length > 0 && (
        <ul className="border-line bg-card absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border shadow-xl">
          {suggestions.map((club) => (
            <li key={club.id}>
              <button
                type="button"
                className="hover:bg-surface flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                onMouseDown={(event) => {
                  event.preventDefault();
                  setQuery(club.name);
                  onSelect(toParticipantClub(club));
                  setOpen(false);
                }}
              >
                <ClubMark club={toParticipantClub(club)} />
                <span className="flex-1 truncate">{club.name}</span>
                <span className="text-ink-dim text-xs">{club.league}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
