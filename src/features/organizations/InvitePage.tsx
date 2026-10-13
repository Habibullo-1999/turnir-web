import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { LinkButton } from '@/shared/ui/LinkButton';
import { ErrorState, LoadingState } from '@/shared/ui/StateView';
import { errorMessage } from '@/shared/api/http';
import { useSession } from '@/features/auth/session';
import { ORG_ROLE_LABELS } from './labels';
import { useAcceptInvite, useInvitePreview } from './queries';

/**
 * Страница по ссылке-приглашению. Предпросмотр открыт всем — иначе человек не
 * поймёт, куда его зовут, и не решится регистрироваться. Принять можно только
 * войдя: приглашение привязывает организацию к конкретной учётке.
 */
export function InvitePage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();

  const { user, isLoading } = useSession();
  const { data: preview, isPending, isError, error, refetch } = useInvitePreview(token);
  const accept = useAcceptInvite();

  if (!token) return <Navigate to="/" replace />;
  if (isPending || isLoading) return <LoadingState text="Проверяем приглашение…" />;
  if (isError) {
    return <ErrorState error={error} onRetry={refetch} title="Приглашение недействительно" />;
  }

  const unusable = preview.expired || preview.accepted;

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col items-center gap-3 text-center">
      <CardTitle>Приглашение</CardTitle>

      <span className="text-4xl">🏢</span>
      <div className="text-ink text-xl font-bold">{preview.orgName}</div>
      <p className="text-ink-muted text-sm">
        Вас зовут как «{ORG_ROLE_LABELS[preview.role].toLowerCase()}»
        {preview.playerName && (
          <>
            {' '}на профиль <strong className="text-ink">{preview.playerName}</strong> — вся его
            прошлая статистика станет вашей
          </>
        )}
        .
      </p>

      {preview.accepted && <p className="text-danger text-sm">Это приглашение уже использовано.</p>}
      {preview.expired && !preview.accepted && (
        <p className="text-danger text-sm">Срок приглашения истёк — попросите новую ссылку.</p>
      )}

      {accept.isError && <p className="text-danger text-sm">⚠️ {errorMessage(accept.error)}</p>}

      {!unusable &&
        (user ? (
          <Button
            variant="primary"
            size="lg"
            className="mt-2 w-full"
            disabled={accept.isPending}
            onClick={() =>
              accept.mutate(token, {
                onSuccess: (org) => navigate(`/organizations/${org.id}`, { replace: true }),
              })
            }
          >
            {accept.isPending ? 'Принимаем…' : 'Принять приглашение'}
          </Button>
        ) : (
          <div className="mt-2 flex w-full flex-col gap-2">
            <p className="text-ink-dim text-xs">Чтобы принять, войдите или заведите аккаунт.</p>
            <LinkButton
              variant="primary"
              to="/register"
              state={{ from: `/invite?token=${encodeURIComponent(token)}` }}
            >
              Зарегистрироваться
            </LinkButton>
            <LinkButton
              variant="secondary"
              to="/login"
              state={{ from: `/invite?token=${encodeURIComponent(token)}` }}
            >
              У меня уже есть аккаунт
            </LinkButton>
          </div>
        ))}

      <Link to="/" className="text-ink-dim hover:text-ink mt-2 text-xs">
        Не сейчас
      </Link>
    </Card>
  );
}
