import googleIcon from '../assets/icons/google.svg';
import logoIcon from '../assets/icons/logo.svg';
import messageIcon from '../assets/icons/message.svg';
import userIcon from '../assets/icons/user.svg';
import lockIcon from '../assets/icons/lock.svg';
import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react';
import { registerUser } from '../services/authService';
import './RegisterCard.css';

type RegisterCardProps = {
  onLoginClick: () => void;
  onSetupProfileClick?: () => void;
  onSkipClick?: () => void;
};

type FormValues = {
  name: string;
  email: string;
  password: string;
  agreement: boolean;
};

type FieldName = 'name' | 'email' | 'password' | 'agreement';

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  agreement?: string;
};

type BannerStatus = 'server-error' | 'no-connection';

type Banner = {
  type: BannerStatus;
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_MIN_LENGTH = 2;
const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 128;

const FIELD_ORDER: FieldName[] = ['name', 'email', 'password', 'agreement'];

const MESSAGES = {
  nameTooShort: 'Вкажи ім’я — щонайменше 2 символи.',
  emailInvalid: 'Введи коректний Email, наприклад name@gmail.com.',
  passwordTooShort: 'Пароль має містити щонайменше 12 символів.',
  passwordTooLong: 'Пароль має містити не більше 128 символів.',
  agreementRequired: 'Ви повинні погодитися з умовами використання.',
  emailTakenBanner:
    'Акаунт із цією електронною адресою вже існує. Вкажіть інший email.',
  emailTakenField: 'Цей Email уже зареєстровано.',
  noConnection: 'Немає з’єднання. Перевірте інтернет і спробуйте ще раз.',
  genericError: 'Помилка реєстрації. Спробуйте пізніше.',
  googleNotReady: 'Вхід через Google ще не підключено.',
  loading: 'Створюємо твій акаунт. Зачекай, будь ласка...',
} as const;

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (values.name.trim().length < NAME_MIN_LENGTH) {
    errors.name = MESSAGES.nameTooShort;
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = MESSAGES.emailInvalid;
  }

  if (values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = MESSAGES.passwordTooShort;
  } else if (values.password.length > PASSWORD_MAX_LENGTH) {
    errors.password = MESSAGES.passwordTooLong;
  }

  if (!values.agreement) {
    errors.agreement = MESSAGES.agreementRequired;
  }

  return errors;
}

function isNetworkError(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true;
  }
  if (err instanceof TypeError) return true;
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === 'ERR_NETWORK'
  );
}

function isEmailTakenError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const { status, response } = err as {
    status?: unknown;
    response?: { status?: unknown };
  };
  return status === 409 || response?.status === 409;
}

type IconProps = { className?: string };

function AlertCircleIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.8v3.8" />
      <circle cx="8" cy="11.2" r="0.5" fill="currentColor" />
    </svg>
  );
}

function InfoCircleIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.4v3.8" />
      <circle cx="8" cy="4.9" r="0.5" fill="currentColor" />
    </svg>
  );
}

function WifiOffIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1.5 5.6a9.5 9.5 0 0 1 3.2-1.9M14.5 5.6a9.5 9.5 0 0 0-5-2.3" />
      <path d="M4 8.2a6 6 0 0 1 2-1.2M12 8.2a6 6 0 0 0-1.3-1" />
      <path d="M6.4 10.7a2.8 2.8 0 0 1 3.2 0" />
      <circle cx="8" cy="12.9" r="0.5" fill="currentColor" />
      <path d="M2 2l12 12" />
    </svg>
  );
}

function CheckIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

type StatusBannerProps = {
  variant: BannerStatus | 'loading';
  children: ReactNode;
};

function StatusBanner({ variant, children }: StatusBannerProps) {
  const icon =
    variant === 'loading' ? (
      <InfoCircleIcon className="register-banner-icon" />
    ) : variant === 'no-connection' ? (
      <WifiOffIcon className="register-banner-icon" />
    ) : (
      <AlertCircleIcon className="register-banner-icon" />
    );

  return (
    <div
      className={`register-banner register-banner--${variant}`}
      role={variant === 'loading' ? 'status' : 'alert'}
      aria-live={variant === 'loading' ? 'polite' : 'assertive'}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
}

export default function RegisterCard({
  onLoginClick,
  onSetupProfileClick,
  onSkipClick,
}: RegisterCardProps) {
  const [user, setUser] = useState<FormValues>({
    name: '',
    email: '',
    password: '',
    agreement: false,
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  function handleForm(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    const field = name as FieldName;

    setUser((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setFieldErrors((prev) =>
      prev[field] ? { ...prev, [field]: undefined } : prev,
    );

    if (banner) setBanner(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setBanner(null);

    const errors = validate(user);
    setFieldErrors(errors);

    const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
    if (firstInvalid) {
      const control = e.currentTarget.elements.namedItem(firstInvalid);
      if (control instanceof HTMLInputElement) control.focus();
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        displayName: user.name.trim(),
        email: user.email.trim(),
        password: user.password,
      });

      setRegistered(true);
    } catch (err) {
      if (isNetworkError(err)) {
        setBanner({ type: 'no-connection', message: MESSAGES.noConnection });
      } else if (isEmailTakenError(err)) {
        setBanner({
          type: 'server-error',
          message: MESSAGES.emailTakenBanner,
        });
        setFieldErrors({ email: MESSAGES.emailTakenField });
      } else {
        setBanner({
          type: 'server-error',
          message: err instanceof Error ? err.message : MESSAGES.genericError,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleClick() {
    setFieldErrors({});
    setBanner({ type: 'server-error', message: MESSAGES.googleNotReady });
  }

  if (registered) {
    return (
      <div className="register-panel register-success-panel">
        <img src={logoIcon} alt="" className="register-logo-star" />

        <div className="register-heading">
          <h3>Акаунт створено!</h3>
          <p>Твоя подорож серед зірок починається ✦</p>
        </div>

        <div className="register-success-badge">
          <CheckIcon />
        </div>

        <h4 className="register-success-welcome">
          Вітаємо у Stellora, {user.name.trim()}!
        </h4>

        <p className="register-success-note">
          Розкажи трохи про себе, щоб ми зробили твою подорож особливою.
        </p>

        <button
          type="button"
          onClick={onSetupProfileClick ?? onLoginClick}
          className="register-submit"
        >
          Налаштувати профіль
        </button>

        <button
          type="button"
          onClick={onSkipClick ?? onLoginClick}
          className="register-skip-link"
        >
          Пізніше, перейди до Stellora
        </button>
      </div>
    );
  }

  const submitLabel = loading
    ? 'Реєструємо...'
    : banner?.type === 'no-connection'
      ? 'Спробувати ще раз'
      : 'Зареєструватися';

  const hasError = (field: FieldName) => Boolean(fieldErrors[field]);
  const errorId = (field: FieldName) => `register-${field}-error`;
  const describedBy = (field: FieldName) =>
    hasError(field) ? errorId(field) : undefined;

  return (
    <div
      className={`register-panel${loading ? ' register-panel--loading' : ''}`}
      aria-busy={loading}
    >
      <img src={logoIcon} alt="" className="register-logo-star" />

      <div className="register-heading">
        <h3>Створи свій акаунт</h3>
        <p>Почни свою подорож серед зірок ✦</p>
      </div>

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        {loading ? (
          <StatusBanner variant="loading">{MESSAGES.loading}</StatusBanner>
        ) : (
          banner && (
            <StatusBanner variant={banner.type}>{banner.message}</StatusBanner>
          )
        )}

        <div className="register-field-group">
          <div
            className={`register-field${hasError('name') ? ' register-field--error' : ''}`}
          >
            <img src={userIcon} alt="" className="register-field-icon" />
            <input
              value={user.name}
              name="name"
              type="text"
              placeholder="Ім’я"
              autoComplete="name"
              required
              disabled={loading}
              aria-invalid={hasError('name')}
              aria-describedby={describedBy('name')}
              onChange={handleForm}
            />
            {hasError('name') && (
              <AlertCircleIcon className="register-field-status" />
            )}
          </div>
          {fieldErrors.name && (
            <p id={errorId('name')} className="register-field-hint">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div className="register-field-group">
          <div
            className={`register-field${hasError('email') ? ' register-field--error' : ''}`}
          >
            <img src={messageIcon} alt="" className="register-field-icon" />
            <input
              value={user.email}
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              required
              disabled={loading}
              aria-invalid={hasError('email')}
              aria-describedby={describedBy('email')}
              onChange={handleForm}
            />
            {hasError('email') && (
              <AlertCircleIcon className="register-field-status" />
            )}
          </div>
          {fieldErrors.email && (
            <p id={errorId('email')} className="register-field-hint">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="register-field-group">
          <div
            className={`register-field${hasError('password') ? ' register-field--error' : ''}`}
          >
            <img src={lockIcon} alt="" className="register-field-icon" />
            <input
              value={user.password}
              type="password"
              name="password"
              placeholder="Пароль"
              autoComplete="new-password"
              required
              disabled={loading}
              aria-invalid={hasError('password')}
              aria-describedby={describedBy('password')}
              onChange={handleForm}
            />
            {hasError('password') && (
              <AlertCircleIcon className="register-field-status" />
            )}
          </div>
          {fieldErrors.password && (
            <p id={errorId('password')} className="register-field-hint">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div className="register-field-group">
          <label
            className={`register-agreement${hasError('agreement') ? ' register-agreement--error' : ''}`}
          >
            <input
              type="checkbox"
              name="agreement"
              checked={user.agreement}
              disabled={loading}
              aria-invalid={hasError('agreement')}
              aria-describedby={describedBy('agreement')}
              onChange={handleForm}
            />
            <p>
              Я погоджуюсь з Умовами користування та Політикою конфіденційності
            </p>
          </label>
          {fieldErrors.agreement && (
            <p id={errorId('agreement')} className="register-field-hint">
              {fieldErrors.agreement}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`register-submit${loading ? ' register-submit--loading' : ''}`}
        >
          {loading && <span className="register-spinner" aria-hidden="true" />}
          <span>{submitLabel}</span>
        </button>
      </form>

      <div className="register-divider">або</div>

      <div>
        <button
          type="button"
          className="register-google"
          onClick={handleGoogleClick}
          disabled={loading}
        >
          <img src={googleIcon} alt="" />
          <span>Продовжити з Google</span>
        </button>

        <p className="register-footer">
          Вже маєш акаунт?
          <button
            type="button"
            onClick={onLoginClick}
            className="register-login-link"
            disabled={loading}
          >
            Увійти
          </button>
        </p>
      </div>
    </div>
  );
}
