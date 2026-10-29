import googleIcon from '../assets/icons/google.svg';
import logoIcon from '../assets/icons/logo.svg';
import messageIcon from '../assets/icons/message.svg';
import userIcon from '../assets/icons/user.svg';
import lockIcon from '../assets/icons/lock.svg';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { registerUser } from '../services/authService';
import './RegisterCard.css';

type RegisterCardProps = {
  onLoginClick: () => void;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function RegisterCard({ onLoginClick }: RegisterCardProps) {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    agreement: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  function handleForm(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!user.name.trim()) {
      setError('Введіть своє ім’я.');
      return;
    }

    if (!user.email.trim()) {
      setError('Введіть адресу електронної пошти.');
      return;
    }

    if (!EMAIL_PATTERN.test(user.email.trim())) {
      setError('Введіть коректну адресу електронної пошти, наприклад name@gmail.com.');
      return;
    }

    if (user.password.length < 12 || user.password.length > 128) {
      setError('Пароль має містити від 12 до 128 символів.');
      return;
    }

    if (!user.agreement) {
      setError('Ви повинні погодитися з умовами використання');
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
      setError(
        err instanceof Error
          ? err.message
          : 'Помилка реєстрації. Спробуйте пізніше.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <div className="register-panel register-success-panel">
        <img src={logoIcon} alt="" className="register-logo-star" />
        <div className="register-heading">
          <h3>Акаунт створено!</h3>
          <p>Тепер увійди, щоб продовжити свою подорож серед зірок ✦</p>
        </div>
        <button
          type="button"
          onClick={onLoginClick}
          className="register-submit"
        >
          Перейти до входу
        </button>
      </div>
    );
  }

  return (
    <div className="register-panel">
      <img
        src={logoIcon}
        alt=""
        className="register-logo-star"
      />

      <div className="register-heading">
        <h3>Створи свій акаунт</h3>
        <p>Почни свою подорож серед зірок ✦</p>
      </div>

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="register-error" role="alert">
            {error}
          </div>
        )}

        <div className="register-field">
          <img
            src={userIcon}
            alt="user"
            className="register-field-icon"
          />
          <input
            value={user.name}
            name="name"
            type="text"
            placeholder="Ім’я"
            autoComplete="name"
            required
            disabled={loading}
            onChange={handleForm}
          />
        </div>

        <div className="register-field">
          <img
            src={messageIcon}
            alt="message"
            className="register-field-icon"
          />
          <input
            value={user.email}
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            disabled={loading}
            onChange={handleForm}
          />
        </div>

        <div className="register-field">
          <img
            src={lockIcon}
            alt="lock"
            className="register-field-icon"
          />
          <input
            value={user.password}
            type="password"
            name="password"
            placeholder="Пароль"
            autoComplete="new-password"
            required
            disabled={loading}
            onChange={handleForm}
          />
        </div>

        <label className="register-agreement">
          <input
            type="checkbox"
            name="agreement"
            checked={user.agreement}
            disabled={loading}
            onChange={handleForm}
          />
          <p>
            Я погоджуюсь з Умовами користування та Політикою
            конфіденційності
          </p>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="register-submit"
        >
          {loading ? 'Реєстрація...' : 'Зареєструватися'}
        </button>
      </form>

      <div className="register-divider">
        або
      </div>

      <div>
        <button
          type="button"
          className="register-google"
          onClick={() => setError('Вхід через Google ще не підключено.')}
          disabled={loading}
        >
          <img
            src={googleIcon}
            alt="Google"
          />
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
