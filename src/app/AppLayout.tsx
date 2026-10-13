import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { LinkButton } from '@/shared/ui/LinkButton';
import { cn } from '@/shared/lib/cn';
import { useLogout, useSession } from '@/features/auth/session';
import { EmailVerificationBanner } from '@/features/auth/EmailVerificationBanner';
import { OrgSwitcher } from '@/features/organizations/OrgSwitcher';

const NAV = [
  { to: '/tournaments', label: '🏆 Турниры' },
  { to: '/stats', label: '📊 Статистика' },
  { to: '/players', label: '👥 Игроки' },
  { to: '/organizations', label: '🏢 Организации' },
];

export function AppLayout() {
  const { user, isAdmin } = useSession();
  const logout = useLogout();

  const links = isAdmin ? [...NAV, { to: '/users', label: '⚙️ Пользователи' }] : NAV;

  return (
    <div className="min-h-dvh">
      <header className="border-line bg-surface/80 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <NavLink to="/" className="text-brand mr-auto text-lg font-bold">
            🏆 Турниры
          </NavLink>

          {user && (
            <nav className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors',
                      isActive
                        ? 'text-brand bg-brand/10'
                        : 'text-ink-muted hover:text-ink hover:bg-white/5',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <OrgSwitcher />
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  cn(
                    'hidden text-xs whitespace-nowrap transition-colors sm:inline',
                    isActive ? 'text-brand' : 'text-ink-dim hover:text-ink',
                  )
                }
              >
                {user.displayName || user.username}
              </NavLink>
              <Button
                variant="ghost"
                size="sm"
                disabled={logout.isPending}
                onClick={() => logout.mutate()}
              >
                Выйти
              </Button>
            </div>
          ) : (
            <LinkButton variant="secondary" size="sm" to="/login">
              Войти
            </LinkButton>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <EmailVerificationBanner />
        <Outlet />
      </main>
    </div>
  );
}
