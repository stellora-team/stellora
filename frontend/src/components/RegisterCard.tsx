import googleIcon from '../assets/icons/google.svg';
import logoIcon from '../assets/icons/logo.svg';
import messageIcon from '../assets/icons/message.svg';
import userIcon from '../assets/icons/user.svg';
import lockIcon from '../assets/icons/lock.svg';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import './RegisterCard.css';

type RegisterCardProps = {
  onLoginClick: () => void;
};

export default function RegisterCard({ onLoginClick }: RegisterCardProps) {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    agreement: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    if (!user.name || !user.email || !user.password) {
      setError('Заповніть усі поля');
      return;
    }

    if (!user.agreement) {
      setError('Ви повинні погодитися з умовами використання');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('https://', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: user.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Помилка реєстрації');
      }

      console.log('Успішна реєстрація:', data);
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

      <form className="register-form" onSubmit={handleSubmit}>
        {error && (
          <div className="register-error">
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
            onChange={handleForm}
          />
        </div>

        <label className="register-agreement">
          <input
            type="checkbox"
            name="agreement"
            checked={user.agreement}
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
          >
            Увійти
          </button>
        </p>
      </div>
    </div>
  );
}
