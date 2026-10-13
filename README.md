# turnir-web

Фронтенд турнирного приложения поверх Go-бэкенда из `../turnir-backend`.
Замена `../turnir`, который ходил в Firebase напрямую.

## Стек

React 19 · TypeScript · Vite · Tailwind CSS v4 · TanStack Query v5 · React Router v7

## Запуск

```bash
npm install
npm run dev          # http://localhost:5173
```

Нужен поднятый бэкенд на `localhost:8080` (`cd ../turnir-backend && docker compose up`).
Dev-сервер проксирует `/api` туда сам — браузер видит один origin, поэтому
httpOnly-кука с refresh-токеном работает так же, как будет в проде, и CORS не
участвует. Переопределяется через `VITE_PROXY_TARGET`, см. `.env.example`.

Локальная учётка для разработки: `./scripts/dev-user.sh` (только для localhost).

```bash
npm run build        # tsc + vite build
npm run lint
npm run typecheck
```

## Главное решение

**Правил игры на клиенте нет.** Таблицы, продвижение по сетке, счастливые
проигравшие, определение чемпиона — всё считает бэкенд, и каждый пишущий запрос
возвращает турнир целиком. Клиент кладёт ответ в кеш TanStack Query и
перерисовывается:

```ts
function commitTournament(queryClient, tournament) {
  queryClient.setQueryData(tournamentKeys.detail(tournament.id), tournament);
  …
}
```

Второго запроса после сохранения нет, локальной копии состояния турнира нет,
разойтись с сервером нечему. В `../turnir` те же правила жили в
`src/utils/*.js` — теперь они только в `internal/*` бэкенда.

Исключение — чистое отображение: разбивка матчей группы по турам
(`scheduleTours` в `features/tournaments/model.ts`), потому что бэкенд хранит
матчи одним списком.

## Структура

```
src/
  app/            роутер, layout, QueryClient
  shared/
    api/          типы DTO (зеркало internal/structs), http-клиент, хранилище токена
    lib/          cn, склонения, даты
    ui/           Button, Card, Field, Modal, Table, Badge, Toggle…
  features/
    auth/         сессия, вход, регистрация, защита роутов
    catalog/      справочники видов спорта и клубов
    tournaments/  api + хуки + model (чистые хелперы) + components + pages
    stats/        сквозные таблицы
    players/      список и профиль
    users/        админка (роль admin)
```

Движок выбирается ровно в одном месте — `components/TournamentBoard.tsx`.
Та же доска рисуется владельцу и гостю на публичной странице, разница только в
`editable`.

## Авторизация

Access-токен живёт **только в памяти** (`shared/api/tokenStore.ts`) — из
localStorage его достал бы любой XSS. Долгая сессия держится на httpOnly
refresh-куке. При 401 http-слой один раз обновляет токен и повторяет запрос;
параллельные запросы ждут один и тот же рефреш, потому что refresh-токен
одноразовый.

## Роуты

| Путь | Доступ |
|---|---|
| `/tournaments`, `/tournaments/:id` | все |
| `/view/:slug` | все, без входа — публичная ссылка на турнир |
| `/stats`, `/players`, `/players/:id` | все |
| `/create`, `/create/:sportCode` | вошедшие |
| `/users` | admin |

## Если меняете API

OpenAPI-спеки у бэкенда нет, типы в `shared/api/types.ts` написаны руками по
`../turnir-backend/internal/structs` и `docs/05-api.md`. Меняя контракт,
правьте оба места — компилятор рассинхрон не поймает.
