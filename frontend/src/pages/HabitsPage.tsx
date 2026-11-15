import { useCallback, useEffect, useMemo, useState } from 'react';
import logoIcon from '../assets/icons/logo.svg';
import {
  loadHomeData,
  type ApiHabit,
} from '../services/homeService';
import {
  getHabitHistory,
  setHabitCompletedToday,
  type HabitCompletion,
} from '../services/habitsService';
import './HabitsPage.css';

type NavKey =
  | 'main'
  | 'goals'
  | 'planner'
  | 'habits'
  | 'focus'
  | 'space'
  | 'statistic'
  | 'diary'
  | 'profile';

type HabitsPageProps = {
  userName?: string;
  userId?: string;
  onBack?: () => void;
  onNavigate?: (page: NavKey) => void;
};

function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatFrequency(days: number[]): string {
  if (days.length === 7) return 'Щодня';
  if ([1, 2, 3, 4, 5].every((day) => days.includes(day)) && days.length === 5) return 'По буднях';
  return 'За розкладом';
}

export default function HabitsPage({
  userName,
  onBack,
  onNavigate,
}: HabitsPageProps) {
  const [habits, setHabits] = useState<ApiHabit[]>([]);
  const [todayCompletedIds, setTodayCompletedIds] = useState<Set<string>>(new Set());
  const [today, setToday] = useState(() => toISO(new Date()));
  const [selectedId, setSelectedId] = useState('');
  const [history, setHistory] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const loadHabits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await loadHomeData();
      setHabits(data.habits);
      setTodayCompletedIds(
        new Set(
          data.dashboard.habits.items
            .filter((habit) => habit.isCompletedToday)
            .map((habit) => habit.id),
        ),
      );
      setToday(data.dashboard.today);
      setSelectedId((current) => current || data.habits[0]?.id || '');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не вдалося завантажити звички.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadHabits);
  }, [loadHabits]);

  const selectedHabit = habits.find((habit) => habit.id === selectedId) ?? null;

  const loadHistory = useCallback(async (habitId: string) => {
    setHistoryLoading(true);
    setError('');
    try {
      setHistory(await getHabitHistory(habitId));
    } catch (requestError) {
      setHistory([]);
      setError(requestError instanceof Error ? requestError.message : 'Не вдалося завантажити історію звички.');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) void Promise.resolve().then(() => loadHistory(selectedId));
  }, [loadHistory, selectedId]);

  const completedDates = useMemo(
    () => new Set(history.map((item) => item.completedOn)),
    [history],
  );
  const calendarDays = useMemo(() => {
    const end = new Date(`${today}T00:00:00`);
    return Array.from({ length: 30 }, (_, index) => toISO(addDays(end, index - 29)));
  }, [today]);

  const streak = useMemo(() => {
    let count = 0;
    for (let date = today; completedDates.has(date); date = toISO(addDays(new Date(`${date}T00:00:00`), -1))) {
      count += 1;
    }
    return count;
  }, [completedDates, today]);

  async function toggleToday(habit: ApiHabit) {
    if (busyId) return;
    const completed = todayCompletedIds.has(habit.id);
    setBusyId(habit.id);
    setError('');
    try {
      await setHabitCompletedToday(habit.id, !completed);
      setTodayCompletedIds((current) => {
        const next = new Set(current);
        if (completed) next.delete(habit.id);
        else next.add(habit.id);
        return next;
      });
      if (habit.id === selectedId) {
        setHistory((current) =>
          completed
            ? current.filter((item) => item.completedOn !== today)
            : [{ id: `local-${today}`, completedOn: today, createdAtUtc: new Date().toISOString() }, ...current],
        );
      } else if (!completed) {
        setSelectedId(habit.id);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не вдалося оновити виконання звички.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="habits-page">
      <header className="habits-header">
        <button type="button" className="habits-back" onClick={onBack}>← На головну</button>
        <div className="habits-brand">Stellora<img src={logoIcon} alt="" /></div>
        <span className="habits-greeting">{userName ? `Привіт, ${userName}` : ''}</span>
      </header>
      <main className="habits-content">
        <div className="habits-heading">
          <div>
            <p className="habits-eyebrow">ЩОДЕННИЙ ПРОГРЕС</p>
            <h1>Мої звички</h1>
          </div>
          <button type="button" className="habits-back secondary" onClick={onBack}>Повернутися</button>
        </div>
        {error && <div className="habits-error" role="alert"><span>{error}</span><button type="button" onClick={() => void loadHabits()}>Спробувати ще раз</button></div>}
        {loading ? (
          <div className="habits-empty" role="status">Завантажуємо звички…</div>
        ) : habits.length === 0 ? (
          <div className="habits-empty">У тебе ще немає звичок. Додай першу на головній сторінці.</div>
        ) : (
          <div className="habits-layout">
            <section className="habits-list-card">
              <h2>Список звичок</h2>
              <ul>
                {habits.map((habit) => {
                  const done = todayCompletedIds.has(habit.id);
                  return (
                    <li key={habit.id} className={habit.id === selectedId ? 'is-selected' : ''}>
                      <button type="button" className="habit-select" onClick={() => setSelectedId(habit.id)}>
                        <strong>{habit.title}</strong>
                        <small>{formatFrequency(habit.scheduledDays)}</small>
                      </button>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={done}
                        aria-label={`Виконано сьогодні: ${habit.title}`}
                        className={`habit-check${done ? ' is-done' : ''}`}
                        disabled={busyId === habit.id}
                        onClick={() => void toggleToday(habit)}
                      >
                        {done ? '✓' : ''}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
            {selectedHabit && (
              <section className="habit-history-card">
                <div className="habit-history-heading">
                  <div><p className="habits-eyebrow">ІСТОРІЯ ВИКОНАНЬ</p><h2>{selectedHabit.title}</h2></div>
                  <div className="habit-streak"><strong>{streak}</strong><span>днів серії</span></div>
                </div>
                {historyLoading ? <p className="habits-muted" role="status">Завантажуємо історію…</p> : (
                  <>
                    <div className="habit-calendar" aria-label="Останні 30 днів">
                      {calendarDays.map((date) => (
                        <div key={date} className={`habit-calendar-day${completedDates.has(date) ? ' is-done' : ''}${date === today ? ' is-today' : ''}`} title={formatDate(date)}>
                          <span>{new Date(`${date}T00:00:00`).getDate()}</span>
                        </div>
                      ))}
                    </div>
                    {history.length === 0 ? <p className="habits-muted">Ще немає жодної відмітки. Виконай звичку сьогодні.</p> : (
                      <ul className="habit-history-list">
                        {history.map((item) => <li key={item.id}><span>{formatDate(item.completedOn)}</span><b>Виконано</b></li>)}
                      </ul>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        )}
      </main>
      <nav className="habits-mobile-nav" aria-label="Навігація">
        <button type="button" onClick={onBack}>Головна</button>
        <button type="button" className="is-active">Звички</button>
        <button type="button" onClick={() => onNavigate?.('profile')}>Профіль</button>
      </nav>
    </div>
  );
}
