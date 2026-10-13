import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Field, Input } from '@/shared/ui/Field';
import { errorMessage } from '@/shared/api/http';
import { useChangePassword, useLogout } from '@/features/auth/session';

const MIN_PASSWORD = 8;

/**
 * Смена пароля отзывает **все** сессии, включая текущую. Поэтому после успеха
 * честно выходим и отправляем на вход, а не делаем вид, что ничего не было.
 */
export function PasswordCard() {
  const navigate = useNavigate();
  const change = useChangePassword();
  const logout = useLogout();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeat, setRepeat] = useState('');

  const tooShort = newPassword.length > 0 && newPassword.length < MIN_PASSWORD;
  const mismatch = repeat.length > 0 && repeat !== newPassword;
  const canSubmit = oldPassword && newPassword.length >= MIN_PASSWORD && repeat === newPassword;

  return (
    <Card>
      <CardTitle>Пароль</CardTitle>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          change.mutate(
            { oldPassword, newPassword },
            {
              onSuccess: () =>
                logout.mutate(undefined, {
                  onSettled: () => navigate('/login', { replace: true }),
                }),
            },
          );
        }}
      >
        <Field label="Текущий пароль">
          <Input
            type="password"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
          />
        </Field>

        <Field
          label="Новый пароль"
          error={tooShort ? `Минимум ${MIN_PASSWORD} символов.` : undefined}
        >
          <Input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </Field>

        <Field label="Ещё раз" error={mismatch ? 'Пароли не совпадают.' : undefined}>
          <Input
            type="password"
            autoComplete="new-password"
            value={repeat}
            onChange={(event) => setRepeat(event.target.value)}
          />
        </Field>

        {change.isError && <p className="text-danger text-sm">⚠️ {errorMessage(change.error)}</p>}

        <p className="text-ink-dim text-xs">
          Смена пароля закроет все сессии — на других устройствах тоже. Здесь придётся
          войти заново.
        </p>

        <Button type="submit" variant="primary" disabled={!canSubmit || change.isPending}>
          {change.isPending ? 'Меняем…' : 'Сменить пароль'}
        </Button>
      </form>
    </Card>
  );
}
