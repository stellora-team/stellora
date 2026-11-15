import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import logoIcon from '../assets/icons/logo.svg';
import emptyTasksImage from '../assets/images/image 11.png';
import emptyHabitsImage from '../assets/images/image 10.png';
import emptyGoalsImage from '../assets/images/image 8.png';
import emptyFocusImage from '../assets/images/image 9.png';
import statisticsLoadErrorImage from '../assets/images/image 6.png';
import {
  getStatistics,
  isStatisticsEmpty,
  STATISTICS_PERIODS,
  normalizeStatisticsCategoryId,
  normalizeStatisticsPeriod,
  type ChartPoint,
  type StatisticsData,
  type StatisticsCategoryId,
  type StatisticsPeriod,
} from '../services/statisticsService';
import './StatisticsPage.css';

export type NavigationDestination =
  | 'home'
  | 'profile'
  | 'statistics';

type StatisticsPageProps = {
  userName: string;
  userId: string;
  onBack: () => void;
  onNavigate?: (destination: NavigationDestination) => void;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: StatisticsData };

type StatisticsCategory = {
  id: number | null;
  label: string;
  color: string;
};

const STATISTICS_CATEGORIES: StatisticsCategory[] = [
  { id: null, label: 'Усі категорії', color: '#b8a5e8' },
  { id: 1, label: "Здоров'я", color: '#ff6b9d' },
  { id: 2, label: 'Навчання', color: '#5dc9ff' },
  { id: 3, label: 'Робота', color: '#a77bff' },
  { id: 6, label: 'Саморозвиток', color: '#c56cff' },
  { id: 5, label: 'Стосунки', color: '#ff9e67' },
  { id: 4, label: 'Фінанси', color: '#f5ce4e' },
  { id: 8, label: 'Побут', color: '#65d6b3' },
  { id: 9, label: 'Хобі', color: '#65a8ff' },
  { id: 10, label: 'Гармонія', color: '#d99aff' },
];

const DARK = '#12103a';

const ICONS = {
  home: <path fill="currentColor" stroke="none" d="M12 3 3 10.5V21h6.5v-6h5v6H21V10.5z" />,
  book: (
    <path
      fill="currentColor"
      stroke="none"
      d="M3 5.5c2.5-1 5.5-1 8.5.5v13c-3-1.5-6-1.5-8.5-.5zM12.5 6c3-1.5 5.5-1.5 8.5-.5v13c-3-1-5.5-1-8.5.5z"
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
  user: (
    <>
      <circle cx="12" cy="7.5" r="4" fill="currentColor" stroke="none" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" fill="currentColor" stroke="none" />
    </>
  ),
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

type NavKey = 'home' | 'goals' | 'planner' | 'habits' | 'focus' | 'space' | 'statistics' | 'diary' | 'profile';

const NAV: { key: NavKey; label: string; icon: IconName }[] = [
  { key: 'home', label: 'Головна', icon: 'home' },
  { key: 'goals', label: 'Цілі', icon: 'book' },
  { key: 'planner', label: 'Планувальник', icon: 'clipboard' },
  { key: 'habits', label: 'Звички', icon: 'checkCircle' },
  { key: 'focus', label: 'Фокус', icon: 'focusFill' },
  { key: 'space', label: 'Космос', icon: 'star' },
  { key: 'statistics', label: 'Статистика', icon: 'bars' },
  { key: 'diary', label: 'Щоденник', icon: 'calendarCheck' },
  { key: 'profile', label: 'Профіль', icon: 'user' },
];

function BarChart({ points, maxValue }: { points: ChartPoint[]; maxValue: number }) {
  return (
    <div className="statistics-bar-chart" role="img" aria-label="Графік активності">
      {points.map((point) => (
        <div className="statistics-bar-column" key={point.label}>
          <span className="statistics-bar-value">{point.value}</span>
          <div className="statistics-bar-track">
            <div
              className="statistics-bar"
              style={{ height: `${Math.max((point.value / maxValue) * 100, point.value ? 8 : 0)}%` }}
            />
          </div>
          <span className="statistics-bar-label">{point.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function StatisticsPage({ userName, userId, onBack, onNavigate }: StatisticsPageProps) {
  const [period, setPeriod] = useState<StatisticsPeriod>('7d');
  const [categoryId, setCategoryId] = useState<StatisticsCategoryId>(null);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterToast, setFilterToast] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const hasDataRef = useRef(false);
  const skipFilterRequestRef = useRef(false);
  const lastSuccessfulFilterRef = useRef<{
    period: StatisticsPeriod;
    categoryId: StatisticsCategoryId;
  }>({ period: '7d', categoryId: null });

  const selectedCategory =
    STATISTICS_CATEGORIES.find((category) => category.id === categoryId) ??
    STATISTICS_CATEGORIES[0];

  useEffect(() => {
    if (!categoryMenuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [categoryMenuOpen]);

  useEffect(() => {
    if (!filterToast) return;
    const timeoutId = window.setTimeout(() => setFilterToast(false), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [filterToast]);

  useEffect(() => {
    if (skipFilterRequestRef.current) {
      skipFilterRequestRef.current = false;
      return;
    }

    let cancelled = false;
    const isInitialLoad = !hasDataRef.current;
    if (isInitialLoad) {
      setLoadState({ status: 'loading' });
    } else {
      setFilterLoading(true);
    }

    getStatistics(
      userId,
      normalizeStatisticsPeriod(period),
      normalizeStatisticsCategoryId(categoryId),
    )
      .then((data) => {
        if (cancelled) return;
        hasDataRef.current = true;
        lastSuccessfulFilterRef.current = { period, categoryId };
        setLoadState({ status: 'ready', data });
      })
      .catch(() => {
        if (cancelled) return;
        if (isInitialLoad) {
          setLoadState({ status: 'error' });
        } else {
          setFilterToast(true);
          skipFilterRequestRef.current = true;
          setPeriod(lastSuccessfulFilterRef.current.period);
          setCategoryId(lastSuccessfulFilterRef.current.categoryId);
        }
      })
      .finally(() => {
        if (!cancelled) setFilterLoading(false);
      });

    // Відповідь на застарілий період ігноруємо, якщо користувач встиг переключити вкладку.
    return () => {
      cancelled = true;
    };
  }, [categoryId, period, reloadNonce, userId]);

  function retryInitialLoad() {
    hasDataRef.current = false;
    setLoadState({ status: 'loading' });
    setReloadNonce((nonce) => nonce + 1);
    setPeriod(normalizeStatisticsPeriod(period));
    setCategoryId(normalizeStatisticsCategoryId(categoryId));
  }

  function navigate(destination: NavKey) {
    if (destination === 'home') {
      onBack();
      return;
    }
    if (destination === 'profile' || destination === 'statistics') {
      onNavigate?.(destination);
    }
  }

  const isLoading = loadState.status === 'loading';

  return (
    <div className="statistics-page">
      <header className="statistics-topbar">
        <a className="statistics-brand" href="#home" aria-label="Stellora">
          Stellora
        </a>
        <img className="statistics-brand-star" src={logoIcon} alt="" />
      </header>

      <div className="statistics-body">
        <aside className="statistics-sidebar">
          <nav aria-label="Основна навігація">
            {NAV.map((item) => (
              <button
                className={`statistics-nav-item${item.key === 'statistics' ? ' is-active' : ''}`}
                type="button"
                key={item.key}
                aria-current={item.key === 'statistics' ? 'page' : undefined}
                onClick={() => navigate(item.key)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="statistics-main" aria-busy={isLoading || filterLoading}>
          <section className="statistics-banner">
            <h1>Статистика</h1>
            <div className="statistics-banner-controls">
              <div className="statistics-category-filter" ref={categoryMenuRef}>
                <button
                  type="button"
                  className="statistics-category-trigger"
                  aria-expanded={categoryMenuOpen}
                  aria-haspopup="listbox"
                  onClick={() => setCategoryMenuOpen((open) => !open)}
                >
                  <i style={{ backgroundColor: selectedCategory.color }} />
                  <span>{selectedCategory.label}</span>
                  <b>⌄</b>
                </button>
                {categoryMenuOpen && (
                  <div className="statistics-category-menu" role="listbox" aria-label="Категорія статистики">
                    {STATISTICS_CATEGORIES.map((category) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={category.id === categoryId}
                        className={category.id === categoryId ? 'is-selected' : ''}
                        key={category.label}
                        onClick={() => {
                          setCategoryId(category.id);
                          setCategoryMenuOpen(false);
                        }}
                      >
                        <i style={{ backgroundColor: category.color }} />
                        <span>{category.label}</span>
                        {category.id === categoryId && <b>✓</b>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="statistics-periods" role="group" aria-label="Період статистики">
              {STATISTICS_PERIODS.map((option) => (
                <button
                  type="button"
                  className={period === option.key ? 'is-selected' : ''}
                  key={option.key}
                  aria-pressed={period === option.key}
                  onClick={() => setPeriod(option.key)}
                >
                  {option.label}
                </button>
              ))}
              </div>
            </div>
          </section>

          {loadState.status === 'loading' && <LoadingStatistics />}

          {loadState.status === 'error' && <StatisticsLoadError onRetry={retryInitialLoad} />}

          {loadState.status === 'ready' &&
            (isStatisticsEmpty(loadState.data) ? (
              <EmptyStatistics onNavigate={navigate} />
            ) : (
              <StatisticsContent data={loadState.data} period={period} userName={userName} />
            ))}
          {filterToast && (
            <div className="statistics-filter-toast" role="alert">
              <span className="statistics-toast-icon">!</span>
              <div><strong>Не вдалося застосувати фільтр</strong><small>Дані не оновлено. Спробуйте ще раз</small></div>
              <button type="button" aria-label="Закрити повідомлення" onClick={() => setFilterToast(false)}>×</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function StatisticsLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="statistics-load-error" role="alert">
      <img className="statistics-load-error-image" src={statisticsLoadErrorImage} alt="" />
      <h2>Не вдалося завантажити статистику</h2>
      <p>Сталася помилка під час отримання даних. Спробуйте завантажити статистику ще раз</p>
      <button type="button" onClick={onRetry}>Спробувати ще раз</button>
    </section>
  );
}

function StatisticsContent({
  data,
  period,
  userName,
}: {
  data: StatisticsData;
  period: StatisticsPeriod;
  userName: string;
}) {
  const maxHabits = Math.max(...data.habits.map((point) => point.value), 1);
  const maxFocus = Math.max(...data.focus.map((point) => point.value), 1);
  const totalTasks = data.taskBreakdown.completed + data.taskBreakdown.inProgress + data.taskBreakdown.notStarted;

  return (
    <>
      <p className="statistics-greeting">Показники для {userName}</p>

      <section className="statistics-summary" aria-label="Зведені показники">
        <article className="statistics-summary-card">
          <span className="statistics-summary-icon">✓</span>
          <div><span>Завдання</span><strong>{data.summary.tasks.value}</strong><small>{data.summary.tasks.completion}% виконано</small></div>
        </article>
        <article className="statistics-summary-card">
          <span className="statistics-summary-icon">●</span>
          <div><span>Звички</span><strong>{data.summary.habits}</strong><small>активних</small></div>
        </article>
        <article className="statistics-summary-card">
          <span className="statistics-summary-icon">◎</span>
          <div><span>Цілі</span><strong>{data.summary.goals}</strong><small>в процесі</small></div>
        </article>
        <article className="statistics-summary-card">
          <span className="statistics-summary-icon">◷</span>
          <div><span>Фокус сесії</span><strong>{data.summary.focusHours} год</strong><small>{period === '7d' ? 'цього тижня' : 'за період'}</small></div>
        </article>
      </section>

      <section className="statistics-grid">
        <article className="statistics-card statistics-task-card">
          <h2>Завдання</h2>
          <div className="statistics-task-content">
            <div className="statistics-donut-wrap">
              <svg className="statistics-donut" viewBox="0 0 120 120" aria-label={`${data.summary.tasks.completion}% завдань виконано`} role="img">
                <circle className="statistics-donut-track" cx="60" cy="60" r="44" pathLength="100" />
                <circle className="statistics-donut-progress" cx="60" cy="60" r="44" pathLength="100" strokeDasharray={`${data.summary.tasks.completion} ${100 - data.summary.tasks.completion}`} />
              </svg>
              <div className="statistics-donut-label"><strong>{data.summary.tasks.completion}%</strong><span>{data.taskBreakdown.completed} із {totalTasks}</span></div>
            </div>
            <div className="statistics-legend">
              <div><i className="legend-done" />Виконано <b>{data.taskBreakdown.completed}</b></div>
              <div><i className="legend-progress" />В процесі <b>{data.taskBreakdown.inProgress}</b></div>
              <div><i className="legend-idle" />Не розпочато <b>{data.taskBreakdown.notStarted}</b></div>
            </div>
          </div>
        </article>

        <article className="statistics-card">
          <h2>Звички</h2>
          <BarChart points={data.habits} maxValue={maxHabits} />
        </article>

        <article className="statistics-card statistics-goals-card">
          <h2>Цілі</h2>
          <div className="statistics-goals">
            {data.goals.map((goal) => (
              <div className="statistics-goal" key={goal.title}>
                <div><span>{goal.title}</span><b>{goal.progress}%</b></div>
                <div className="statistics-goal-track"><span style={{ width: `${goal.progress}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="statistics-card">
          <h2>Фокус</h2>
          <BarChart points={data.focus} maxValue={maxFocus} />
        </article>
      </section>
    </>
  );
}

function LoadingStatistics() {
  return (
    <>
      <section className="statistics-summary" aria-label="Завантаження показників">
        {Array.from({ length: 4 }, (_, index) => (
          <article className="statistics-summary-card statistics-skeleton-card" key={index}>
            <span className="statistics-skeleton statistics-skeleton-icon" />
            <div>
              <span className="statistics-skeleton statistics-skeleton-label" />
              <strong className="statistics-skeleton statistics-skeleton-value" />
              <small className="statistics-skeleton statistics-skeleton-small" />
            </div>
          </article>
        ))}
      </section>

      <section className="statistics-grid" aria-label="Завантаження графіків">
        {Array.from({ length: 4 }, (_, index) => (
          <article className="statistics-card statistics-skeleton-chart" key={index}>
            <span className="statistics-skeleton statistics-skeleton-heading" />
            <span className="statistics-skeleton statistics-skeleton-graph" />
          </article>
        ))}
      </section>
    </>
  );
}

const EMPTY_CARDS: {
  image: string;
  icon: string;
  title: string;
  text: string;
  action: string;
  destination: NavKey;
}[] = [
  { image: emptyTasksImage, icon: '✓', title: 'Ще немає завдань', text: 'Створіть перше завдання, щоб побачити свій прогрес.', action: 'Створити завдання', destination: 'home' },
  { image: emptyHabitsImage, icon: '●', title: 'Ще немає звичок', text: 'Додайте звичку та відмічайте виконання. Тут буде ваша регулярність.', action: 'Створити звичку', destination: 'home' },
  { image: emptyGoalsImage, icon: '◎', title: 'Ваші цілі ще попереду', text: 'Додайте першу ціль, щоб стежити за її досягненням.', action: 'Створити ціль', destination: 'home' },
  { image: emptyFocusImage, icon: '◷', title: 'Ще немає сесій фокусу', text: 'Почніть першу сесію. Тут з’явиться час зосередженої роботи.', action: 'Почати сесію', destination: 'home' },
];

function EmptyStatistics({ onNavigate }: { onNavigate: (destination: NavKey) => void }) {
  return (
    <>
      <section className="statistics-summary" aria-label="Порожні показники">
        {[
          ['Завдання', '0', 'виконано'],
          ['Звички', '0', 'активних'],
          ['Цілі', '0', 'в процесі'],
          ['Фокус сесії', '0 год', 'за період'],
        ].map(([label, value, hint]) => (
          <article className="statistics-summary-card" key={label}>
            <span className="statistics-summary-icon">—</span>
            <div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div>
          </article>
        ))}
      </section>

      <section className="statistics-empty-grid" aria-label="Почніть користуватися Stellora">
        {EMPTY_CARDS.map((card) => (
          <article className="statistics-empty-card" key={card.title}>
            <img className="statistics-empty-image" src={card.image} alt="" />
            <span className="statistics-empty-icon">{card.icon}</span>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
            <button type="button" onClick={() => onNavigate(card.destination)}>{card.action}</button>
          </article>
        ))}
      </section>
    </>
  );
}