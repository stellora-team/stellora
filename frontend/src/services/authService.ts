export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthUser {
  email: string;
}

export interface LoginResult {
  user: AuthUser;
  token: string;
}

const TEST_USER = {
  email: 'user@stellora.test',
  password: '12345',
};

const SESSION_KEY = 'stellora_test_session';

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function loginUser(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  await wait(1800);

  if (
    credentials.email.trim().toLowerCase() !== TEST_USER.email ||
    credentials.password !== TEST_USER.password
  ) {
    throw new Error('Неправильна пошта або пароль.');
  }

  const result: LoginResult = {
    user: {
      email: TEST_USER.email,
    },
    token: 'stellora-test-session',
  };

  const session = JSON.stringify({
    user: result.user,
    token: result.token,
    rememberMe: credentials.rememberMe,
  });

  try {
    if (credentials.rememberMe) {
      localStorage.setItem(SESSION_KEY, session);
    } else {
      sessionStorage.setItem(SESSION_KEY, session);
    }
  } catch {
    return result;
  }

  return result;
}

export function getTestSession(): LoginResult | null {
  try {
    const session =
      localStorage.getItem(SESSION_KEY) ??
      sessionStorage.getItem(SESSION_KEY);

    if (!session) {
      return null;
    }

    return JSON.parse(session) as LoginResult;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    return;
  }
}
