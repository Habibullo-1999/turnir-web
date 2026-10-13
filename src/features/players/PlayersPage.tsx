import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Field';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/StateView';
import { canManageOrg } from '@/shared/api/types';
import { useActiveOrg } from '@/features/organizations/activeOrg';
import { Avatar } from './Avatar';
import { MergePlayersCard } from './MergePlayersCard';
import { usePlayers } from './api';

export function PlayersPage() {
  const [search, setSearch] = useState('');
  const { orgId, active } = useActiveOrg();
  const { data, isPending, isError, error, refetch } = usePlayers({
    org: orgId,
    q: search.trim() || undefined,
    pageSize: 100,
  });

  const canManage = canManageOrg(active?.role);

  return (
    <div className="flex flex-col gap-4">
    <Card>
      <CardTitle>Игроки</CardTitle>

      <Input
        className="mb-4"
        placeholder="🔍 Поиск по имени"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data.items.length ? (
        <EmptyState>Никого не нашли.</EmptyState>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((player) => (
            <Link
              key={player.id}
              to={`/players/${player.id}`}
              className="border-line bg-surface hover:border-brand-dim flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors"
            >
              <Avatar name={player.name} url={player.avatarUrl} />
              <div className="min-w-0">
                <div className="text-ink truncate text-sm font-medium">{player.name}</div>
                {player.stats && (
                  <div className="text-ink-dim text-xs">
                    🏆 {player.stats.trophies} · {player.stats.played} матчей
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>

    {canManage && data && data.items.length > 1 && <MergePlayersCard players={data.items} />}
    </div>
  );
}
