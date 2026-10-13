/**
 * Access-токен живёт только в памяти: в localStorage его положить нельзя —
 * оттуда его достанет любой XSS. Долговременная сессия держится на httpOnly
 * refresh-cookie, которую ставит бэкенд.
 */
type Listener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<Listener>();

export const tokenStore = {
  get: () => accessToken,

  set(token: string | null) {
    if (accessToken === token) return;
    accessToken = token;
    listeners.forEach((listener) => listener(token));
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => void listeners.delete(listener);
  },
};
