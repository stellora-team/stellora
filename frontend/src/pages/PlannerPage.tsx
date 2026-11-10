import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import './PlannerPage.css';
import logoIcon from '../assets/icons/logo.svg';
import bannerImage from '../assets/images/planner-banner.png';
import emptyImage from '../assets/images/planner-empty.png';

export type NavId =
  | 'home'
  | 'goals'
  | 'planner'
  | 'habits'
  | 'focus'
  | 'space'
  | 'statistics'
  | 'daily'
  | 'profile';

interface PlannerProps {
  onNavigate?: (id: NavId) => void;
  userId?: string;
}

type TaskCategory =
  | 'Навчання'
  | 'Робота'
  | 'Командна робота'
  | 'Саморозвиток'
  | 'Здоров’я'
  | 'Особисте'
  | 'Відпочинок'
  | 'Фінанси'
  | 'Побут'
  | 'Інше';

interface Task {
  id: string;
  title: string;
  date: string;
  time: string;
  done: boolean;
  category: TaskCategory;
}

type TaskInput = Omit<Task, 'id'>;
type Filter = 'all' | 'active' | 'done';
type EditorState = { mode: 'create' } | { mode: 'edit'; task: Task };


const LEGACY_STORAGE_KEY = 'stellora_planner_tasks';
const TASK_CATEGORIES: TaskCategory[] = [
  'Навчання',
  'Робота',
  'Командна робота',
  'Саморозвиток',
  'Здоров’я',
  'Особисте',
  'Відпочинок',
  'Фінанси',
  'Побут',
  'Інше',
];

function normalizeTasks(tasks: Omit<Task, 'category'>[] | Task[]): Task[] {
  return tasks.map((task) => ({
    ...task,
    category: 'category' in task && TASK_CATEGORIES.includes(task.category)
      ? task.category
      : 'Інше',
  }));
}

function readStoredTasks(storageKey: string): Task[] | null {
  const raw = localStorage.getItem(storageKey);
  if (raw !== null) return normalizeTasks(JSON.parse(raw) as Task[]);

  const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacyRaw === null) return null;

  const legacyTasks = normalizeTasks(JSON.parse(legacyRaw) as Omit<Task, 'category'>[]);
  writeStoredTasks(storageKey, legacyTasks);
  return legacyTasks;
}

function writeStoredTasks(storageKey: string, tasks: Task[]) {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function getTaskStorageKey(userId?: string): string {
  let scope = userId || 'guest';
  try {
    const raw = localStorage.getItem('stellora_user');
    if (raw) {
      const user = JSON.parse(raw) as Record<string, string>;
      const storedScope = user.id || user.email || user.name;
      if (storedScope) scope = storedScope;
    }
  } catch {
    scope = userId || 'guest';
  }
  return `stellora:${scope}:tasks`;
}

function makeId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function buildSeedTasks(): Task[] {
  const today = startOfToday();
  const at = (
    offset: number,
    time: string,
    title: string,
    done = false,
  ): Task => ({
    id: makeId(),
    title,
    time,
    done,
    category: 'Інше',
    date: toISO(addDays(today, offset)),
  });

  return [
    at(0, '09:00', 'Прочитати книгу'),
    at(0, '11:00', 'Підготувати презентацію', true),
    at(0, '14:00', 'Підготувати звіт'),
    at(0, '16:30', 'Зустріч з командою'),
    at(1, '10:00', 'Купити подарунок'),
    at(4, '12:00', 'Тренування'),
    at(5, '18:00', 'Зустріч з друзями'),
    at(17, '10:00', 'Оплатити рахунки'),
    at(23, '15:00', 'Записатися до лікаря'),
  ];
}

const taskApi = {
  async list(storageKey: string): Promise<Task[]> {
    const stored = readStoredTasks(storageKey);
    if (stored) return stored;
    const seed = buildSeedTasks();
    writeStoredTasks(storageKey, seed);
    return seed;
  },

  async create(storageKey: string, input: TaskInput): Promise<Task> {
    const task: Task = { ...input, id: makeId() };
    writeStoredTasks(storageKey, [...(readStoredTasks(storageKey) ?? []), task]);
    return task;
  },

  async update(storageKey: string, task: Task): Promise<Task> {
    const all = readStoredTasks(storageKey) ?? [];
    writeStoredTasks(storageKey, all.map((item) => (item.id === task.id ? task : item)));
    return task;
  },

  async remove(storageKey: string, id: string): Promise<void> {
    writeStoredTasks(
      storageKey,
      (readStoredTasks(storageKey) ?? []).filter((item) => item.id !== id),
    );
  },
};


const MONTHS = [
  'Січень',
  'Лютий',
  'Березень',
  'Квітень',
  'Травень',
  'Червень',
  'Липень',
  'Серпень',
  'Вересень',
  'Жовтень',
  'Листопад',
  'Грудень',
];

const MONTHS_GENITIVE = [
  'січня',
  'лютого',
  'березня',
  'квітня',
  'травня',
  'червня',
  'липня',
  'серпня',
  'вересня',
  'жовтня',
  'листопада',
  'грудня',
];

const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

const WEEKDAYS_FULL = [
  'Неділя',
  'Понеділок',
  'Вівторок',
  'Середа',
  'Четвер',
  'П’ятниця',
  'Субота',
];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromISO(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  return Array.from(
    { length: 42 },
    (_, index) => new Date(year, month, 1 - offset + index),
  );
}

function formatChipDate(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatLongDate(date: Date): string {
  return `${WEEKDAYS_FULL[date.getDay()]}, ${date.getDate()} ${
    MONTHS_GENITIVE[date.getMonth()]
  } ${date.getFullYear()}`;
}

function formatWhen(task: Task, todayISO: string): string {
  const tomorrowISO = toISO(addDays(fromISO(todayISO), 1));
  let when: string;

  if (task.date === todayISO) {
    when = 'Сьогодні';
  } else if (task.date === tomorrowISO) {
    when = 'Завтра';
  } else {
    const date = fromISO(task.date);
    when = `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`;
  }

  return `${when}, ${task.time}`;
}

function byDateTime(a: Task, b: Task): number {
  return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
}


type IconName =
  | 'home'
  | 'goals'
  | 'planner'
  | 'habits'
  | 'focus'
  | 'space'
  | 'statistics'
  | 'daily'
  | 'user'
  | 'clock'
  | 'checkSquare'
  | 'calendar'
  | 'calendarDays'
  | 'x'
  | 'check'
  | 'more';

const CUT = { stroke: 'var(--planner-cut, #1a1040)' } as const;

const ICONS: Record<IconName, ReactNode> = {
  home: (
    <path
      d="M12 2.5 2.5 10.5V21a1 1 0 0 0 1 1H9v-6h6v6h5.5a1 1 0 0 0 1-1V10.5z"
      fill="currentColor"
      stroke="none"
    />
  ),
  goals: (
    <>
      <path
        d="M2 4h7a3 3 0 0 1 3 3v14a2.5 2.5 0 0 0-2.5-2.5H2z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M22 4h-7a3 3 0 0 0-3 3v14a2.5 2.5 0 0 1 2.5-2.5H22z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  planner: (
    <>
      <path
        d="M9 2h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M8 11h8M8 15.5h8" style={CUT} />
    </>
  ),
  habits: (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
      <path d="m8 12.5 2.8 2.8L16 9.5" style={CUT} strokeWidth="2.2" />
    </>
  ),
  focus: (
    <>
      <path d="M21.2 15.9A10 10 0 1 1 8 2.8" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" fill="currentColor" />
    </>
  ),
  space: (
    <path
      d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"
      fill="currentColor"
      stroke="none"
    />
  ),
  statistics: (
    <>
      <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" stroke="none" />
      <rect x="10" y="3" width="4" height="18" rx="1" fill="currentColor" stroke="none" />
      <rect x="17" y="8" width="4" height="13" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  daily: (
    <>
      <path d="M8 2v4M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
      <path d="m9 16 2 2 4-4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="7.5" r="4.5" fill="currentColor" stroke="none" />
      <path d="M3.5 21a8.5 8.5 0 0 1 17 0z" fill="currentColor" stroke="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  checkSquare: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" stroke="none" />
      <path d="m8 12 3 3 5-6" style={CUT} strokeWidth="2.4" />
    </>
  ),
  calendar: (
    <>
      <path d="M8 2v4M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  calendarDays: (
    <>
      <path d="M8 2v4M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </>
  ),
  x: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="M20 6 9 17l-5-5" strokeWidth="3" />,
  more: (
    <>
      <circle cx="12" cy="5" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.8" fill="currentColor" stroke="none" />
    </>
  ),
};

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 0c.8 7.2 4.8 11.2 12 12-7.2.8-11.2 4.8-12 12-.8-7.2-4.8-11.2-12-12 7.2-.8 11.2-4.8 12-12z"
        fill="currentColor"
      />
    </svg>
  );
}

const NAV_ITEMS: { id: NavId; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Головна', icon: 'home' },
  { id: 'goals', label: 'Цілі', icon: 'goals' },
  { id: 'planner', label: 'Планувальник', icon: 'planner' },
  { id: 'habits', label: 'Звички', icon: 'habits' },
  { id: 'focus', label: 'Фокус', icon: 'focus' },
  { id: 'space', label: 'Космос', icon: 'space' },
  { id: 'statistics', label: 'Статистика', icon: 'statistics' },
  { id: 'daily', label: 'Щоденник', icon: 'daily' },
];

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Усі' },
  { id: 'active', label: 'Активні' },
  { id: 'done', label: 'Виконані' },
];

const SAVE_ERROR = 'Не вдалося зберегти зміни. Спробуйте ще раз.';

export default function Planner({ onNavigate, userId }: PlannerProps) {
  const todayISO = toISO(new Date());
  const storageKey = useMemo(() => getTaskStorageKey(userId), [userId]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = useState(todayISO);
  const [filter, setFilter] = useState<Filter>('all');
  const [editor, setEditor] = useState<EditorState | null>(null);

  useEffect(() => {
    let cancelled = false;

    taskApi
      .list(storageKey)
      .then((list) => {
        if (cancelled) return;
        setTasks(list);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Не вдалося завантажити справи.');
        setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const grid = useMemo(
    () => buildMonthGrid(view.year, view.month),
    [view.year, view.month],
  );

  const taskDays = useMemo(() => new Set(tasks.map((task) => task.date)), [tasks]);

  const dayTasks = useMemo(
    () => tasks.filter((task) => task.date === selected).sort(byDateTime),
    [tasks, selected],
  );

  const visibleTasks = dayTasks.filter((task) => {
    if (filter === 'active') return !task.done;
    if (filter === 'done') return task.done;
    return true;
  });

  const upcoming = useMemo(
    () =>
      tasks
        .filter((task) => !task.done && task.date >= todayISO)
        .sort(byDateTime)
        .slice(0, 2),
    [tasks, todayISO],
  );

  function shiftMonth(delta: number) {
    setView((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  function handleSelectDay(day: Date) {
    setSelected(toISO(day));
    if (day.getMonth() !== view.month || day.getFullYear() !== view.year) {
      setView({ year: day.getFullYear(), month: day.getMonth() });
    }
  }

  function handleGoToday() {
    const now = new Date();
    setSelected(toISO(now));
    setView({ year: now.getFullYear(), month: now.getMonth() });
  }

  async function handleToggle(task: Task) {
    const updated: Task = { ...task, done: !task.done };
    setTasks((current) => current.map((item) => (item.id === task.id ? updated : item)));

    try {
      await taskApi.update(storageKey, updated);
      setError('');
    } catch {
      setTasks((current) => current.map((item) => (item.id === task.id ? task : item)));
      setError(SAVE_ERROR);
    }
  }

  async function handleSave(input: TaskInput, existing?: Task): Promise<boolean> {
    try {
      if (existing) {
        const updated = await taskApi.update(storageKey, { ...existing, ...input });
        setTasks((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await taskApi.create(storageKey, input);
        setTasks((current) => [...current, created]);
      }

      const savedDate = fromISO(input.date);
      setSelected(input.date);
      setView({ year: savedDate.getFullYear(), month: savedDate.getMonth() });
      setError('');
      setEditor(null);
      return true;
    } catch {
      return false;
    }
  }

  async function handleDelete(task: Task): Promise<boolean> {
    try {
      await taskApi.remove(storageKey, task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setError('');
      setEditor(null);
      return true;
    } catch {
      return false;
    }
  }

  const selectedDate = fromISO(selected);

  return (
    <main className="planner-page">
      <header className="planner-header">
        <a className="planner-brand" href="#home" aria-label="Stellora">
          <img className="planner-brand-star" src={logoIcon} alt="" />
          <span>Stellora</span>
        </a>
      </header>

      <div className="planner-shell">
        <aside className="planner-sidebar" aria-label="Головне меню">
          <nav className="planner-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`planner-nav-item${item.id === 'planner' ? ' is-active' : ''}`}
                aria-current={item.id === 'planner' ? 'page' : undefined}
                onClick={() => {
                  if (item.id !== 'planner') onNavigate?.(item.id);
                }}
              >
                <Icon name={item.icon} className="planner-nav-icon" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="planner-nav-item planner-profile"
            onClick={() => onNavigate?.('profile')}
          >
            <Icon name="user" className="planner-nav-icon" />
            <span>Профіль</span>
          </button>
        </aside>

        <div className="planner-main">
          <section
            className="planner-banner"
            style={{ backgroundImage: `url(${bannerImage})` }}
          >
            <Icon name="planner" className="planner-banner-icon" />
            <h1>Планувальник</h1>
          </section>

          {error && (
            <p className="planner-error" role="alert">
              {error}
            </p>
          )}

          <div className="planner-content">
            {}
            <section className="planner-calendar" aria-label="Календар">
              <div className="planner-toolbar">
                <div className="planner-month-switch">
                  <button
                    type="button"
                    className="planner-month-arrow"
                    aria-label="Попередній місяць"
                    onClick={() => shiftMonth(-1)}
                  >
                    ❮
                  </button>
                  <strong>
                    {MONTHS[view.month]} {view.year}
                  </strong>
                  <button
                    type="button"
                    className="planner-month-arrow"
                    aria-label="Наступний місяць"
                    onClick={() => shiftMonth(1)}
                  >
                    ❯
                  </button>
                </div>

                <button
                  type="button"
                  className="planner-today-chip"
                  title="Перейти до сьогодні"
                  onClick={handleGoToday}
                >
                  {formatChipDate(new Date())}
                </button>
              </div>

              <div className="planner-weekdays" aria-hidden="true">
                {WEEKDAYS_SHORT.map((name) => (
                  <span key={name}>{name}</span>
                ))}
              </div>

              <div className="planner-days">
                {grid.map((day) => {
                  const iso = toISO(day);
                  const className = [
                    'planner-day',
                    day.getMonth() !== view.month && 'is-outside',
                    iso === todayISO && 'is-today',
                    iso === selected && 'is-selected',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <button
                      key={iso}
                      type="button"
                      className={className}
                      aria-pressed={iso === selected}
                      aria-label={formatLongDate(day)}
                      onClick={() => handleSelectDay(day)}
                    >
                      <span>{day.getDate()}</span>
                      {taskDays.has(iso) && <SparkIcon className="planner-day-spark" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {}
            <div className="planner-side">
              {ready && upcoming.length === 0 && (
                <section className="planner-card planner-upcoming is-empty">
                  <Icon name="calendar" className="planner-empty-calendar" />
                  <p>Найближчих справ немає. Час відпочити! 🌙</p>
                </section>
              )}

              {ready && upcoming.length > 0 && (
                <section className="planner-card planner-upcoming">
                  <div className="planner-card-head">
                    <span className="planner-card-icon">
                      <Icon name="clock" />
                    </span>
                    <div>
                      <h2>Найближчі справи</h2>
                      <p>
                        {upcoming.length === 1
                          ? '1 найближче завдання'
                          : `${upcoming.length} найближчі завдання`}
                      </p>
                    </div>
                  </div>

                  <ul className="planner-upcoming-list">
                    {upcoming.map((task) => (
                      <li key={task.id} className="planner-upcoming-item">
                        <span className="planner-task-bar" />
                        <span className="planner-task-title">{task.title}</span>
                        <span className="planner-task-category">{task.category}</span>
                        <span className="planner-task-time">
                          {formatWhen(task, todayISO)}
                        </span>
                        <button
                          type="button"
                          className="planner-task-menu"
                          aria-label={`Редагувати справу «${task.title}»`}
                          onClick={() => setEditor({ mode: 'edit', task })}
                        >
                          <Icon name="more" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {ready && dayTasks.length === 0 && (
                <section className="planner-card planner-day-card is-empty">
                  <img className="planner-empty-image" src={emptyImage} alt="" />
                  <h2>На цей день немає справ ✨</h2>
                  <p>Можеш відпочити або запланувати щось нове.</p>
                  <button
                    type="button"
                    className="planner-primary planner-primary--small"
                    onClick={() => setEditor({ mode: 'create' })}
                  >
                    + Додати завдання
                  </button>
                </section>
              )}

              {ready && dayTasks.length > 0 && (
                <section className="planner-card planner-day-card">
                  <div className="planner-card-head">
                    <span className="planner-card-icon planner-card-icon--filled">
                      <Icon name="checkSquare" />
                    </span>
                    <div>
                      <h2>Справи на вибрану дату</h2>
                      <p>{formatLongDate(selectedDate)}</p>
                    </div>
                  </div>

                  <div className="planner-tabs" role="tablist" aria-label="Фільтр справ">
                    {FILTERS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={filter === item.id}
                        className={`planner-tab${filter === item.id ? ' is-active' : ''}`}
                        onClick={() => setFilter(item.id)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <ul className="planner-task-list">
                    {visibleTasks.length === 0 && (
                      <li className="planner-task-empty">
                        {filter === 'done'
                          ? 'Виконаних справ поки немає.'
                          : 'Активних справ немає.'}
                      </li>
                    )}

                    {visibleTasks.map((task) => (
                      <li
                        key={task.id}
                        className={`planner-task${task.done ? ' is-done' : ''}`}
                      >
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={task.done}
                          aria-label={`Позначити «${task.title}» виконаною`}
                          className="planner-check"
                          onClick={() => handleToggle(task)}
                        >
                          {task.done && <Icon name="check" />}
                        </button>
                        <span className="planner-task-bar" />
                        <span className="planner-task-title">{task.title}</span>
                        <span className="planner-task-category">{task.category}</span>
                        <span className="planner-task-time">{task.time}</span>
                        <button
                          type="button"
                          className="planner-task-menu"
                          aria-label={`Редагувати справу «${task.title}»`}
                          onClick={() => setEditor({ mode: 'edit', task })}
                        >
                          <Icon name="more" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className="planner-primary"
                    onClick={() => setEditor({ mode: 'create' })}
                  >
                    Додати завдання
                  </button>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {editor && (
        <TaskModal
          key={editor.mode === 'edit' ? editor.task.id : 'new'}
          task={editor.mode === 'edit' ? editor.task : undefined}
          defaultDate={selected}
          onClose={() => setEditor(null)}
          onSave={(input) =>
            handleSave(input, editor.mode === 'edit' ? editor.task : undefined)
          }
          onDelete={
            editor.mode === 'edit' ? () => handleDelete(editor.task) : undefined
          }
        />
      )}
    </main>
  );
}


interface TaskModalProps {
  task?: Task;
  defaultDate: string;
  onClose: () => void;
  onSave: (input: TaskInput) => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
}

function TaskModal({ task, defaultDate, onClose, onSave, onDelete }: TaskModalProps) {
  const isEdit = Boolean(task);

  const [title, setTitle] = useState(task?.title ?? '');
  const [date, setDate] = useState(task?.date ?? defaultDate);
  const [time, setTime] = useState(task?.time ?? '09:00');
  const [category, setCategory] = useState<TaskCategory>(task?.category ?? 'Інше');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (!title.trim()) {
      setMessage('Введіть назву справи.');
      return;
    }
    if (!date) {
      setMessage('Оберіть дату.');
      return;
    }
    if (!time) {
      setMessage('Вкажіть час.');
      return;
    }

    setBusy(true);
    setMessage('');
    const ok = await onSave({
      title: title.trim(),
      date,
      time,
      done: task?.done ?? false,
      category,
    });
    if (!ok) {
      setMessage(SAVE_ERROR);
      setBusy(false);
    }
  }

  async function handleDeleteClick() {
    if (!onDelete || busy) return;

    setBusy(true);
    const ok = await onDelete();
    if (!ok) {
      setMessage('Не вдалося видалити справу. Спробуйте ще раз.');
      setBusy(false);
    }
  }

  return (
    <div
      className="planner-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="planner-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="planner-modal-title"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="planner-modal-head">
          <h2 id="planner-modal-title">
            {isEdit ? 'Редагувати справу' : 'Нова справа'}
          </h2>
          <button
            type="button"
            className="planner-modal-close"
            aria-label="Закрити"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </div>

        <label className="planner-field">
          <span>Назва справи</span>
          <input
            className="planner-input"
            type="text"
            value={title}
            maxLength={120}
            autoFocus
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <div className="planner-field-row">
          <label className="planner-field planner-field--date">
            <span>Дата</span>
            <span className="planner-input-wrap">
              <input
                className="planner-input"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
              <Icon name="calendarDays" className="planner-input-icon" />
            </span>
          </label>

          <label className="planner-field planner-field--time">
            <span>Час</span>
            <span className="planner-input-wrap">
              <input
                className="planner-input"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
              <Icon name="clock" className="planner-input-icon" />
            </span>
          </label>
        </div>

        <label className="planner-field">
          <span>Категорія</span>
          <select
            className="planner-input planner-category-input"
            value={category}
            onChange={(event) => setCategory(event.target.value as TaskCategory)}
          >
            {TASK_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        {message && (
          <p className="planner-modal-error" role="alert">
            {message}
          </p>
        )}

        <div className="planner-modal-divider" />

        <div className="planner-modal-actions">
          <button
            type="button"
            className="planner-btn planner-btn--secondary"
            onClick={onClose}
          >
            Скасувати
          </button>

          {isEdit && (
            <button
              type="button"
              className="planner-btn planner-btn--danger"
              disabled={busy}
              onClick={handleDeleteClick}
            >
              Видалити справу
            </button>
          )}

          <button
            type="submit"
            className="planner-btn planner-btn--primary"
            disabled={busy}
          >
            {isEdit ? 'Зберегти зміни' : 'Додати'}
          </button>
        </div>
      </form>
    </div>
  );
}