
import { useEffect, useState } from 'react';
import LoginCard from './components/LoginCard';
import RegisterCard from './components/RegisterCard';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import { getCurrentUser, logoutUser, type UserProfile } from './services/authService';
import logoIcon from './assets/icons/logo.svg';
import './App.css';


type AuthPage = 'login' | 'register' | 'home' | 'profile';

function App() {
  const [page, setPage] = useState<AuthPage>('register');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authNotice, setAuthNotice] = useState('');

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((currentUser) => {
        if (!active) return;
        if (currentUser) {
          setUser(currentUser);
          setPage('home');
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        setAuthNotice(
          error instanceof Error
            ? `Не вдалося перевірити сесію: ${error.message}`
            : 'Не вдалося перевірити сесію.',
        );
        setPage('login');
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    let notice = '';
    try {
      await logoutUser();
    } catch (error) {
      notice =
        error instanceof Error
          ? `Не вдалося завершити сесію на сервері: ${error.message}`
          : 'Не вдалося завершити сесію на сервері.';
    } finally {
      setUser(null);
      setAuthNotice(notice);
      setPage('login');
    }
  }

  if (checkingSession) {
    return (
      <main className="app-loading" role="status">
        Перевіряємо сесію…
      </main>
    );
  }

  if (page === 'home' && user) {
    return (
      <HomePage
        userName={user.displayName}
        userId={user.id}
        onLogout={handleLogout}
        onNavigate={(destination) => {
          if (destination === 'profile') {
            setPage('profile');
          }
        }}
      />
    );
  }

  if (page === 'profile' && user) {
    return (
      <ProfilePage
        userName={user.displayName}
        onBack={() => setPage('home')}
      />
    );
  }

  if (page === 'login') {
    return (
      <LoginCard
        onRegisterClick={() => setPage('register')}
        onAuthenticated={(authenticatedUser) => {
          setUser(authenticatedUser);
          setAuthNotice('');
          setPage('home');
        }}
        initialNotice={authNotice}
      />
    );
  }

  return (
    <main className="stellora-page register-page">
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
          onClick={() => setPage('login')}
        >
          Увійти
        </button>
      </header>

      <div className="stellora-content">
        <div className="stellora-intro">
          <h1 className="intro-brand">Stellora</h1>
          <h2 className="intro-title">
            Твій особистий
            <br />
            космос розвитку
          </h2>
          <p className="intro-text">
            Плануй. Розвивай звички. Досягай цілей. Створи свою унікальну галактику.
          </p>
        </div>

        <RegisterCard onLoginClick={() => setPage('login')} />
      </div>
    </main>
  );
}

export default App;
