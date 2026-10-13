import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { StatsQuery } from '@/shared/api/types';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Field, Input, Select } from '@/shared/ui/Field';
import { ToggleGroup } from '@/shared/ui/Toggle';
import { DiffCell, Table, TableScroll, Td, Th } from '@/shared/ui/Table';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/StateView';
import { useSports } from '@/features/catalog/api';
import { useActiveOrg } from '@/features/organizations/activeOrg';
import { useLadderStats, useLeaderboard, useScorers } from './api';

type Tab = 'leaderboard' | 'scorers' | 'ladder';

const TABS = [
  { value: 'leaderboard' as const, label: '🏆 Общий зачёт' },
  { value: 'scorers' as const, label: '👟 Бомбардиры' },
  { value: 'ladder' as const, label: '🔝 Турник' },
];

export function StatsPage() {
  const [tab, setTab] = useState<Tab>('leaderboard');
  const [filters, setFilters] = useState<StatsQuery>({ pageSize: 100 });

  const { orgId } = useActiveOrg();
  const { data: sports } = useSports();

  // Организация — не пользовательский фильтр, а граница выборки: она приходит
  // из переключателя в шапке, а не из формы на этом экране.
  const scoped: StatsQuery = { ...filters, org: orgId };

  return (
    <Card>
      <CardTitle>История и статистика</CardTitle>

      <div className="mb-4 flex flex-col gap-3">
        <ToggleGroup options={TABS} value={tab} onChange={setTab} />

        <div className="flex flex-wrap items-end gap-3">
          {tab !== 'ladder' && (
            <Field label="Вид спорта" className="w-auto">
              <Select
                className="w-auto"
                value={filters.sport ?? ''}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, sport: event.target.value || undefined }))
                }
              >
                <option value="">Все</option>
                {(sports ?? []).map((sport) => (
                  <option key={sport.code} value={sport.code}>
                    {sport.icon} {sport.label}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Field label="С" className="w-auto">
            <Input
              type="date"
              className="w-auto"
              value={filters.from ?? ''}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, from: event.target.value || undefined }))
              }
            />
          </Field>

          <Field label="По" className="w-auto">
            <Input
              type="date"
              className="w-auto"
              value={filters.to ?? ''}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, to: event.target.value || undefined }))
              }
            />
          </Field>
        </div>
      </div>

      {tab === 'leaderboard' && <LeaderboardTable filters={scoped} />}
      {tab === 'scorers' && <ScorersTable filters={scoped} />}
      {tab === 'ladder' && <LadderTable filters={scoped} />}
    </Card>
  );
}

function LeaderboardTable({ filters }: { filters: StatsQuery }) {
  const { data, isPending, isError, error, refetch } = useLeaderboard(filters);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!data.items.length) return <EmptyState>За этот период ничего не сыграно.</EmptyState>;

  return (
    <TableScroll>
      <Table>
        <thead>
          <tr>
            <Th>Игрок</Th>
            <Th title="Трофеи">🏆</Th>
            <Th title="Турниров">Т</Th>
            <Th title="Матчей">М</Th>
            <Th title="Победы">✅</Th>
            <Th title="Ничьи">🤝</Th>
            <Th title="Поражения">❌</Th>
            <Th title="Забито">⚽</Th>
            <Th title="Пропущено">🚫</Th>
            <Th title="Разница">±</Th>
            <Th title="Очки" className="text-brand">
              О
            </Th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((row, index) => (
            <tr key={row.playerId}>
              <Td>
                <Link to={`/players/${row.playerId}`} className="hover:text-brand">
                  {index === 0 && row.trophies > 0 ? '👑 ' : ''}
                  {row.name}
                </Link>
              </Td>
              <Td className="text-gold font-semibold">{row.trophies}</Td>
              <Td>{row.tournaments}</Td>
              <Td>{row.played}</Td>
              <Td className="text-brand">{row.wins}</Td>
              <Td>{row.draws}</Td>
              <Td className="text-danger">{row.losses}</Td>
              <Td>{row.goalsFor}</Td>
              <Td>{row.goalsAgainst}</Td>
              <DiffCell value={row.diff} />
              <Td className="text-brand font-bold">{row.points}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableScroll>
  );
}

function ScorersTable({ filters }: { filters: StatsQuery }) {
  const { data, isPending, isError, error, refetch } = useScorers(filters);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!data.items.length) return <EmptyState>Голов пока никто не забил.</EmptyState>;

  return (
    <TableScroll>
      <Table>
        <thead>
          <tr>
            <Th>Игрок</Th>
            <Th title="Голы">⚽</Th>
            <Th title="Матчей">М</Th>
            <Th title="Голов за матч">⚽/М</Th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((row, index) => (
            <tr key={row.playerId}>
              <Td>
                <Link to={`/players/${row.playerId}`} className="hover:text-brand">
                  {index === 0 ? '👟 ' : ''}
                  {row.name}
                </Link>
              </Td>
              <Td className="text-brand font-bold">{row.goals}</Td>
              <Td>{row.matches}</Td>
              <Td>{row.matches ? (row.goals / row.matches).toFixed(2) : '—'}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableScroll>
  );
}

function LadderTable({ filters }: { filters: StatsQuery }) {
  const { data, isPending, isError, error, refetch } = useLadderStats(filters);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!data.items.length) return <EmptyState>Турник ещё никто не проходил.</EmptyState>;

  return (
    <TableScroll>
      <Table>
        <thead>
          <tr>
            <Th>Игрок</Th>
            <Th>Турниров</Th>
            <Th>🥇</Th>
            <Th>🥈</Th>
            <Th>🥉</Th>
            <Th title="Лучший раунд">Лучший</Th>
            <Th title="Всего подтягиваний">Всего</Th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((row, index) => (
            <tr key={row.playerId}>
              <Td>
                <Link to={`/players/${row.playerId}`} className="hover:text-brand">
                  {index === 0 && row.gold > 0 ? '👑 ' : ''}
                  {row.name}
                </Link>
              </Td>
              <Td>{row.tournaments}</Td>
              <Td className="text-gold font-semibold">{row.gold}</Td>
              <Td>{row.silver}</Td>
              <Td>{row.bronze}</Td>
              <Td>{row.bestRound}</Td>
              <Td>{row.totalReps}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableScroll>
  );
}
