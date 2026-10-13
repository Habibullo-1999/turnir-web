import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { NotFoundPage } from './NotFoundPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { VerifyEmailPage } from '@/features/auth/VerifyEmailPage';
import { RequireOrg } from '@/features/organizations/RequireOrg';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { OrganizationsPage } from '@/features/organizations/OrganizationsPage';
import { OrganizationPage } from '@/features/organizations/OrganizationPage';
import { InvitePage } from '@/features/organizations/InvitePage';
import { TournamentsPage } from '@/features/tournaments/pages/TournamentsPage';
import { SportPickerPage } from '@/features/tournaments/pages/SportPickerPage';
import { CreateTournamentPage } from '@/features/tournaments/pages/CreateTournamentPage';
import { TournamentDetailPage } from '@/features/tournaments/pages/TournamentDetailPage';
import { PublicTournamentPage } from '@/features/tournaments/pages/PublicTournamentPage';
import { StatsPage } from '@/features/stats/StatsPage';
import { PlayersPage } from '@/features/players/PlayersPage';
import { PlayerProfilePage } from '@/features/players/PlayerProfilePage';
import { UsersPage } from '@/features/users/UsersPage';

const routes = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/tournaments" replace /> },

      // Без входа: вход, регистрация, ссылка-табло, приглашение и письмо.
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'view/:slug', element: <PublicTournamentPage /> },
      { path: 'invite', element: <InvitePage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },

      {
        element: <RequireAuth />,
        children: [
          { path: 'profile', element: <ProfilePage /> },
          { path: 'organizations', element: <OrganizationsPage /> },
          { path: 'organizations/:id', element: <OrganizationPage /> },

          // Всё содержимое требует организации: вне её показывать нечего.
          {
            element: <RequireOrg />,
            children: [
              { path: 'tournaments', element: <TournamentsPage /> },
              { path: 'tournaments/:id', element: <TournamentDetailPage /> },
              { path: 'stats', element: <StatsPage /> },
              { path: 'players', element: <PlayersPage /> },
              { path: 'players/:id', element: <PlayerProfilePage /> },
              { path: 'create', element: <SportPickerPage /> },
              { path: 'create/:sportCode', element: <CreateTournamentPage /> },
            ],
          },
        ],
      },

      {
        element: <RequireAuth role="admin" />,
        children: [{ path: 'users', element: <UsersPage /> }],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

// BASE_URL подставляет Vite при сборке: '/' для своего домена и
// '/<репозиторий>/' для GitHub Pages. Без basename все ссылки уехали бы
// в корень домена, мимо подкаталога.
export const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
});
