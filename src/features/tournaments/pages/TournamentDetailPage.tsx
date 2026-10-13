import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { ConfirmDialog } from '@/shared/ui/Modal';
import { ErrorState, LoadingState } from '@/shared/ui/StateView';
import { errorMessage } from '@/shared/api/http';
import { formatDate } from '@/shared/lib/date';
import { formatLabel } from '@/features/catalog/labels';
import { useSport } from '@/features/catalog/api';
import { useSession } from '@/features/auth/session';
import { TournamentBoard } from '../components/TournamentBoard';
import { WinnerBanner } from '../components/WinnerBanner';
import { ShareLink } from '../components/ShareLink';
import { useDeleteTournament, useTournament, useTournamentActions } from '../queries';

export function TournamentDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { user, canWrite } = useSession();
  const { data: tournament, isPending, isError, error, refetch } = useTournament(id);
  const { data: sport } = useSport(tournament?.sport);
  const actions = useTournamentActions(id);
  const remove = useDeleteTournament();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const previousStatus = useRef(tournament?.status);

  // Конфетти — только на момент самого завершения, а не при каждом открытии
  // уже закрытого турнира.
  useEffect(() => {
    if (previousStatus.current === 'active' && tournament?.status === 'finished') {
      setCelebrate(true);
    }
    previousStatus.current = tournament?.status;
  }, [tournament?.status]);

  if (isPending) return <LoadingState text="Загружаем турнир…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} title="Турнир не открылся" />;

  const isOwner = Boolean(user) && (user!.role === 'admin' || tournament.ownerId === user!.id);
  const editable = canWrite && isOwner && tournament.status === 'active';
  const isMatch = tournament.engine === 'team-match-log';

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-ink truncate text-xl font-bold">
            {tournament.name || 'Без названия'}
          </h1>
          <p className="text-ink-muted mt-1 text-xs">
            {sport?.icon} {formatLabel(tournament.format) || sport?.label} ·{' '}
            {tournament.participantCount} {sport?.unitNoun ?? 'участников'} ·{' '}
            {formatDate(tournament.finishedAt ?? tournament.createdAt)}
            {tournament.ownerName && ` · ${tournament.ownerName}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tournament.status === 'finished' ? (
            <Badge tone="gold">🏁 Завершён</Badge>
          ) : (
            <Badge tone="brand">▶ Идёт</Badge>
          )}

          {isOwner && tournament.status === 'active' && !isMatch && (
            <Button
              variant="secondary"
              size="sm"
              disabled={actions.finish.isPending}
              onClick={() => actions.finish.mutate(undefined)}
            >
              {actions.finish.isPending ? 'Завершаем…' : '🏁 Завершить'}
            </Button>
          )}

          {isOwner && tournament.status === 'finished' && (
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
              🗑 Удалить
            </Button>
          )}
        </div>
      </Card>

      {actions.finish.isError && (
        <p className="text-danger text-sm">⚠️ {errorMessage(actions.finish.error)}</p>
      )}

      {sport && (
        <TournamentBoard
          tournament={tournament}
          sport={sport}
          editable={editable}
          actions={isOwner ? actions : undefined}
        />
      )}

      {tournament.status === 'finished' && (
        <WinnerBanner
          tournament={tournament}
          celebrate={celebrate}
          reopenPending={actions.reopen.isPending}
          onReopen={
            isOwner
              ? () => {
                  setCelebrate(false);
                  actions.reopen.mutate(undefined);
                }
              : undefined
          }
        />
      )}

      {tournament.status === 'active' && <ShareLink slug={tournament.publicSlug} />}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() =>
          remove.mutate(id, { onSuccess: () => navigate('/tournaments', { replace: true }) })
        }
        pending={remove.isPending}
        variant="danger"
        confirmLabel="Удалить"
        title="🗑 Удалить турнир?"
        description="Действие необратимо: матчи, составы и результаты исчезнут вместе с ним."
      />
    </div>
  );
}
