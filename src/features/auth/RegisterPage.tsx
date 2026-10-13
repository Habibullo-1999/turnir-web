import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Field, Input } from '@/shared/ui/Field';
import { errorMessage } from '@/shared/api/http';
import { useRegister } from './session';

const MIN_PASSWORD = 8;

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const register = useRegister();

  // Регистрация по ссылке-приглашению должна вернуть обратно на приглашение.
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [form, setForm] = useState({ email: '', username: '', password: '', displayName: '' });

  const passwordTooShort = form.password.length > 0 && form.password.length < MIN_PASSWORD;
  const canSubmit =
    form.email && form.username.length >= 3 && form.password.length >= MIN_PASSWORD;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    register.mutate(form, { onSuccess: () => navigate(from, { replace: true }) });
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardTitle>Регистрация</CardTitle>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Field label="E-mail">
          <Input
            type="email"
            autoFocus
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </Field>

        <Field label="Логин" hint="От 3 до 32 символов">
          <Input
            autoComplete="username"
            value={form.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
          />
        </Field>

        <Field label="Отображаемое имя" hint="Необязательно">
          <Input
            value={form.displayName}
            onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
          />
        </Field>

        <Field
          label="Пароль"
          error={passwordTooShort ? `Минимум ${MIN_PASSWORD} символов.` : undefined}
        >
          <Input
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
        </Field>

        {register.isError && <p className="text-danger text-sm">⚠️ {errorMessage(register.error)}</p>}

        <Button type="submit" variant="primary" disabled={register.isPending || !canSubmit}>
          {register.isPending ? 'Создаём…' : 'Создать аккаунт'}
        </Button>
      </form>

      <p className="text-ink-muted mt-4 text-center text-xs">
        Уже есть аккаунт?{' '}
        <Link to="/login" state={location.state} className="text-brand hover:underline">
          Войти
        </Link>
      </p>
    </Card>
  );
}
