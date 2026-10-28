
import { useState } from 'react';
import LoginCard from './components/LoginCard';
import RegisterCard from './components/RegisterCard';
import logoIcon from './assets/icons/logo.svg';
import './App.css';


type AuthPage = 'login' | 'register';

function App() {
  const [page, setPage] = useState<AuthPage>('register');

  if (page === 'login') {
    return (
      <LoginCard onRegisterClick={() => setPage('register')} />
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
