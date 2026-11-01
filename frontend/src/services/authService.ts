export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegistrationDetails {
  email: string;
  displayName: string;
  password: string;
}

export interface AuthUser {
  email: string;
}

export interface LoginResult {
  user: AuthUser;
  token: string;
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAtUtc: string;
}

interface ApiErrorResponse {
  title?: string;
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  createdAtUtc: string;
  timeZone: string;
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'https://stellora-api.duckdns.org'
).replace(/\/+$/, '');
const SESSION_KEY = 'stellora_auth_session';

export class ApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function translateApiMessage(message: string): string {
  if (/field password.*minimum length of 12.*maximum length of 128/i.test(message)) {
    return 'Пароль має містити від 12 до 128 символів.';
  }
  if (/email.*not a valid e-?mail address/i.test(message)) {
    return 'Введіть коректну адресу електронної пошти, наприклад name@gmail.com.';
  }
  return message;
}

function getApiErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === 'string' && payload.trim()) {
    return translateApiMessage(payload);
  }

  if (payload && typeof payload === 'object') {
    const error = payload as ApiErrorResponse;
    const validationMessages = error.errors
      ? Object.entries(error.errors).flatMap(([field, messages]) =>
          messages.map((message) => {
            if (
              /password/i.test(field) &&
              /minimum length|maximum length|length/i.test(message)
            ) {
              return 'Пароль має містити від 12 до 128 символів.';
            }
            if (/email/i.test(field) && /already|exists|taken|duplicate/i.test(message)) {
              return 'Ця електронна пошта вже зареєстрована.';
            }
            if (
              (/email/i.test(field) && /valid|format|address/i.test(message)) ||
              /e-?mail address/i.test(message)
            ) {
              return 'Введіть коректну адресу електронної пошти, наприклад name@gmail.com.';
            }
            return message;
          }),
        )
      : [];

    return (
      validationMessages.join(' ') ||
      (error.detail ? translateApiMessage(error.detail) : '') ||
      (error.message ? translateApiMessage(error.message) : '') ||
      error.title ||
      `Помилка запиту до сервера (${status}).`
    );
  }

  return `Помилка запиту до сервера (${status}).`;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  session?: LoginResponse,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (session) {
    headers.set(
      'Authorization',
      `${session.tokenType} ${session.accessToken}`,
    );
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      'Не вдалося зв’язатися із сервером. Перевірте підключення та спробуйте ще раз.',
    );
  }

  const responseText = await response.text();
  let payload: unknown;

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = responseText;
    }
  }

  if (!response.ok) {
    throw new ApiError(getApiErrorMessage(payload, response.status), response.status);
  }

  return payload as T;
}

function clearStoredSession(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

function readStoredSession(): LoginResponse | null {
  const serializedSession =
    localStorage.getItem(SESSION_KEY) ??
    sessionStorage.getItem(SESSION_KEY);

  if (!serializedSession) {
    return null;
  }

  let session: LoginResponse;
  try {
    session = JSON.parse(serializedSession) as LoginResponse;
  } catch {
    clearStoredSession();
    return null;
  }

  if (
    !session?.accessToken ||
    !session.tokenType ||
    !session.expiresAtUtc ||
    !Number.isFinite(Date.parse(session.expiresAtUtc)) ||
    Date.parse(session.expiresAtUtc) <= Date.now()
  ) {
    clearStoredSession();
    return null;
  }

  return session;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const session = readStoredSession();
  if (!session) {
    return null;
  }

  try {
    return await request<UserProfile>('/api/users/me', {}, session);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearStoredSession();
      return null;
    }
    throw error;
  }
}

export async function authenticatedRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const session = readStoredSession();
  if (!session) {
    throw new Error('Сесія завершилася. Увійдіть знову.');
  }
  return request<T>(path, options, session);
}

function saveSession(session: LoginResponse, rememberMe: boolean): void {
  clearStoredSession();
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function registerUser(
  details: RegistrationDetails,
): Promise<void> {
  await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(details),
  });
}

export async function loginUser(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  const response = await request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  if (
    !response?.accessToken ||
    !response.tokenType ||
    !response.expiresAtUtc
  ) {
    throw new Error('Сервер повернув некоректну відповідь для входу.');
  }

  saveSession(response, credentials.rememberMe);

  return {
    user: { email: credentials.email },
    token: response.accessToken,
  };
}

export async function logoutUser(): Promise<void> {
  try {
    const session = readStoredSession();
    if (session) {
      await request<void>(
        '/api/auth/logout',
        { method: 'POST' },
        session,
      );
    }
  } finally {
    clearStoredSession();
  }
}
