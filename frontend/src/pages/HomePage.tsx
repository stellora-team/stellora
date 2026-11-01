import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import logoIcon from '../assets/icons/logo.svg';
import {
  createHabit as createApiHabit,
  deleteHabit as deleteApiHabit,
  loadHomeData,
  setHabitCompletedToday,
  type ApiCategory,
  type CreateHabitDetails,
} from '../services/homeService';
import './HomePage.css';

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

type TaskCategory = 'Навчання' | 'Командна робота' | 'Саморозвиток' | 'Інше';

type Task = {
  id: string;
  title: string;
  date: string; 
  time: string; 
  category: TaskCategory;
  done: boolean;
};

type HabitIcon = 'book' | 'water' | 'people' | 'star';

type Habit = {
  id: string;
  title: string;
  frequency: string;
  icon: HabitIcon;
  doneToday: boolean;
};

type MoodKey = 'great' | 'good' | 'neutral' | 'tired' | 'sad';

type HomePageProps = {
  userName?: string;
  userId?: string;
  onLogout?: () => Promise<void>;
  onNavigate?: (page: NavKey) => void;
};

const DARK = '#12103a';

const ICONS = {
  home: <path fill="currentColor" stroke="none" d="M12 3 3 10.5V21h6.5v-6h5v6H21V10.5z" />,
  book: (
    <path
      fill="currentColor"
      stroke="none"
      d="M3 5.5c2.5-1 5.5-1 8.5.5v13c-3-1.5-6-1.5-8.5-.5zM12.5 6c3-1.5 6-1.5 8.5-.5v13c-2.5-1-5.5-1-8.5.5z"
    />
  ),
  clipboard: (
    <path
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
      d="M9 3h6v2h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3zM8.5 11h7v1.6h-7zM8.5 14.5h7v1.6h-7z"
    />
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
      <path d="M7.5 12.5l3 3 6-6.5" stroke={DARK} strokeWidth="2.4" />
    </>
  ),
  focusFill: (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="5" stroke={DARK} strokeWidth="2" />
      <circle cx="12" cy="12" r="1.5" fill={DARK} stroke="none" />
    </>
  ),
  star: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 2l3.1 6.6 7.2.9-5.3 5 1.4 7.2L12 18l-6.4 3.7L7 14.5 1.7 9.5l7.2-.9z"
    />
  ),
  bars: (
    <path
      fill="currentColor"
      stroke="none"
      d="M3 11h4v10H3zM10 3h4v18h-4zM17 14h4v7h-4z"
    />
  ),
  calendarCheck: (
    <>
      <rect x="3.5" y="4.5" width="17" height="16.5" rx="2.5" />
      <path d="M8 2.5v4M16 2.5v4M3.5 10h17M9 15.5l2 2 4-4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="4.5" width="17" height="16.5" rx="2.5" />
      <path d="M8 2.5v4M16 2.5v4M3.5 10h17M8 14h8M8 17.5h5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="7.5" r="4" fill="currentColor" stroke="none" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" fill="currentColor" stroke="none" />
    </>
  ),
  tasks: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 12l3 3 5-6" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13.5" r="8" />
      <path d="M12 9.5v4l2.5 2M9.5 2.5h5" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14.5c1 1.5 2.5 2.2 4 2.2s3-.7 4-2.2M9 9.5v.5M15 9.5v.5" />
    </>
  ),
  shapes: (
    <>
      <rect x="6" y="6" width="12" height="12" />
      <rect x="3" y="3" width="4" height="4" />
      <rect x="17" y="3" width="4" height="4" />
      <rect x="3" y="17" width="4" height="4" />
      <rect x="17" y="17" width="4" height="4" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5" />
      <path d="M15.5 4.9a3.2 3.2 0 0 1 0 6.2M18 14.8c1.8.7 3 2.3 3 5.2" />
    </>
  ),
  cap: (
    <>
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" />
    </>
  ),
  drop: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 12l7.5-7.5M16 3.5V8h4.5" />
    </>
  ),
  chevronDown: <path d="M6 9l6 6 6-6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
} satisfies Record<string, ReactNode>;

type IconName = keyof typeof ICONS;

function Icon({
  name,
  size = 20,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}


const NAV: { key: NavKey; label: string; icon: IconName }[] = [
  { key: 'main', label: 'Головна', icon: 'home' },
  { key: 'goals', label: 'Цілі', icon: 'book' },
  { key: 'planner', label: 'Планувальник', icon: 'clipboard' },
  { key: 'habits', label: 'Звички', icon: 'checkCircle' },
  { key: 'focus', label: 'Фокус', icon: 'focusFill' },
  { key: 'space', label: 'Космос', icon: 'star' },
  { key: 'statistic', label: 'Статистика', icon: 'bars' },
  { key: 'diary', label: 'Щоденник', icon: 'calendarCheck' },
  { key: 'profile', label: 'Профіль', icon: 'user' },
];

const MOODS: { key: MoodKey; label: string; color: string; mouth: ReactNode }[] = [
  {
    key: 'great',
    label: 'Чудово',
    color: '#F5CE4E',
    mouth: <path d="M10 21q8 9 16 0z" fill="#241735" stroke="#241735" strokeWidth="2" strokeLinejoin="round" />,
  },
  {
    key: 'good',
    label: 'Добре',
    color: '#39D6AD',
    mouth: <path d="M11 22q7 6 14 0" fill="none" stroke="#241735" strokeWidth="2.4" strokeLinecap="round" />,
  },
  {
    key: 'neutral',
    label: 'Нейтрально',
    color: '#FFAB56',
    mouth: <path d="M12 24h12" fill="none" stroke="#241735" strokeWidth="2.4" strokeLinecap="round" />,
  },
  {
    key: 'tired',
    label: 'Втомлено',
    color: '#F45E97',
    mouth: <path d="M11.5 26q6.5-6 13 0" fill="none" stroke="#241735" strokeWidth="2.4" strokeLinecap="round" />,
  },
  {
    key: 'sad',
    label: 'Сумно',
    color: '#7775D5',
    mouth: <path d="M11.5 26q6.5-6 13 0" fill="none" stroke="#241735" strokeWidth="2.4" strokeLinecap="round" />,
  },
];

function MoodFace({ color, mouth }: { color: string; mouth: ReactNode }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r="16" fill={color} />
      <circle cx="12.5" cy="14.5" r="2" fill="#241735" />
      <circle cx="23.5" cy="14.5" r="2" fill="#241735" />
      {mouth}
    </svg>
  );
}

const CATEGORIES: TaskCategory[] = ['Навчання', 'Командна робота', 'Саморозвиток', 'Інше'];

const CATEGORY_ICON: Record<TaskCategory, IconName> = {
  Навчання: 'clipboard',
  'Командна робота': 'people',
  Саморозвиток: 'cap',
  Інше: 'calendar',
};

const FREQUENCIES = ['Щодня', 'По буднях', '3 рази на тиждень', 'Раз на тиждень'];

const HABIT_ICON_NAME: Record<HabitIcon, IconName> = {
  book: 'book',
  water: 'drop',
  people: 'people',
  star: 'star',
};

function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function formatLongDate(d: Date): string {
  const s = d
    .toLocaleDateString('uk-UA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace(/\s?р\.$/, '');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatClock(d: Date): string {
  return d.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDayLabel(iso: string, now: Date): string {
  if (iso === toISO(now)) return 'Сьогодні';
  if (iso === toISO(addDays(now, 1))) return 'Завтра';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
  });
}

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function byTime(a: Task, b: Task): number {
  return (a.time || '99:99').localeCompare(b.time || '99:99');
}

function readStoredUser(): { name: string; key: string } {
  try {
    const raw = localStorage.getItem('stellora_user');
    if (raw) {
      const u = JSON.parse(raw) as Record<string, string>;
      return {
        name: u.name || u.username || '',
        key: u.id || u.email || u.name || 'guest',
      };
    }
  } catch {
    // Ignore unavailable or malformed optional local profile data.
  }
  return { name: '', key: 'guest' };
}

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Keep the page usable when browser storage is unavailable.
    }
  }, [key, value]);

  return [value, setValue] as const;
}

function RowMenu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="home-row-menu" ref={ref}>
      <button
        type="button"
        className="home-dots"
        aria-label="Дії"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        ⋮
      </button>
      {open && (
        <div className="home-menu-pop">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            Видалити
          </button>
        </div>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="home-modal-backdrop" onMouseDown={onClose}>
      <div
        className="home-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="home-modal-head">
          <h3>{title}</h3>
          <button type="button" className="home-modal-close" onClick={onClose} aria-label="Закрити">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TaskForm({
  defaultDate,
  onSubmit,
  onCancel,
}: {
  defaultDate: string;
  onSubmit: (data: Omit<Task, 'id' | 'done'>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Навчання');
  const [error, setError] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Введіть назву завдання');
      return;
    }
    onSubmit({ title: title.trim(), date, time, category });
  }

  return (
    <form className="home-form" onSubmit={submit}>
      <label>
        <span>Назва</span>
        <input
          autoFocus
          value={title}
          maxLength={80}
          placeholder="Наприклад, прочитати 10 сторінок"
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
        />
      </label>
      <div className="home-form-row">
        <label>
          <span>Дата</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value || defaultDate)} />
        </label>
        <label>
          <span>Час</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>
      <label>
        <span>Категорія</span>
        <select value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="home-form-error">{error}</p>}
      <div className="home-form-actions">
        <button type="button" className="home-btn home-btn-outline" onClick={onCancel}>
          Скасувати
        </button>
        <button type="submit" className="home-btn home-btn-primary">
          Додати завдання
        </button>
      </div>
    </form>
  );
}

function HabitForm({
  categories,
  onSubmit,
  onCancel,
}: {
  categories: ApiCategory[];
  onSubmit: (data: CreateHabitDetails) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState(FREQUENCIES[0]);
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Введіть назву звички');
      return;
    }
    const scheduledDaysByFrequency: Record<string, number[]> = {
      Щодня: [1, 2, 3, 4, 5, 6, 7],
      'По буднях': [1, 2, 3, 4, 5],
      '3 рази на тиждень': [1, 3, 5],
      'Раз на тиждень': [1],
    };

    const payload: CreateHabitDetails = {
      title: title.trim(),
      description: '',
      scheduledDays: scheduledDaysByFrequency[frequency],
    };

    if (categoryId) {
        payload.categoryId = categoryId; // або parseInt(categoryId, 10), якщо API вимагає числове ID
    }
    onSubmit(payload);
  }

  return (
    <form className="home-form" onSubmit={submit}>
      <label>
        <span>Назва</span>
        <input
          autoFocus
          value={title}
          maxLength={60}
          placeholder="Наприклад, випити стакан води"
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
        />
      </label>
      <div className="home-form-row">
        <label>
          <span>Частота</span>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Категорія</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Без категорії</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="home-form-error">{error}</p>}
      <div className="home-form-actions">
        <button type="button" className="home-btn home-btn-outline" onClick={onCancel}>
          Скасувати
        </button>
        <button type="submit" className="home-btn home-btn-primary">
          Додати звичку
        </button>
      </div>
    </form>
  );
}

const FOCUS_STEP = 5 * 60;
const FOCUS_MIN = 5 * 60;
const FOCUS_MAX = 120 * 60;
const RING_RADIUS = 37;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function formatHabitFrequency(scheduledDays: number[]): string {
  const sortedDays = [...scheduledDays].sort((a, b) => a - b);
  if (sortedDays.length === 7) return 'Щодня';
  if (sortedDays.join(',') === '1,2,3,4,5') return 'По буднях';
  if (sortedDays.join(',') === '1,3,5') return '3 рази на тиждень';
  if (sortedDays.length === 1) return 'Раз на тиждень';
  return 'За розкладом';
}

export default function HomePage({
  userName,
  userId,
  onLogout,
  onNavigate,
}: HomePageProps) {
  const stored = useMemo(() => readStoredUser(), []);
  const [serverName, setServerName] = useState(userName || '');
  const displayName = userName || serverName || stored.name || 'друже';
  const scope = stored.key !== 'guest' ? stored.key : userId || stored.key;

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);
  const today = toISO(now);

  const [tasks, setTasks] = useStoredState<Task[]>(`stellora:${scope}:tasks`, []);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState('');
  const [habitActionId, setHabitActionId] = useState('');
  const [moods, setMoods] = useStoredState<Record<string, MoodKey>>(
    `stellora:${scope}:moods`,
    {},
  );

  const refreshHomeData = useCallback(async () => {
    setHomeLoading(true);
    setHomeError('');
    try {
      const data = await loadHomeData();
      const completedToday = new Set(
        data.dashboard.habits.items
          .filter((habit) => habit.isCompletedToday)
          .map((habit) => habit.id),
      );
      setHabits(
        data.habits.map((habit) => ({
          id: habit.id,
          title: habit.title,
          frequency: formatHabitFrequency(habit.scheduledDays),
          icon: 'star' as const,
          doneToday: completedToday.has(habit.id),
        })),
      );
      setCategories(data.categories);
      setServerName(data.dashboard.displayName);
    } catch (error) {
      setHomeError(
        error instanceof Error
          ? error.message
          : 'Не вдалося завантажити дані головної сторінки.',
      );
    } finally {
      setHomeLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refreshHomeData);
  }, [refreshHomeData]);

  const [active, setActive] = useState<NavKey>('main');

  function go(key: NavKey) {
    setActive(key);
    onNavigate?.(key);
  }

  const [modal, setModal] = useState<'task' | 'habit' | null>(null);

  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const tasksToday = useMemo(
    () => tasks.filter((t) => t.date === today).sort(byTime),
    [tasks, today],
  );
  const tasksDone = tasksToday.filter((t) => t.done).length;
  const visibleTasks = showAllTasks ? tasksToday : tasksToday.slice(0, 3);

  const upcoming = useMemo(
    () =>
      tasks
        .filter((t) => !t.done && t.date >= today)
        .sort((a, b) => `${a.date} ${a.time || '99:99'}`.localeCompare(`${b.date} ${b.time || '99:99'}`)),
    [tasks, today],
  );
  const visibleUpcoming = showAllUpcoming ? upcoming : upcoming.slice(0, 3);

  function addTask(data: Omit<Task, 'id' | 'done'>) {
    setTasks((prev) => [...prev, { ...data, id: uid(), done: false }]);
    setModal(null);
  }
  function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }
  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const [showAllHabits, setShowAllHabits] = useState(false);
  const habitsDone = habits.filter((habit) => habit.doneToday).length;
  const visibleHabits = showAllHabits ? habits : habits.slice(0, 3);

  async function addHabit(data: CreateHabitDetails) {
    if (habitActionId) return;
    setHabitActionId('new');
    setHomeError('');
    try {
      await createApiHabit(data);
      setModal(null);
      await refreshHomeData();
    } catch (error) {
      setHomeError(
        error instanceof Error ? error.message : 'Не вдалося створити звичку.',
      );
    } finally {
      setHabitActionId('');
    }
  }
  async function toggleHabit(id: string) {
    const habit = habits.find((item) => item.id === id);
    if (!habit || habitActionId) return;
    setHabitActionId(id);
    setHomeError('');
    try {
      await setHabitCompletedToday(id, !habit.doneToday);
      setHabits((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, doneToday: !habit.doneToday } : item,
        ),
      );
    } catch (error) {
      setHomeError(
        error instanceof Error
          ? error.message
          : 'Не вдалося оновити виконання звички.',
      );
    } finally {
      setHabitActionId('');
    }
  }
  async function deleteHabit(id: string) {
    if (habitActionId) return;
    setHabitActionId(id);
    setHomeError('');
    try {
      await deleteApiHabit(id);
      setHabits((previous) => previous.filter((habit) => habit.id !== id));
    } catch (error) {
      setHomeError(
        error instanceof Error ? error.message : 'Не вдалося видалити звичку.',
      );
    } finally {
      setHabitActionId('');
    }
  }

const [focusTaskId, setFocusTaskId] = useStoredState(`stellora:${scope}:focusTaskId`, '');
  const [duration, setDuration] = useStoredState(`stellora:${scope}:duration`, 25 * 60);
  const [endTime, setEndTime] = useStoredState(`stellora:${scope}:endTime`, 0);

  const [remaining, setRemaining] = useState(() => {
    if (endTime > 0) {
      return Math.max(0, Math.round((endTime - Date.now()) / 1000));
    }
    return duration;
  });

  const [running, setRunning] = useState(() => endTime > 0 && remaining > 0);
  const [finished, setFinished] = useState(() => endTime > 0 && remaining === 0);

  const endRef = useRef(endTime);

  useEffect(() => {
    endRef.current = endTime;
  }, [endTime]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setRunning(false);
        setFinished(true);
        setEndTime(0);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [running, setEndTime]);

  function toggleTimer() {
    if (running) {
      setRunning(false);
      setEndTime(0);
      return;
    }
    const startFrom = finished || remaining === 0 ? duration : remaining;
    setFinished(false);
    setRemaining(startFrom);

    const newEnd = Date.now() + startFrom * 1000;
    endRef.current = newEnd;
    setEndTime(newEnd);
    setRunning(true);
  }

  function resetTimer() {
    setRunning(false);
    setFinished(false);
    setRemaining(duration);
    setEndTime(0);
  }
  function changeDuration(delta: number) {
    if (running) return;
    const next = Math.min(FOCUS_MAX, Math.max(FOCUS_MIN, duration + delta));
    setDuration(next);
    setRemaining(next);
    setFinished(false);
  }

  const focusOptions = tasks.filter((t) => !t.done && t.date >= today).sort(byTime);
  const timerLabel = running
    ? 'Пауза'
    : finished
      ? 'Розпочати знову'
      : remaining < duration
        ? 'Продовжити'
        : 'Розпочати';
  const ringOffset = RING_LENGTH * (1 - remaining / duration);
  const timerTouched = remaining !== duration || finished;

  const savedMood = moods[today];
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(savedMood ?? null);

  function saveMood() {
    if (!selectedMood) return;
    setMoods((prev) => ({ ...prev, [today]: selectedMood }));
  }


  return (
    <div className="home-page">
      <header className="home-header">
        <a className="home-brand" href="#home" aria-label="Stellora">
          Stellora
        </a>
        <img className="home-brand-star" src={logoIcon} alt="" />
        {onLogout && (
          <button
            type="button"
            className="home-logout"
            onClick={() => void onLogout()}
          >
            Вийти
          </button>
        )}
      </header>

      <div className="home-body">
        {/* ---------- Меню ---------- */}
        <aside className="home-sidebar">
          <nav aria-label="Основна навігація">
            {NAV.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`home-nav-item${active === item.key ? ' is-active' : ''}`}
                aria-current={active === item.key ? 'page' : undefined}
                onClick={() => go(item.key)}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {}
        <main className="home-main">
          {/* Привітання */}
          <section className="home-banner">
            <h1>Вітаємо, {displayName}!</h1>
            <img className="home-banner-star" src={logoIcon} alt="" />
            <div className="home-banner-chips">
              <div className="home-chip">
                <Icon name="calendar" size={16} />
                <span>{formatLongDate(now)}</span>
              </div>
              <div className="home-chip home-chip-time">{formatClock(now)}</div>
            </div>
          </section>
          {homeError && (
            <div className="home-api-error" role="alert">
              <span>{homeError}</span>
              <button type="button" onClick={() => void refreshHomeData()}>
                Спробувати ще раз
              </button>
            </div>
          )}

          {}
          <div className="home-row home-row-top">
            <section className="home-card">
              <div className="home-card-head">
                <div>
                  <h2 className="home-card-title">
                    <Icon name="tasks" size={18} />
                    Завдання на сьогодні
                  </h2>
                  <p className="home-card-sub">Плануй свій день та рухайся до цілей крок за кроком.</p>
                </div>
                <div className="home-progress">
                  <span>
                    {tasksDone} із {tasksToday.length} виконано
                  </span>
                  <div className="home-progress-bar">
                    <i
                      style={{
                        width: `${tasksToday.length ? (tasksDone / tasksToday.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {tasksToday.length === 0 ? (
                <div className="home-empty">
                  Поки що немає завдань на сьогодні. Додай перше, щоб почати день.
                </div>
              ) : (
                <ul className="home-list">
                  {visibleTasks.map((t) => (
                    <li className="home-item home-task" key={t.id}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={t.done}
                        aria-label={t.title}
                        className={`home-check${t.done ? ' is-done' : ''}`}
                        onClick={() => toggleTask(t.id)}
                      >
                        {t.done ? '✓' : ''}
                      </button>
                      <span className="home-item-title">{t.title}</span>
                      <span className="home-item-meta">{t.time || '—'}</span>
                      <RowMenu onDelete={() => deleteTask(t.id)} />
                    </li>
                  ))}
                </ul>
              )}

              <div className="home-card-actions">
                <button type="button" className="home-btn home-btn-primary" onClick={() => setModal('task')}>
                  Додати завдання
                </button>
                <button
                  type="button"
                  className="home-btn home-btn-outline"
                  onClick={() =>
                    tasksToday.length > 3 ? setShowAllTasks((v) => !v) : go('planner')
                  }
                >
                  {showAllTasks && tasksToday.length > 3 ? 'Згорнути' : 'Переглянути всі'}
                </button>
              </div>
            </section>

            <section className="home-card">
              <div className="home-card-head">
                <div>
                  <h2 className="home-card-title">
                    <Icon name="checkCircle" size={18} />
                    Мої звички
                  </h2>
                  <p className="home-card-sub">Маленькі щоденні дії створюють великі результати.</p>
                </div>
                <div className="home-progress">
                  <span>
                    {habitsDone} із {habits.length} виконано
                  </span>
                  <div className="home-progress-bar">
                    <i
                      style={{
                        width: `${habits.length ? (habitsDone / habits.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {homeLoading ? (
                <div className="home-empty" role="status">
                  Завантажуємо звички…
                </div>
              ) : habits.length === 0 ? (
                <div className="home-empty">
                  Ти ще не додав(-ла) жодної звички. Почни з маленької — наприклад, склянки води.
                </div>
              ) : (
                <ul className="home-list">
                  {visibleHabits.map((h) => {
                    const done = h.doneToday;
                    return (
                      <li className="home-item home-habit" key={h.id}>
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={done}
                          aria-label={h.title}
                          className={`home-check${done ? ' is-done' : ''}`}
                          onClick={() => toggleHabit(h.id)}
                          disabled={habitActionId === h.id}
                        >
                          {done ? '✓' : ''}
                        </button>
                        <Icon name={HABIT_ICON_NAME[h.icon]} size={15} className="home-habit-icon" />
                        <span className="home-item-title">{h.title}</span>
                        <span className="home-item-meta home-item-meta-right">{h.frequency}</span>
                        <RowMenu onDelete={() => deleteHabit(h.id)} />
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="home-card-actions">
                <button
                  type="button"
                  className="home-btn home-btn-primary"
                  onClick={() => setModal('habit')}
                  disabled={homeLoading || Boolean(habitActionId)}
                >
                  Додати звичку
                </button>
                <button
                  type="button"
                  className="home-btn home-btn-outline"
                  onClick={() =>
                    habits.length > 3 ? setShowAllHabits((v) => !v) : go('habits')
                  }
                >
                  {showAllHabits && habits.length > 3 ? 'Згорнути' : 'Переглянути всі'}
                </button>
              </div>
            </section>
          </div>

          {}
          <div className="home-row home-row-middle">
            <section className="home-card">
              <div className="home-card-head">
                <div>
                  <h2 className="home-card-title home-card-title-lg">
                    <Icon name="calendar" size={18} />
                    Найближчі справи
                  </h2>
                  <p className="home-card-sub">Не пропусти важливі плани.</p>
                </div>
                <button
                  type="button"
                  className="home-link"
                  onClick={() =>
                    upcoming.length > 3 ? setShowAllUpcoming((v) => !v) : go('planner')
                  }
                >
                  {showAllUpcoming && upcoming.length > 3 ? 'Згорнути' : 'Усі справи'}
                  <Icon name="arrowRight" size={14} />
                </button>
              </div>

              {upcoming.length === 0 ? (
                <div className="home-empty">Найближчих справ немає. Час запланувати щось нове.</div>
              ) : (
                <ul className="home-list home-list-upcoming">
                  {visibleUpcoming.map((t) => (
                    <li className="home-item home-upcoming" key={t.id}>
                      <span className="home-upcoming-icon">
                        <Icon name={CATEGORY_ICON[t.category]} size={18} />
                      </span>
                      <span className="home-upcoming-text">
                        <strong>{t.title}</strong>
                        <small>
                          {formatDayLabel(t.date, now)}
                          {t.time ? `, ${t.time}` : ''} · {t.category}
                        </small>
                      </span>
                      <RowMenu onDelete={() => deleteTask(t.id)} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="home-card home-timer-card">
              <h2 className="home-card-title home-card-title-lg">
                <Icon name="timer" size={18} />
                Швидкий фокус
              </h2>

              <div className="home-select">
                <select
                  value={focusTaskId}
                  onChange={(e) => setFocusTaskId(e.target.value)}
                  aria-label="Завдання для фокусу"
                >
                  <option value="">Оберіть завдання</option>
                  {focusOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
                <Icon name="chevronDown" size={16} className="home-select-arrow" />
              </div>

              <div className="home-timer-ring-wrap">
                <button
                  type="button"
                  className="home-step"
                  aria-label="Менше на 5 хвилин"
                  disabled={running || duration <= FOCUS_MIN}
                  onClick={() => changeDuration(-FOCUS_STEP)}
                >
                  −
                </button>
                <div className="home-timer-ring">
                  <svg viewBox="0 0 88 88" width="88" height="88" aria-hidden="true">
                    <circle cx="44" cy="44" r={RING_RADIUS} className="home-ring-track" />
                    <circle
                      cx="44"
                      cy="44"
                      r={RING_RADIUS}
                      className="home-ring-progress"
                      style={{
                        strokeDasharray: RING_LENGTH,
                        strokeDashoffset: ringOffset,
                      }}
                    />
                  </svg>
                  <span role="timer" aria-live="off">
                    {formatTimer(remaining)}
                  </span>
                </div>
                <button
                  type="button"
                  className="home-step"
                  aria-label="Більше на 5 хвилин"
                  disabled={running || duration >= FOCUS_MAX}
                  onClick={() => changeDuration(FOCUS_STEP)}
                >
                  +
                </button>
              </div>

              <div className="home-timer-actions">
                <button type="button" className="home-btn home-btn-primary" onClick={toggleTimer}>
                  {timerLabel}
                </button>
                {timerTouched && (
                  <button
                    type="button"
                    className="home-btn home-btn-outline home-reset"
                    aria-label="Скинути таймер"
                    onClick={resetTimer}
                  >
                    ↺
                  </button>
                )}
              </div>
            </section>

            <section className="home-card">
              <h2 className="home-card-title home-card-title-lg">
                <Icon name="smile" size={18} />
                Мій настрій
              </h2>

              <div className="home-moods" role="radiogroup" aria-label="Мій настрій">
                {MOODS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    role="radio"
                    aria-checked={selectedMood === m.key}
                    className={`home-mood${selectedMood === m.key ? ' is-selected' : ''}`}
                    style={{ '--mood': m.color } as CSSProperties}
                    onClick={() => setSelectedMood(m.key)}
                  >
                    <MoodFace color={m.color} mouth={m.mouth} />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="home-btn home-btn-outline home-mood-save"
                disabled={!selectedMood}
                onClick={saveMood}
              >
                {savedMood && savedMood === selectedMood ? 'Збережено ✓' : 'Зберегти'}
              </button>
            </section>
          </div>

          {/* Мій космос + Швидкі дії */}
          <div className="home-row home-row-bottom">
            <section className="home-space">
              <h2>
                <Icon name="star" size={20} />
                Мій космос
              </h2>
              <button type="button" className="home-btn home-btn-outline home-space-btn" onClick={() => go('space')}>
                Перейти в космос
              </button>
            </section>

            <section className="home-card">
              <h2 className="home-card-title home-card-title-lg">
                <Icon name="shapes" size={20} />
                Швидкі дії
              </h2>
              <div className="home-quick">
                <button type="button" onClick={() => setModal('task')}>
                  <Icon name="calendar" size={28} />
                  <span>Нове завдання</span>
                </button>
                <button type="button" onClick={() => go('goals')}>
                  <Icon name="target" size={28} />
                  <span>Нова ціль</span>
                </button>
                <button type="button" onClick={() => setModal('habit')}>
                  <Icon name="checkCircle" size={28} />
                  <span>Нова звичка</span>
                </button>
                <button type="button" onClick={() => go('planner')}>
                  <Icon name="clipboard" size={28} />
                  <span>Планувальник</span>
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>

      {modal === 'task' && (
        <Modal title="Нове завдання" onClose={() => setModal(null)}>
          <TaskForm defaultDate={today} onSubmit={addTask} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'habit' && (
        <Modal title="Нова звичка" onClose={() => setModal(null)}>
          <HabitForm
            categories={categories}
            onSubmit={addHabit}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}