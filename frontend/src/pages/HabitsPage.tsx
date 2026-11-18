import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react';
import logoIcon from '../assets/icons/logo.svg';
import {
  createHabit,
  deleteHabit,
  loadHomeData,
  updateHabit,
  type ApiHabit,
  type CreateHabitDetails,
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
  onAddHabit?: () => void;
  onEditHabit?: (habit: ApiHabit) => void;
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

type HabitFrequency = 'daily' | 'selected-days' | 'interval';
type HabitModalMode = 'create' | 'edit';

const frequencyOptions: Array<{ value: HabitFrequency; label: string }> = [
  { value: 'daily', label: 'Щодня' },
  { value: 'selected-days', label: 'У певні дні' },
  { value: 'interval', label: 'Кожні N днів' },
];

function frequencyFromDays(days: number[]): HabitFrequency {
  if (days.length === 7) return 'daily';
  if (days.length === 1) return 'interval';
  return 'selected-days';
}

function daysForFrequency(frequency: HabitFrequency): number[] {
  const currentDay = new Date().getDay() || 7;
  if (frequency === 'daily') return [1, 2, 3, 4, 5, 6, 7];
  if (frequency === 'selected-days') return [1, 3, 5];
  return [currentDay];
}

function HabitModal({
  mode,
  habit,
  busy,
  onClose,
  onSubmit,
  onDelete,
}: {
  mode: HabitModalMode;
  habit: ApiHabit | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (details: CreateHabitDetails) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [title, setTitle] = useState(habit?.title ?? '');
  const [frequency, setFrequency] = useState<HabitFrequency>(
    habit ? frequencyFromDays(habit.scheduledDays) : 'daily',
  );
  const [formError, setFormError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('Введіть назву звички.');
      return;
    }

    setFormError('');
    try {
      await onSubmit({
        title: trimmedTitle,
        description: habit?.description ?? '',
        scheduledDays: daysForFrequency(frequency),
        ...(habit?.categoryId ? { categoryId: habit.categoryId } : {}),
      });
    } catch (requestError) {
      setFormError(
        requestError instanceof Error ? requestError.message : 'Не вдалося зберегти звичку.',
      );
    }
  }

  async function remove() {
    setFormError('');
    try {
      await onDelete();
    } catch (requestError) {
      setFormError(
        requestError instanceof Error ? requestError.message : 'Не вдалося видалити звичку.',
      );
    }
  }

  return (
    <div className="habit-modal-backdrop" onMouseDown={onClose}>
      <div
        className="habit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="habit-modal-heading">
          <h2 id="habit-modal-title">
            {mode === 'create' ? 'Створити звичку' : 'Редагувати звичку'}
          </h2>
          <button type="button" className="habit-modal-close" onClick={onClose} aria-label="Закрити">
            ×
          </button>
        </div>
        <form className="habit-modal-form" onSubmit={(event) => void submit(event)}>
          <label>
            <span>Назва звички</span>
            <input
              autoFocus
              value={title}
              maxLength={60}
              placeholder="Наприклад: Читати книгу"
              onChange={(event) => {
                setTitle(event.target.value);
                setFormError('');
              }}
            />
          </label>
          <fieldset className="habit-frequency">
            <legend>Регулярність</legend>
            <div className="habit-frequency-options">
              {frequencyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={frequency === option.value ? 'is-selected' : ''}
                  onClick={() => setFrequency(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          {formError && <p className="habit-modal-error" role="alert">{formError}</p>}
          <div className={`habit-modal-actions${mode === 'edit' ? ' is-editing' : ''}`}>
            {mode === 'edit' && (
              <button type="button" className="habit-modal-delete" onClick={() => void remove()} disabled={busy}>
                ▤ Видалити
              </button>
            )}
            <button type="button" className="habit-modal-cancel" onClick={onClose} disabled={busy}>
              Скасувати
            </button>
            <button type="submit" className="habit-modal-submit" disabled={busy}>
              {busy ? 'Зберігаємо…' : mode === 'create' ? 'Створити звичку' : 'Зберегти зміни'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HabitsPage({
  userName,
  onBack,
  onNavigate,
  onAddHabit,
  onEditHabit,
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
  const [modalMode, setModalMode] = useState<HabitModalMode | null>(null);
  const [editingHabit, setEditingHabit] = useState<ApiHabit | null>(null);
  const [modalBusy, setModalBusy] = useState(false);
  const [defaultCategoryId, setDefaultCategoryId] = useState('');

  const loadHabits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await loadHomeData();
      setHabits(data.habits);
      setDefaultCategoryId((current) => current || data.categories[0]?.id || '');
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

  function closeHabitModal() {
    if (modalBusy) return;
    setModalMode(null);
    setEditingHabit(null);
  }

  function openCreateHabitModal() {
    onAddHabit?.();
    setEditingHabit(null);
    setModalMode('create');
  }

  function openEditHabitModal(habit: ApiHabit) {
    onEditHabit?.(habit);
    setEditingHabit(habit);
    setModalMode('edit');
  }

  async function saveHabit(details: CreateHabitDetails) {
    if (modalBusy) return;
    const categoryId = details.categoryId || defaultCategoryId;
    if (!categoryId) {
      throw new Error('Не вдалося визначити категорію для звички.');
    }
    setModalBusy(true);
    try {
      const payload = { ...details, categoryId };
      const savedHabit = modalMode === 'edit' && editingHabit
        ? await updateHabit(editingHabit.id, payload)
        : await createHabit(payload);
      await loadHabits();
      setSelectedId(savedHabit.id);
      setModalMode(null);
      setEditingHabit(null);
    } finally {
      setModalBusy(false);
    }
  }

  async function removeHabit() {
    if (!editingHabit || modalBusy) return;
    if (!window.confirm(`Видалити звичку «${editingHabit.title}»?`)) return;
    setModalBusy(true);
    try {
      await deleteHabit(editingHabit.id);
      setSelectedId('');
      setHistory([]);
      await loadHabits();
      setModalMode(null);
      setEditingHabit(null);
    } finally {
      setModalBusy(false);
    }
  }

  function handleHabitMenuClick(
    event: MouseEvent<HTMLButtonElement>,
    habit: ApiHabit,
  ) {
    event.stopPropagation();
    openEditHabitModal(habit);
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
          <div className="habits-heading-actions">
            <button type="button" className="habit-add-button" onClick={openCreateHabitModal}>
              Нова звичка
            </button>
            <button type="button" className="habits-back secondary" onClick={onBack}>Повернутися</button>
          </div>
        </div>
        {error && <div className="habits-error" role="alert"><span>{error}</span><button type="button" onClick={() => void loadHabits()}>Спробувати ще раз</button></div>}
        {loading ? (
          <div className="habits-empty" role="status">Завантажуємо звички…</div>
        ) : habits.length === 0 ? (
          <div className="habits-empty">У тебе ще немає звичок. Додай першу на головній сторінці.</div>
        ) : (
          <div className="habits-layout">
            <section className="habits-list-card">
              <div className="habits-list-heading">
                <h2>Список звичок</h2>
              </div>
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
                      <button
                        type="button"
                        className="habit-menu-button"
                        aria-label={`Редагувати звичку: ${habit.title}`}
                        onClick={(event) => handleHabitMenuClick(event, habit)}
                      >
                        ⋮
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
      {modalMode && (
        <HabitModal
          key={`${modalMode}-${editingHabit?.id ?? 'new'}`}
          mode={modalMode}
          habit={editingHabit}
          busy={modalBusy}
          onClose={closeHabitModal}
          onSubmit={saveHabit}
          onDelete={removeHabit}
        />
      )}
      <nav className="habits-mobile-nav" aria-label="Навігація">
        <button type="button" onClick={onBack}>Головна</button>
        <button type="button" className="is-active">Звички</button>
        <button type="button" onClick={() => onNavigate?.('profile')}>Профіль</button>
      </nav>
    </div>
  );
}
