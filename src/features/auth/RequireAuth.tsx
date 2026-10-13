import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '@/shared/ui/StateView';
import { Card } from '@/shared/ui/Card';
import { useSession } from './session';
import type { Role } from '@/shared/api/types';

/** Пускает дальше только вошедших, при необходимости — только нужную роль. */
export function RequireAuth({ role }: { role?: Role }) {
  const { user, isLoading } = useSession();
  const location = useLocation();

  if (isLoading) return <LoadingState text="Проверяем сессию…" />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (role && user.role !== role) {
    return (
      <Card className="text-ink-muted text-center">
        🚫 Раздел доступен только для роли «{role}».
      </Card>
    );
  }

  return <Outlet />;
}
