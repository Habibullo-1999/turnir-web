import type { Sport, StandingsRow } from '@/shared/api/types';
import { DiffCell, Table, TableScroll, Td, Th } from '@/shared/ui/Table';
import { cn } from '@/shared/lib/cn';
import { PlayerLink } from './PlayerLink';

/**
 * Одна таблица на все виды спорта: колонка ничьих появляется только там, где
 * ничьи бывают, а подпись колонки голов берётся из справочника.
 */
export function StandingsTable({
  rows,
  sport,
  players,
  advanceCount = 0,
}: {
  rows: StandingsRow[];
  sport: Sport;
  /** participantId → playerId, чтобы имя вело в профиль. */
  players?: Map<string, string>;
  advanceCount?: number;
}) {
  if (!rows.length) return null;

  return (
    <TableScroll>
      <Table>
        <thead>
          <tr>
            <Th className="w-2/5">Игрок</Th>
            <Th title="Матчи">М</Th>
            <Th title="Победы">В</Th>
            {sport.hasDraws && <Th title="Ничьи">Н</Th>}
            <Th title="Поражения">П</Th>
            <Th title={sport.diffLabel}>{sport.diffLabel[0]}</Th>
            <Th title="Разница">±</Th>
            <Th title="Очки" className="text-brand">
              О
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.participantId}>
              <Td>
                <span className="text-ink-dim mr-1.5 tabular-nums">{index + 1}.</span>
                {advanceCount > 0 && index < advanceCount && (
                  <span
                    aria-label="Проходит дальше"
                    className="bg-brand mr-1.5 inline-block size-1.5 rounded-full align-middle"
                  />
                )}
                <PlayerLink playerId={players?.get(row.participantId)} name={row.name} />
              </Td>
              <Td>{row.played}</Td>
              <Td>{row.wins}</Td>
              {sport.hasDraws && <Td>{row.draws}</Td>}
              <Td>{row.losses}</Td>
              <Td>
                {row.goalsFor}:{row.goalsAgainst}
              </Td>
              <DiffCell value={row.diff} />
              <Td className={cn('text-brand font-bold')}>{row.points}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableScroll>
  );
}
