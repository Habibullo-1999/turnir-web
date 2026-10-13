import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { TournamentStatus } from '@/shared/api/types';
import { LinkButton } from '@/shared/ui/LinkButton';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Input, Select } from '@/shared/ui/Field';
import { Badge } from '@/shared/ui/Badge';
import { ToggleGroup } from '@/shared/ui/Toggle';
import { Pagination } from '@/shared/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/StateView';
import { formatDate } from '@/shared/lib/date';
import { formatLabel } from '@/features/catalog/labels';
import { useSports } from '@/features/catalog/api';
import { useActiveOrg } from '@/features/organizations/activeOrg';
import { useTournaments } from '../queries';

const STATUS_OPTIONS = [
  { value: 'active' as const, label: '▶ В процессе' },
  { value: 'finished' as const, label: '🏁 Завершённые' },
];

const PAGE_SIZE = 20;

export function TournamentsPage() {
  const [status, setStatus] = useState<TournamentStatus>('active');
  const [sport, setSport] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { orgId } = useActiveOrg();
  const { data: sports } = useSports();
  const { data, isPending, isError, error, refetch } = useTournaments({
    org: orgId,
    status,
    sport: sport || undefined,
    q: search.trim() || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  function resetTo(update: () => void) {
    update();
    setPage(1);
  }

  return (
    <Card>
      <CardTitle
        action={
          <LinkButton variant="primary" size="sm" to="/create">
            ＋ Создать
          </LinkButton>
        }
      >
        Турниры
      </CardTitle>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <ToggleGroup
          options={STATUS_OPTIONS}
          value={status}
          onChange={(next) => resetTo(() => setStatus(next))}
        />

        <Select
          className="w-auto"
          aria-label="Вид спорта"
          value={sport}
          onChange={(event) => resetTo(() => setSport(event.target.value))}
        >
          <option value="">Все виды спорта</option>
          {(sports ?? []).map((item) => (
            <option key={item.code} value={item.code}>
              {item.icon} {item.label}
            </option>
          ))}
        </Select>

        <Input
          className="w-auto flex-1"
          placeholder="🔍 Поиск по названию"
          value={search}
          onChange={(event) => resetTo(() => setSearch(event.target.value))}
        />
      </div>

      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data.items.length === 0 ? (
        <EmptyState
          action={
            <LinkButton variant="primary" to="/create">
              Создать первый
            </LinkButton>
          }
        >
          {status === 'active' ? 'Активных турниров нет.' : 'Завершённых турниров пока нет.'}
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-2">
          {data.items.map((tournament) => {
            const sportInfo = sports?.find((item) => item.code === tournament.sport);

            return (
              <Link
                key={tournament.id}
                to={`/tournaments/${tournament.id}`}
                className="border-line bg-surface hover:border-brand-dim flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-ink truncate text-sm font-medium">
                    {tournament.name || 'Без названия'}
                  </div>
                  <div className="text-ink-dim truncate text-xs">
                    {sportInfo?.icon} {formatLabel(tournament.format) || sportInfo?.label} ·{' '}
                    {tournament.participantCount} {sportInfo?.unitNoun ?? 'участников'} ·{' '}
                    {formatDate(tournament.finishedAt ?? tournament.createdAt)}
                  </div>
                </div>

                {tournament.status === 'finished' && tournament.winner ? (
                  <Badge tone="gold">🏆 {tournament.winner}</Badge>
                ) : tournament.status === 'finished' ? (
                  <Badge tone="neutral">🏁 Завершён</Badge>
                ) : (
                  <Badge tone="brand">▶ Идёт</Badge>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={data?.total} onChange={setPage} />
    </Card>
  );
}
