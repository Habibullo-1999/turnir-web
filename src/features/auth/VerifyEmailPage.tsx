import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardTitle } from '@/shared/ui/Card';
import { LinkButton } from '@/shared/ui/LinkButton';
import { Spinner } from '@/shared/ui/Spinner';
import { errorMessage } from '@/shared/api/http';
import { api } from '@/shared/api/http';
import type { User } from '@/shared/api/types';

/** Страница, на которую ведёт ссылка из письма. Токен одноразовый. */
export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const queryClient = useQueryClient();

  const confirm = useMutation({
    mutationFn: (value: string) => api.post<User>('/auth/verify-email', { token: value }),
    onSuccess: (user) => queryClient.setQueryData(['session'], user),
  });

  // React 18+ в dev монтирует дважды; токен одноразовый, поэтому второй запрос
  // получил бы ошибку «недействительно» поверх успеха.
  const sent = useRef(false);
  useEffect(() => {
    if (token && !sent.current) {
      sent.current = true;
      confirm.mutate(token);
    }
  }, [token, confirm]);

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col items-center gap-3 text-center">
      <CardTitle>Подтверждение почты</CardTitle>

      {!token && <p className="text-danger text-sm">В ссылке нет токена.</p>}

      {confirm.isPending && (
        <div className="text-ink-muted flex items-center gap-2 py-4 text-sm">
          <Spinner /> Проверяем ссылку…
        </div>
      )}

      {confirm.isSuccess && (
        <>
          <span className="text-4xl">✅</span>
          <p className="text-ink text-sm">Почта подтверждена.</p>
        </>
      )}

      {confirm.isError && (
        <>
          <span className="text-4xl">⚠️</span>
          <p className="text-danger text-sm">{errorMessage(confirm.error)}</p>
          <p className="text-ink-dim text-xs">
            Ссылка живёт сутки и срабатывает один раз. Запросите новую в профиле.
          </p>
        </>
      )}

      <LinkButton variant="primary" to="/" className="mt-2">
        На главную
      </LinkButton>
    </Card>
  );
}
