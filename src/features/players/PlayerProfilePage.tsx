import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/StateView';
import { Pagination } from '@/shared/ui/Pagination';
import { formatDate } from '@/shared/lib/date';
import { formatLabel } from '@/features/catalog/labels';
import { useSports } from '@/features/catalog/api';
import { Avatar } from './Avatar';
import { CareerCard } from './CareerCard';
import { usePlayerProfile, usePlayerTournaments } from './api';

const PAGE_SIZE = 10;

export function PlayerProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const [sport, setSport] = useState('');
  const [page, setPage] = useState(1);

  const { data: sports } = useSports();
  const { data: player, isPending, isError, error, refetch } = usePlayerProfile(id, sport);
  const { data: tournaments } = usePlayerTournaments(id);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} title="Профиль не открылся" />;

  // Список турниров приходит по всем видам спорта: фильтруем тем же выбором,
  // что и карьеру, иначе разделы противоречили бы друг другу.
  const loaded = tournaments?.items ?? [];
  const played = loaded.filter((tournament) => !sport || tournament.sport === sport);
  // Страница ограничена сверху: честно говорим, что показано не всё.
  const truncated = (tournaments?.total ?? 0) > loaded.length;

  // Листаем уже отфильтрованный список: фильтр по виду спорта применяется в
  // браузере, и серверная страница ничего не знала бы о нём.
  const totalPages = Math.max(1, Math.ceil(played.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = played.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center gap-4">
        <Avatar name={player.name} url={player.avatarUrl} size="lg" />
        <div className="min-w-0">
          <h1 className="text-ink text-xl font-bold">{player.name}</h1>
          {player.bio && <p className="text-ink-muted mt-1 text-sm">{player.bio}</p>}
        </div>
      </Card>

      {player.stats && sports && (
        <CareerCard
          stats={player.stats}
          sports={sports}
          sport={sport}
          onSportChange={(next) => {
            setSport(next);
            // Другой вид спорта — другой список, страница должна начаться заново.
            setPage(1);
          }}
        />
      )}

      <Card>
        <CardTitle>Турниры</CardTitle>

        {!played.length ? (
          <EmptyState>
            {sport ? 'В этом виде спорта пока не играл.' : 'Ещё нигде не играл.'}
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-2">
            {visible.map((tournament) => {
              const info = sports?.find((item) => item.code === tournament.sport);
              const won = tournament.winner === player.name;

              return (
                <Link
                  key={tournament.id}
                  to={`/tournaments/${tournament.id}`}
                  className="border-line bg-surface hover:border-brand-dim flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-ink truncate text-sm">
                      {tournament.name || 'Без названия'}
                    </div>
                    <div className="text-ink-dim truncate text-xs">
                      {info?.icon} {formatLabel(tournament.format) || info?.label} ·{' '}
                      {formatDate(tournament.finishedAt ?? tournament.createdAt)}
                    </div>
                  </div>

                  {won ? (
                    <Badge tone="gold">🏆 Победа</Badge>
                  ) : tournament.winner ? (
                    <span className="text-ink-dim shrink-0 text-xs">
                      победил {tournament.winner}
                    </span>
                  ) : (
                    <Badge tone="brand">▶ Идёт</Badge>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        <Pagination
          page={current}
          totalPages={totalPages}
          total={played.length}
          onChange={setPage}
        />

        {truncated && (
          <p className="text-ink-dim mt-3 text-center text-xs">
            Загружены последние {loaded.length} турниров из {tournaments?.total}.
          </p>
        )}
      </Card>
    </div>
  );
}
