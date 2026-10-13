import { tokenStore } from './tokenStore';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

/** Конверт, в который бэкенд заворачивает и успех, и ошибку. */
interface Envelope<T> {
  code: number;
  message: string;
  data?: T;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  /** 400 — текст из `message` уже написан для показа пользователю. */
  get isValidation() {
    return this.status === 400;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  /** 409 — конфликт состояния: турнир завершён, перестановка после старта. */
  get isConflict() {
    return this.status === 409;
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /** FormData уходит как есть: границу multipart проставляет сам браузер. */
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  /** Не пытаться обновить токен и повторить запрос (сам /auth/refresh). */
  skipRefresh?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = `${BASE_URL}${path}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function parseEnvelope<T>(response: Response): Promise<Envelope<T>> {
  const text = await response.text();
  if (!text) return { code: response.status, message: response.statusText };
  try {
    return JSON.parse(text) as Envelope<T>;
  } catch {
    // Прокси или балансировщик может ответить не-JSON — покажем как есть.
    return { code: response.status, message: text.slice(0, 200) };
  }
}

/**
 * Параллельные запросы, одновременно получившие 401, должны обновить токен
 * один раз: рефреш-токен одноразовый, второй запрос получил бы уже отозванный.
 */
let refreshInFlight: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  refreshInFlight ??= rawRequest<{ accessToken: string }>('/auth/refresh', {
    method: 'POST',
    skipRefresh: true,
  })
    .then((pair) => {
      tokenStore.set(pair.accessToken);
      return true;
    })
    .catch(() => {
      tokenStore.set(null);
      return false;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

async function rawRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal } = options;
  const token = tokenStore.get();

  const isForm = body instanceof FormData;

  const response = await fetch(buildUrl(path, query), {
    method,
    signal,
    // Куку с refresh-токеном браузер обязан приложить сам.
    credentials: 'include',
    headers: {
      // Для FormData заголовок ставить нельзя: без boundary сервер не разберёт.
      ...(body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: isForm ? body : JSON.stringify(body) } : {}),
  });

  const envelope = await parseEnvelope<T>(response);

  if (!response.ok) {
    throw new ApiError(response.status, envelope.message || 'Что-то пошло не так.');
  }

  return envelope.data as T;
}

/** Основная точка входа: сама обновляет истёкший токен и повторяет запрос. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, options);
  } catch (error) {
    const expired = error instanceof ApiError && error.isUnauthorized;
    if (!expired || options.skipRefresh) throw error;

    const refreshed = await refreshAccessToken();
    if (!refreshed) throw error;

    return rawRequest<T>(path, options);
  }
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};

/** Текст ошибки для пользователя — из любого брошенного значения. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Неизвестная ошибка.';
}
