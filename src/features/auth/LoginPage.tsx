import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Field, Input } from '@/shared/ui/Field';
import { errorMessage } from '@/shared/api/http';
import { useLogin, useSession } from './session';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useSession();
  const login = useLogin();

  const [form, setForm] = useState({ login: '', password: '' });

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  if (!isLoading && isAuthenticated) return <Navigate to={from} replace />;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    login.mutate(form, { onSuccess: () => navigate(from, { replace: true }) });
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardTitle>Вход</CardTitle>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Field label="Логин или e-mail">
          <Input
            autoFocus
            autoComplete="username"
            value={form.login}
            onChange={(event) => setForm((prev) => ({ ...prev, login: event.target.value }))}
          />
        </Field>

        <Field label="Пароль">
          <Input
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
        </Field>

        {login.isError && <p className="text-danger text-sm">⚠️ {errorMessage(login.error)}</p>}

        <Button
          type="submit"
          variant="primary"
          disabled={login.isPending || !form.login || !form.password}
        >
          {login.isPending ? 'Входим…' : 'Войти'}
        </Button>
      </form>

      <p className="text-ink-muted mt-4 text-center text-xs">
        Нет аккаунта?{' '}
        <Link to="/register" state={location.state} className="text-brand hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </Card>
  );
}
