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

function getApiErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const error = payload as ApiErrorResponse;
    const validationMessage = error.errors
      ? Object.values(error.errors).flat().join(' ')
      : '';

    return (
      validationMessage ||
      error.detail ||
      error.message ||
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
