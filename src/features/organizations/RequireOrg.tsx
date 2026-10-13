import { Outlet } from 'react-router-dom';
import { Card, CardTitle } from '@/shared/ui/Card';
import { LinkButton } from '@/shared/ui/LinkButton';
import { LoadingState } from '@/shared/ui/StateView';
import { useActiveOrg } from './activeOrg';

/**
 * Турниры, игроки и статистика живут внутри организации. Без неё показывать
 * нечего — и вместо пустых экранов человек получает понятный следующий шаг.
 */
export function RequireOrg() {
  const { isPending, isEmpty } = useActiveOrg();

  if (isPending) return <LoadingState />;

  if (isEmpty) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center">
        <CardTitle>Пока пусто</CardTitle>
        <span className="text-4xl">🏢</span>
        <p className="text-ink-muted text-sm">
          Турниры и игроки принадлежат организации. Создайте свою — или откройте
          ссылку-приглашение, если вас уже позвали.
        </p>
        <LinkButton variant="primary" to="/organizations">
          Создать организацию
        </LinkButton>
      </Card>
    );
  }

  return <Outlet />;
}
