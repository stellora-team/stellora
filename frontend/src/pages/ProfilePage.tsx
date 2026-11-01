import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import logoIcon from '../assets/icons/logo.svg';
import {
  authenticatedRequest,
  getCurrentUser,
  type UserProfile,
} from '../services/authService';
import './ProfilePage.css';

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

type ProfilePageProps = {
  userName?: string;
  userEmail?: string;
  onBack?: () => void;
  onNavigate?: (page: NavKey) => void;
};

type Profile = {
  username: string;
  timezone: string;
  createdAt: string;
};

type Status = { type: 'ok' | 'error'; text: string } | null;
type DashboardHabits = {
  totalCount: number;
  completedTodayCount: number;
};

type TaskLite = { done: boolean };
type HabitLite = { doneDates: string[] };
type FocusLite = { date: string; minutes: number };

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
  bars: <path fill="currentColor" stroke="none" d="M3 11h4v10H3zM10 3h4v18h-4zM17 14h4v7h-4z" />,
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
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 7.5l8.5 6 8.5-6" />
    </>
  ),
  timerFill: (
    <>
      <rect x="9.5" y="2" width="5" height="2.4" rx="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13.5" r="8.5" fill="currentColor" stroke="none" />
      <path d="M12 9v4.6l2.6 1.6" stroke={DARK} strokeWidth="2" />
    </>
  ),
  chevronDown: <path d="M6 9l6 6 6-6" />,
} satisfies Record<string, ReactNode>;

type IconName = keyof typeof ICONS;

function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
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

const TIMEZONES = [
  'Europe/Kyiv',
  'Europe/Warsaw',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/London',
  'Europe/Istanbul',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'UTC',
];

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

function formatSince(iso: string): string {
  const d = new Date(iso);
  const safe = Number.isNaN(d.getTime()) ? new Date() : d;
  return safe.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function detectTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Europe/Kiev') return 'Europe/Kyiv';
    return tz || 'Europe/Kyiv';
  } catch {
    return 'Europe/Kyiv';
  }
}

function timezoneLabel(tz: string): string {
  if (tz === 'UTC') return 'UTC';
  try {
    const options = { timeZone: tz, timeZoneName: 'shortOffset' } as unknown as Intl.DateTimeFormatOptions;
    const part = new Intl.DateTimeFormat('en', options)
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName');
    const offset = (part?.value ?? '').replace('GMT', 'UTC') || 'UTC';
    return `${tz} (${offset})`;
  } catch {
    return tz;
  }
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}

function readStoredUser(): { name: string; email: string; key: string; createdAt: string } {
  try {
    const raw = localStorage.getItem('stellora_user');
    if (raw) {
      const u = JSON.parse(raw) as Record<string, string>;
      return {
        name: u.name || u.username || '',
        email: u.email || '',
        key: u.id || u.email || u.name || 'guest',
        createdAt: u.createdAt || '',
      };
    }
  } catch {
  }
  return { name: '', email: '', key: 'guest', createdAt: '' };
}

function syncStoredUser(user: UserProfile) {
  try {
    const raw = localStorage.getItem('stellora_user');
    const u = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    localStorage.setItem(
      'stellora_user',
      JSON.stringify({
        ...u,
        id: user.id,
        email: user.email,
        name: user.displayName,
        createdAt: user.createdAtUtc,
      }),
    );
  } catch {
  }
}

export default function ProfilePage({ userName, userEmail, onBack, onNavigate }: ProfilePageProps) {
  const stored = useMemo(() => readStoredUser(), []);
  const [serverUserId, setServerUserId] = useState('');
  const scope = serverUserId || stored.key;
  const profileKey = `stellora:${scope}:profile`;
  const [email, setEmail] = useState(userEmail || stored.email);
  const [dashboardHabits, setDashboardHabits] = useState<DashboardHabits | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profile, setProfile] = useState<Profile>(() => {
    const saved = readJSON<Partial<Profile>>(profileKey, {});
    return {
      username: saved.username ?? (userName || stored.name || ''),
      timezone: saved.timezone || detectTimezone(),
      createdAt: saved.createdAt || stored.createdAt || toISO(new Date()),
    };
  });

  useEffect(() => {
    writeJSON(profileKey, profile);
  }, [profileKey, profile]);

  const [form, setForm] = useState({ username: profile.username, timezone: profile.timezone });
  const [status, setStatus] = useState<Status>(null);

  const dirty = form.username.trim() !== profile.username || form.timezone !== profile.timezone;

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const currentUser = await getCurrentUser();
        if (!active) return;
        if (!currentUser) {
          setStatus({ type: 'error', text: 'Сесію завершено. Увійдіть знову.' });
          return;
        }

        setServerUserId(currentUser.id);
        setEmail(currentUser.email);
        setProfile({
          username: currentUser.displayName,
          timezone: currentUser.timeZone || detectTimezone(),
          createdAt: currentUser.createdAtUtc,
        });
        setForm({
          username: currentUser.displayName,
          timezone: currentUser.timeZone || detectTimezone(),
        });
        syncStoredUser(currentUser);

        const dashboard = await authenticatedRequest<{
          habits: DashboardHabits;
        }>('/api/dashboard');
        if (active) {
          setDashboardHabits(dashboard.habits);
        }
      } catch (error) {
        if (active) {
          setStatus({
            type: 'error',
            text: error instanceof Error
              ? `Не вдалося завантажити дані профілю: ${error.message}`
              : 'Не вдалося завантажити дані профілю.',
          });
        }
      } finally {
        if (active) setLoadingProfile(false);
      }
    }

    void Promise.resolve().then(loadProfile);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (status?.type !== 'ok') return;
    const id = window.setTimeout(() => setStatus(null), 3000);
    return () => window.clearTimeout(id);
  }, [status]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = form.username.trim();

    if (savingProfile) return;
    if (name.length < 2) {
      setStatus({ type: 'error', text: 'Ім’я має містити щонайменше 2 символи' });
      return;
    }

    setSavingProfile(true);
    setStatus(null);
    try {
      const updatedUser = await authenticatedRequest<UserProfile | void>('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          displayName: name,
          email,
          timeZone: form.timezone,
        }),
      });
      const nextProfile = {
        username: updatedUser?.displayName || name,
        timezone: updatedUser?.timeZone || form.timezone,
        createdAt: updatedUser?.createdAtUtc || profile.createdAt,
      };
      setProfile(nextProfile);
      setForm({ username: nextProfile.username, timezone: nextProfile.timezone });
      if (updatedUser) {
        setEmail(updatedUser.email);
        setServerUserId(updatedUser.id);
        syncStoredUser(updatedUser);
      } else {
        syncStoredUser({
          id: serverUserId,
          email,
          displayName: name,
          createdAtUtc: profile.createdAt,
          timeZone: form.timezone,
        });
      }
      setStatus({ type: 'ok', text: 'Зміни збережено ✓' });
    } catch (error) {
      setStatus({
        type: 'error',
        text: error instanceof Error
          ? `Не вдалося зберегти зміни: ${error.message}`
          : 'Не вдалося зберегти зміни.',
      });
    } finally {
      setSavingProfile(false);
    }
  }

  function handleCancel() {
    setForm({ username: profile.username, timezone: profile.timezone });
    setStatus(null);
  }

  const tzOptions = TIMEZONES.includes(form.timezone) ? TIMEZONES : [form.timezone, ...TIMEZONES];
  const displayName = profile.username || 'Користувач';

  const stats = useMemo(() => {
    const tasks = readJSON<TaskLite[]>(`stellora:${scope}:tasks`, []);
    const habits = readJSON<HabitLite[]>(`stellora:${scope}:habits`, []);
    const focus = readJSON<FocusLite[]>(`stellora:${scope}:focus`, []);

    const now = new Date();
    const weekAgo = toISO(addDays(now, -6));
    const monthAgo = toISO(addDays(now, -29));

    const minutes = focus.filter((f) => f.date >= monthAgo).reduce((sum, f) => sum + f.minutes, 0);
    const hours = Math.round((minutes / 60) * 10) / 10;

    return {
      tasksTotal: tasks.length,
      tasksDone: tasks.filter((t) => t.done).length,
      habitsTotal: dashboardHabits?.totalCount ?? habits.length,
      habitsActive: dashboardHabits?.completedTodayCount ??
        habits.filter((h) => h.doneDates.some((d) => d >= weekAgo)).length,
      hours: hours.toLocaleString('uk-UA'),
    };
  }, [dashboardHabits, scope]);

  function go(key: NavKey) {
    if (key === 'profile') return;
    if (key === 'main') {
      onBack?.();
      return;
    }
    onNavigate?.(key);
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <a className="profile-brand" href="#home" aria-label="Stellora">
          Stellora
        </a>
        <img className="profile-brand-star" src={logoIcon} alt="" />
      </header>

      <div className="profile-body">
        {}
        <aside className="profile-sidebar">
          <nav aria-label="Основна навігація">
            {NAV.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`profile-nav-item${item.key === 'profile' ? ' is-active' : ''}`}
                aria-current={item.key === 'profile' ? 'page' : undefined}
                onClick={() => go(item.key)}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {}
        <main className="profile-content">
          <div className="profile-col">
            {}
            <section className="profile-hero" aria-label="Профіль користувача">
              <div className="profile-hero-glow" />
              <div className="profile-avatar" aria-hidden="true">
                <Icon name="user" size={64} />
              </div>
              <div className="profile-hero-text">
                <h1>{displayName}</h1>
                <p className="profile-hero-email">{email || '—'}</p>
                <p className="profile-hero-since">У Stellora з {formatSince(profile.createdAt)}</p>
              </div>
              <img className="profile-hero-star" src={logoIcon} alt="" />
            </section>

            {}
            <div className="profile-tabs" role="tablist">
              <button type="button" role="tab" aria-selected="true" className="profile-tab">
                Особиста інформація
              </button>
            </div>

            {}
            <form className="profile-card profile-form-card" onSubmit={handleSubmit} noValidate>
              <h2 className="profile-form-title">Особиста інформація</h2>
              <p className="profile-form-sub">Переглядай та редагуй особисті дані.</p>

              <div className="profile-fields">
                <div className="profile-field">
                  <span className="profile-field-icon">
                    <Icon name="user" size={20} />
                  </span>
                  <label htmlFor="profile-username">Ім’я користувача</label>
                  <input
                    id="profile-username"
                    type="text"
                    value={form.username}
                    maxLength={30}
                    placeholder="username"
                    autoComplete="nickname"
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, username: e.target.value }));
                      setStatus(null);
                    }}
                  />
                </div>

                <div className="profile-field">
                  <span className="profile-field-icon">
                    <Icon name="mail" size={20} />
                  </span>
                  <label htmlFor="profile-email">Електронна пошта</label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    placeholder="name@gmail.com"
                    readOnly
                    title="Email змінити не можна"
                  />
                </div>

                <div className="profile-field">
                  <span className="profile-field-icon">
                    <Icon name="timerFill" size={20} />
                  </span>
                  <label htmlFor="profile-timezone">Часовий пояс</label>
                  <div className="profile-select">
                    <select
                      id="profile-timezone"
                      value={form.timezone}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, timezone: e.target.value }));
                        setStatus(null);
                      }}
                    >
                      {tzOptions.map((tz) => (
                        <option key={tz} value={tz}>
                          {timezoneLabel(tz)}
                        </option>
                      ))}
                    </select>
                    <Icon name="chevronDown" size={16} className="profile-select-arrow" />
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <p
                  className={`profile-status${status ? ` is-${status.type}` : ''}`}
                  role="status"
                  aria-live="polite"
                >
                  {status?.text}
                </p>
                <button type="button" className="profile-btn profile-btn-cancel" onClick={handleCancel} disabled={!dirty || savingProfile || loadingProfile}>
                  Скасувати
                </button>
                <button type="submit" className="profile-btn profile-btn-save" disabled={!dirty || savingProfile || loadingProfile}>
                  Зберегти зміни
                </button>
              </div>
            </form>
          </div>

          <div className="profile-col">
            {}
            <section className="profile-card profile-activity" aria-label="Моя активність">
              <h2 className="profile-activity-title">Моя активність</h2>
              <div className="profile-stats">
                <div className="profile-stat">
                  <Icon name="focusFill" size={20} className="profile-stat-icon is-pink" />
                  <strong>{stats.tasksTotal}</strong>
                  <span>Задач</span>
                  <small>{stats.tasksDone} виконано</small>
                </div>
                <div className="profile-stat">
                  <Icon name="checkCircle" size={20} className="profile-stat-icon is-violet" />
                  <strong>{loadingProfile ? '…' : stats.habitsTotal}</strong>
                  <span>Звички</span>
                  <small>{dashboardHabits ? `${stats.habitsActive} виконано сьогодні` : `${stats.habitsActive} активні`}</small>
                </div>
                <div className="profile-stat">
                  <Icon name="timerFill" size={20} className="profile-stat-icon is-gold" />
                  <strong>{stats.hours}</strong>
                  <span>Годин фокусу</span>
                  <small>За місяць</small>
                </div>
              </div>
            </section>

            {}
            <div className="profile-photo" role="img" aria-label="Космічний пейзаж" />
          </div>
        </main>
      </div>

      <div className="profile-footer" aria-hidden="true" />
    </div>
  );
}