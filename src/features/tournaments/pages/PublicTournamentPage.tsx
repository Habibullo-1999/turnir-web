import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { ErrorState, LoadingState } from '@/shared/ui/StateView';
import { formatLabel } from '@/features/catalog/labels';
import { useSport } from '@/features/catalog/api';
import { TournamentBoard } from '../components/TournamentBoard';
import { WinnerBanner } from '../components/WinnerBanner';
import { usePublicTournament } from '../queries';

const REFRESH_SECONDS = 30;

/** Публичная страница живёт по слагу и не требует ни токена, ни входа. */
export function PublicTournamentPage() {
  const { slug = '' } = useParams<{ slug: string }>();

  const { data: tournament, isPending, isError, error, refetch } = usePublicTournament(
    slug,
    REFRESH_SECONDS * 1000,
  );
  const { data: sport } = useSport(tournament?.sport);

  const [countdown, setCountdown] = useState(REFRESH_SECONDS);

  // Обратный отсчёт — только индикатор; перезапрос делает сам useQuery.
  useEffect(() => {
    setCountdown(REFRESH_SECONDS);
    const timer = setInterval(
      () => setCountdown((value) => (value <= 1 ? REFRESH_SECONDS : value - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [tournament]);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} title="Турнир не найден" />;

  return (
    <div className="flex flex-col gap-4">
      <div className="border-gold/20 bg-gold/5 text-gold -mx-4 flex items-center justify-center gap-2 border-b px-4 py-1.5 text-xs">
        <span className="animate-pulse-live bg-danger block size-1.5 rounded-full" />
        LIVE · режим просмотра — редактирование недоступно
      </div>

      <Card className="text-center">
        <h1 className="text-ink text-2xl font-extrabold">{tournament.name || 'Турнир'}</h1>
        <p className="text-ink-muted mt-1 text-sm">
          {sport?.icon} {formatLabel(tournament.format) || sport?.label} ·{' '}
          {tournament.participantCount} {sport?.unitNoun ?? 'участников'}
        </p>

        <div className="text-ink-dim mt-3 flex items-center justify-center gap-2 text-xs">
          Обновление через {countdown} сек
          <span className="bg-line h-0.5 w-24 overflow-hidden rounded-full">
            <span
              className="bg-brand block h-full transition-[width] duration-1000 ease-linear"
              style={{ width: `${(countdown / REFRESH_SECONDS) * 100}%` }}
            />
          </span>
        </div>
      </Card>

      {sport && <TournamentBoard tournament={tournament} sport={sport} editable={false} />}

      {tournament.status === 'finished' && <WinnerBanner tournament={tournament} />}
    </div>
  );
}
