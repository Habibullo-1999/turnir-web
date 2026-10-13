const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

/**
 * Приводит путь к файлу с бэкенда к адресу, который браузер действительно
 * сможет загрузить.
 *
 * `avatarUrl` приходит относительным (`/media/avatars/…`), то есть браузер
 * просит его у origin фронтенда. Пока фронт и API на одном домене — всё верно,
 * но в разработке фронт живёт на :5173 и отдаёт на такой путь `index.html`,
 * а при раздельном деплое — 404. Поэтому путь разрешается относительно того
 * origin, на котором стоит API.
 */
export function mediaUrl(path: string | undefined | null): string | undefined {
  if (!path) return undefined;
  // Абсолютную ссылку (внешний аватар) трогать нечего.
  if (/^https?:\/\//i.test(path)) return path;

  try {
    const apiOrigin = new URL(API_URL, window.location.origin).origin;
    return new URL(path, apiOrigin).toString();
  } catch {
    return path;
  }
}
