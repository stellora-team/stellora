import './ProfilePage.css';

type ProfilePageProps = {
  userName: string;
  onBack: () => void;
};

export default function ProfilePage({ userName, onBack }: ProfilePageProps) {
  return (
    <main className="profile-page">
      <section className="profile-placeholder">
        <h1>Профіль</h1>
        <p>Вітаємо, {userName}!</p>
        <p>Сторінка профілю поки в розробці.</p>
        <button type="button" onClick={onBack}>
          На головну
        </button>
      </section>
    </main>
  );
}