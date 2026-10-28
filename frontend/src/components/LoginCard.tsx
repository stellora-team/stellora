import { useEffect, useState, type FormEvent } from 'react';
import { loginUser, logoutUser } from '../services/authService';
import './LoginCard.css';
import googleIcon from '../assets/icons/google.svg';
import logoIcon from '../assets/icons/logo.svg';

interface LoginCardProps {
  onRegisterClick: () => void;
}

type AuthView =
  | 'login'
  | 'validation'
  | 'error'
  | 'offline'
  | 'recovery'
  | 'success';

interface FieldErrors {
  email?: string;
  password?: string;
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2"
        stroke="currentColor" strokeWidth="1.7" />
      <path d="m4 7 8 6 8-6" stroke="currentColor"
        strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2"
        stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5"
        stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7v6" stroke="currentColor"
        strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

function WifiOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 8.8a15.8 15.8 0 0 1 18.3-2.2"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" />
      <path d="M5 12a10.8 10.8 0 0 1 5.3-2.8"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" />
      <path d="M8.7 15.4a5.4 5.4 0 0 1 2.1-1"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" />
      <path d="m3 3 18 18" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 7v5h-5" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round"
        strokeLinejoin="round" />
      <path d="M4.8 9A7.5 7.5 0 0 1 18.7 7L20 12"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v-5h5" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round"
        strokeLinejoin="round" />
      <path d="M19.2 15A7.5 7.5 0 0 1 5.3 17L4 12"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7"
        stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m14 5-7 7 7 7M7 12h14"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LoginCard({ onRegisterClick }: LoginCardProps) {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' && !navigator.onLine,
  );

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
      setView((current) => current === 'offline' ? 'login' : current);
      setMessage('');
    }

    function handleOffline() {
      setIsOffline(true);
      setView('offline');
      setMessage('');
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  function clearFieldError(field: keyof FieldErrors) {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    if (view === 'validation') {
      setView('login');
    }

    setMessage('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setMessage('');
    const nextErrors: FieldErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Введіть коректну адресу електронної пошти, наприклад name@ukr.net.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Введіть коректну адресу електронної пошти, наприклад name@ukr.net.';
    }

    if (!password) {
      nextErrors.password = 'Введіть пароль. Це поле обов’язкове.';
    } 

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setView('validation');
      return;
    }

    setErrors({});

    if (isOffline || !navigator.onLine) {
      setIsOffline(true);
      setView('offline');
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser({
        email: email.trim(),
        password,
        rememberMe,
      });

      setAccountEmail(result.user.email);
      setView('success');
    } catch {
      setView('error');
    } finally {
      setLoading(false);
    }
  }

  function openRecovery() {
    if (loading) return;

    setErrors({});
    setMessage('');
    setRecoverySent(false);
    setView('recovery');
  }

  async function handleRecoverySubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (recoveryLoading) return;

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setMessage('Введіть адресу електронної пошти.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setMessage('Перевірте правильність адреси електронної пошти.');
      return;
    }

    setMessage('');
    setRecoveryLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setRecoverySent(true);
    } finally {
      setRecoveryLoading(false);
    }
  }

  function returnToLogin() {
    setView('login');
    setErrors({});
    setMessage('');
    setRecoverySent(false);
  }

  function handleLogout() {
    logoutUser();
    setAccountEmail('');
    setEmail('');
    setPassword('');
    setView('login');
    setMessage('');
  }

  function handleGoogleLogin() {
    if (loading || isOffline) return;
    setMessage('Вхід через Google поки не підключено.');
  }

  return (
    <main className="stellora-page">
      <header className="stellora-header">
        <a className="stellora-brand" href="#home" aria-label="Stellora">
          <img className="brand-star" src={logoIcon} alt="" />
          <span>Stellora</span>
        </a>

        <nav className="stellora-nav" aria-label="Головна навігація">
          <a href="#home">На головну</a>
          <a href="#features">Можливості</a>
          <a href="#about">Про нас</a>
        </nav>

        <button
          className="header-register-button"
          type="button"
          onClick={onRegisterClick}
          disabled={loading || recoveryLoading}
        >
          Зареєструватися
        </button>
      </header>

      <div className="stellora-content">
        <div className="stellora-intro" aria-hidden="true" />

        <section
          className={`login-panel ${
            view === 'validation' ? 'validation-panel' : ''
          } ${
            view === 'recovery' ? 'recovery-panel' : ''
          } ${
            view === 'success' ? 'success-panel' : ''
          }`}
          aria-labelledby="login-title"
        >
          {(view === 'login' ||
            view === 'validation' ||
            view === 'error' ||
            view === 'offline') && (
            <>
              <div className="login-heading">
                <img className="login-logo-star" src={logoIcon} alt="" />
                <h2 id="login-title">Увійти в аккаунт</h2>
                <p>Повернись до своїх цілей✦</p>
              </div>

              {view === 'error' && (
                <div className="auth-status-banner auth-status-error" role="alert">
                  <span className="auth-status-icon">
                    <AlertIcon />
                  </span>
                  <span className="auth-status-copy">
                    <strong>Неправильна пошта або пароль</strong>
                    <span>
                      Перевірте дані та спробуйте ще раз.
                    </span>
                  </span>
                </div>
              )}

              {view === 'offline' && (
                <div className="auth-status-banner auth-status-offline" role="alert">
                  <span className="auth-status-icon">
                    <WifiOffIcon />
                  </span>
                  <span className="auth-status-copy">
                    <strong>Немає інтернет-з'єднання</strong>
                    <span>
                      Перевірте WI-FI або мобільні дані й повторіть вхід. Введені дані збережено.
                    </span>
                  </span>
                </div>
              )}

              <form
                className={`login-form ${
                  view === 'validation' ? 'has-validation-errors' : ''
                }`}
                onSubmit={handleSubmit}
                noValidate
              >
                {view === 'validation' && (
                  <div className="validation-summary" role="alert">
                    <AlertIcon />
                    <span>Перевірте поля, позначені помилкою.</span>
                  </div>
                )}

                <div className="login-field-group">
                  <label
                    className={`login-field ${
                      errors.email ? 'field-invalid' : ''
                    } ${loading ? 'is-loading' : ''}`}
                  >
                    <span className="field-icon">
                      <MailIcon />
                    </span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="Email"
                      aria-label="Email"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        clearFieldError('email');
                      }}
                      disabled={loading}
                    />
                    {errors.email && (
                      <span className="field-alert-icon">
                        <AlertIcon />
                      </span>
                    )}
                  </label>
                  {errors.email && (
                    <p className="field-error-text" id="email-error">
                      <AlertIcon />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                <div className="login-field-group">
                  <label
                    className={`login-field ${
                      errors.password ? 'field-invalid' : ''
                    } ${loading ? 'is-loading' : ''}`}
                  >
                    <span className="field-icon">
                      <LockIcon />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      placeholder="Пароль"
                      aria-label="Пароль"
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password ? 'password-error' : undefined
                      }
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        clearFieldError('password');
                      }}
                      disabled={loading}
                    />
                    <button
                      className="password-toggle"
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      disabled={loading}
                      aria-label={
                        showPassword ? 'Приховати пароль' : 'Показати пароль'
                      }
                    >
                      {showPassword ? 'Приховати' : 'Показати'}
                    </button>
                    {errors.password && (
                      <span className="field-alert-icon">
                        <AlertIcon />
                      </span>
                    )}
                  </label>
                  {errors.password && (
                    <p className="field-error-text" id="password-error">
                      <AlertIcon />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                <div className="login-options">
                  <label className="remember-option">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      disabled={loading}
                    />
                    <span>Запам’ятати мене</span>
                  </label>

                  <button
                    className="text-action"
                    type="button"
                    onClick={openRecovery}
                    disabled={loading}
                  >
                    Забули пароль?
                  </button>
                </div>

                <button
                  className={`login-submit ${loading ? 'is-loading' : ''}`}
                  type="submit"
                  disabled={loading}
                >
                  {loading && (
                    <span className="login-spinner" aria-hidden="true" />
                  )}
                  <span>
                    {loading
                      ? 'Входимо'
                      : view === 'offline'
                        ? 'Спробувати знову'
                        : 'Увійти'}
                  </span>
                  {view === 'offline' && !loading && (
                    <span className="button-icon">
                      <RefreshIcon />
                    </span>
                  )}
                </button>

                {loading && (
                  <p className="login-loading-hint" role="status">
                    Перевіряємо дані входу, зачекайте...
                  </p>
                )}
              </form>

              {message && (
                <p className="form-message form-notice" role="status">
                  {message}
                </p>
              )}

              <div
                className={`other-login ${
                  loading || isOffline ? 'is-loading' : ''
                }`}
              >
                <span className="other-login-divider">або</span>

                <button
                  className="google-login"
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading || isOffline}
                >
                  <img src={googleIcon} alt="" />
                  <span>Продовжити з Google</span>
                </button>

                <p className="register-hint">
                  Ще немає акаунту?
                  <button
                    type="button"
                    onClick={onRegisterClick}
                    disabled={loading}
                  >
                    Зареєструватися
                  </button>
                </p>
              </div>
            </>
          )}

          {view === 'recovery' && (
            <div className="recovery-content">
              <div className="recovery-icon-badge">
                {recoverySent ? <CheckIcon /> : <MailIcon />}
              </div>

              <h2 id="login-title" className="recovery-title">
                {recoverySent ? 'Перевірте пошту' : 'Забули пароль?'}
              </h2>

              <p className="recovery-description">
                {recoverySent
                  ? 'Якщо акаунт із цією адресою існує, інструкція з відновлення буде надіслана на пошту.'
                  : 'Вкажіть пошту вашого аккаунту - ми надішлемо лист із посиланням для відновлення пароля.'}
              </p>

              {!recoverySent ? (
                <form
                  className="recovery-form"
                  onSubmit={handleRecoverySubmit}
                  noValidate
                >
                  <label className="recovery-label" htmlFor="recovery-email">
                    Електронна пошта
                  </label>

                  <div className="login-field recovery-input">
                    <span className="field-icon">
                      <MailIcon />
                    </span>
                    <input
                      id="recovery-email"
                      type="email"
                      autoComplete="email"
                      placeholder="Email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={recoveryLoading}
                    />
                  </div>

                  {message && (
                    <p className="field-error-text" role="alert">
                      <AlertIcon />
                      <span>{message}</span>
                    </p>
                  )}

                  <button
                    className="login-submit recovery-submit"
                    type="submit"
                    disabled={recoveryLoading}
                  >
                    {recoveryLoading && (
                      <span className="login-spinner" aria-hidden="true" />
                    )}
                    {recoveryLoading
                      ? 'Надсилаємо...'
                      : 'Надіслати лист'}
                  </button>
                </form>
              ) : (
                <button
                  className="login-submit recovery-submit"
                  type="button"
                  onClick={returnToLogin}
                >
                  Повернутися до входу
                </button>
              )}

              {!recoverySent && (
                <button
                  className="back-to-login"
                  type="button"
                  onClick={returnToLogin}
                  disabled={recoveryLoading}
                >
                  <ArrowLeftIcon />
                  <span>Повернутися до входу</span>
                </button>
              )}

              
              <div className="security-hint">
                <span>
                  Пам’ятайте пароль? Поверніться до входу.<br />
                  Ваші цілі вже чекають на вас✦
                </span>
              </div>
            </div>
          )}

          {view === 'success' && (
            <div className="success-content">
              <div className="success-icon-badge">
                <CheckIcon />
              </div>

              <h2 id="login-title" className="success-title">
                Ти серед своїх зірок!
              </h2>

              
              <p className="success-description">
                Вхід виконано успішно.<br />
                Tвоя подорож зі Stellora триває✦
              </p>

              <div className="active-account">
                <span className="active-account-icon">
                  <MailIcon />
                </span>
                <span className="active-account-details">
                  <span>Ви увійшли як</span>
                  <strong>{accountEmail}</strong>
                </span>
                <span className="active-account-check">
                  <CheckIcon />
                </span>
              </div>

              <button
                className="login-submit success-submit"
                type="button"
                onClick={() =>
                  setMessage('Сторінка профілю буде додана пізніше.')
                }
              >
                Продовжити
              </button>

              {message && (
                <p className="form-message form-notice" role="status">
                  {message}
                </p>
              )}

              <button
                className="back-to-login"
                type="button"
                onClick={handleLogout}
              >
                <ArrowLeftIcon />
                <span>На головну</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}