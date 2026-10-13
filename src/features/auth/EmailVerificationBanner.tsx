import { useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api/http';
import { errorMessage } from '@/shared/api/http';
import type { VerificationLink } from '@/shared/api/types';
import { Button } from '@/shared/ui/Button';
import { useSession } from './session';

/**
 * Подтверждение почты ничего не блокирует — это напоминание, а не стена.
 * Когда отправка писем выключена, бэкенд возвращает ссылку прямо в ответе;
 * показываем её, иначе на машине разработчика подтвердить адрес нечем.
 */
export function EmailVerificationBanner() {
  const { user } = useSession();
  const resend = useMutation({
    mutationFn: () => api.post<VerificationLink>('/auth/verify-email/resend'),
  });

  if (!user || user.emailVerifiedAt) return null;

  const link = resend.data?.url;

  return (
    <div className="border-gold/25 bg-gold/5 mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5">
      <span className="text-gold text-sm">
        ✉️ Почта <strong>{user.email}</strong> не подтверждена.
      </span>

      {resend.isSuccess && resend.data.sent && (
        <span className="text-brand text-xs">Письмо отправлено — проверьте ящик.</span>
      )}

      {link && (
        <a href={link} className="text-brand text-xs underline">
          Открыть ссылку подтверждения
        </a>
      )}

      {resend.isError && <span className="text-danger text-xs">{errorMessage(resend.error)}</span>}

      <Button
        variant="secondary"
        size="sm"
        className="ml-auto"
        disabled={resend.isPending}
        onClick={() => resend.mutate()}
      >
        {resend.isPending ? 'Отправляем…' : 'Отправить письмо'}
      </Button>
    </div>
  );
}
