/**
 * Путь к файлу из `public/`. На GitHub Pages сайт обычно живёт в подкаталоге
 * (`/имя-репозитория/`), и абсолютный `/icon.png` ушёл бы в корень домена —
 * мимо. `BASE_URL` подставляет Vite при сборке и всегда оканчивается слэшем.
 */
export function assetUrl(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\/+/, '');
}
