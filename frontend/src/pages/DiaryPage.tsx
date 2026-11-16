import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import './DiaryPage.css';
import logoIcon from '../assets/icons/logo.svg';
import bannerImage from '../assets/images/planner-banner.png';
import emptyImage from '../assets/images/diary-empty.png';
import moodChartEmptyImage from '../assets/images/diary-mood-chart-empty.png';
import moodHistoryEmptyImage from '../assets/images/diary-mood-history-empty.png';

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

interface DiaryProps {
  onNavigate?: (id: NavId) => void;
  onUnauthorized?: () => void;
}

interface NoteResponse {
  id: string;
  title: string;
  content: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

interface NotePageResponse {
  items: NoteResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
}

interface MoodResponse {
  id: string;
  recordedOn: string;
  score: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

interface SaveNoteRequest {
  title: string;
  content: string;
}

type Tab = 'notes' | 'mood';
type EditorMode = { kind: 'idle' } | { kind: 'create' } | { kind: 'edit'; id: string };
type Toast = { type: 'success' | 'error'; title: string; text: string };

const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'https://stellora-api.duckdns.org'
).replace(/\/$/, '');

const TOKEN_KEYS = [
  'accessToken',
  'access_token',
  'stellora_access_token',
  'stellora_token',
  'token',
];

const SESSION_KEYS = ['stellora_auth_session', 'stellora_session', 'session', 'auth'];

function readAccessToken(): string | null {
  try {
    for (const storage of [localStorage, sessionStorage]) {
      for (const key of TOKEN_KEYS) {
        const value = storage.getItem(key);
        if (value) return value.replace(/^"|"$/g, '');
      }

      for (const key of SESSION_KEYS) {
        const raw = storage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw) as { accessToken?: string; token?: string };
          const token = parsed.accessToken ?? parsed.token;
          if (token) return token;
        } catch {
          continue;
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}

class ApiError extends Error {
  status: number;

  constructor(status: number) {
    super(`HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (init.body) headers['Content-Type'] = 'application/json';

  const token = readAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0);
  }

  if (!response.ok) throw new ApiError(response.status);

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

const notesApi = {
  async list(): Promise<NoteResponse[]> {
    const pageSize = 50;
    const all: NoteResponse[] = [];

    for (let page = 1; page <= 20; page += 1) {
      const result = await request<NotePageResponse>(
        `/api/notes?page=${page}&pageSize=${pageSize}`,
      );
      all.push(...result.items);
      if (result.items.length === 0 || all.length >= result.totalCount) break;
    }

    return all;
  },

  create(body: SaveNoteRequest): Promise<NoteResponse> {
    return request<NoteResponse>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(id: string, body: SaveNoteRequest): Promise<NoteResponse> {
    return request<NoteResponse>(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async remove(id: string): Promise<void> {
    await request<void>(`/api/notes/${id}`, { method: 'DELETE' });
  },
};

const moodApi = {
  recent(): Promise<MoodResponse[]> {
    return request<MoodResponse[]>('/api/moods?page=1&pageSize=14');
  },

  async saveToday(score: number): Promise<void> {
    await request<void>('/api/moods/today', {
      method: 'PUT',
      body: JSON.stringify({ score }),
    });
  },
};

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

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseUtc(value?: string): Date | null {
  if (!value?.trim()) return null;
  const date = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value)
    ? new Date(value)
    : new Date(`${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function noteDate(note: NoteResponse): Date | null {
  return parseUtc(note.updatedAtUtc) ?? parseUtc(note.createdAtUtc);
}

function plural(count: number, forms: [string, string, string]): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

function dayStart(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function formatNoteDate(note: NoteResponse): string {
  const date = noteDate(note);
  if (!date) return 'Дата невідома';
  const diffDays = Math.round((dayStart(new Date()) - dayStart(date)) / 86_400_000);
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  if (diffDays === 0) return `Сьогодні, ${time}`;
  if (diffDays === 1) return `Учора, ${time}`;
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`;
}

function formatMoodDate(recordedOn: string): string {
  const parts = recordedOn.split('-').map(Number);
  if (
    parts.length !== 3 ||
    parts.some((part) => !Number.isInteger(part)) ||
    parts[1] < 1 ||
    parts[1] > 12 ||
    parts[2] < 1 ||
    parts[2] > 31
  ) {
    return 'Дата невідома';
  }
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return 'Дата невідома';
  }
  const diffDays = Math.round((dayStart(new Date()) - dayStart(date)) / 86_400_000);

  if (diffDays === 0) return 'Сьогодні';
  if (diffDays === 1) return 'Учора';
  return `${day} ${MONTHS_GENITIVE[month - 1]}`;
}

function notePreview(content: string): string {
  const line = content
    .split('\n')
    .map((part) => part.trim())
    .find(Boolean);
  return line ?? 'Без тексту';
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Сесію завершено. Увійдіть знову.';
    if (error.status === 0) return 'Немає з’єднання із сервером. Перевірте інтернет.';
    if (error.status === 400 || error.status === 422) {
      return 'Перевірте назву та текст нотатки.';
    }
  }
  return fallback;
}

function moodErrorText(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Сесію завершено. Увійди знову';
    if (error.status === 0) return 'Немає з’єднання із сервером';
  }
  return 'Спробуй ще раз';
}

const SAVE_ERROR = 'Не вдалося зберегти нотатку. Спробуйте ще раз';
const DISCARD_CONFIRM = 'Є незбережені зміни. Відкинути їх?';

const MOODS = [
  { score: 5, label: 'Чудово', color: '#F5CE4E' },
  { score: 4, label: 'Добре', color: '#39D6AD' },
  { score: 3, label: 'Нейтрально', color: '#FFAB56' },
  { score: 2, label: 'Втомлено', color: '#F45E97' },
  { score: 1, label: 'Сумно', color: '#7775D5' },
];

const MOUTH_PROPS = {
  fill: 'none',
  stroke: '#241735',
  strokeWidth: 2.4,
  strokeLinecap: 'round' as const,
};

const FACE_MOUTHS: Record<number, ReactNode> = {
  5: (
    <path
      d="M16 26.5 Q24 38 32 26.5 Z"
      fill="#241735"
      stroke="#241735"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  ),
  4: <path d="M17 27.5 Q24 34.5 31 27.5" {...MOUTH_PROPS} />,
  3: <path d="M18 29.5 H30" {...MOUTH_PROPS} />,
  2: <path d="M17 32 Q24 25.5 31 32" {...MOUTH_PROPS} />,
  1: <path d="M17 33 Q24 26 31 33" {...MOUTH_PROPS} />,
};

function MoodFace({
  score,
  size,
  x,
  y,
  className,
}: {
  score: number;
  size?: number;
  x?: number;
  y?: number;
  className?: string;
}) {
  const mood = MOODS.find((item) => item.score === score);
  const color = mood?.color ?? '#7D7C9B';
  const halo = mood?.color ?? '#C4C4D9';

  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      width={size}
      height={size}
      x={x}
      y={y}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="24" cy="24" r="24" fill={halo} opacity="0.12" />
      <circle cx="24" cy="24" r="17.5" fill={color} stroke={color} strokeWidth="1.4" />
      <circle cx="18.5" cy="21" r="2.2" fill="#241735" />
      <circle cx="29.5" cy="21" r="2.2" fill="#241735" />
      {mood && FACE_MOUTHS[score]}
    </svg>
  );
}

const WEEK_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

function currentWeek(): { iso: string; label: string; future: boolean }[] {
  const today = new Date();
  const todayIso = toISO(today);
  const offset = (today.getDay() + 6) % 7;

  return WEEK_LABELS.map((label, index) => {
    const day = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - offset + index,
    );
    const iso = toISO(day);
    return { iso, label, future: iso > todayIso };
  });
}

const CHART_X0 = 34;
const CHART_X1 = 594;
const CHART_TOP = 18;
const CHART_ROW_GAP = 28;

function chartRowY(score: number): number {
  const clamped = Math.min(5, Math.max(1, Math.round(score)));
  return CHART_TOP + (5 - clamped) * CHART_ROW_GAP;
}

function MoodChart({ moods }: { moods: MoodResponse[] }) {
  const week = currentWeek();
  const byDay = new Map(moods.map((item) => [item.recordedOn, item.score]));
  const step = (CHART_X1 - CHART_X0) / 7;

  const points = week.map((day, index) => ({
    ...day,
    x: CHART_X0 + step * (index + 0.5),
    score: byDay.get(day.iso),
  }));

  const segments: string[] = [];
  let current: string[] = [];
  points.forEach((point) => {
    if (point.score !== undefined) {
      current.push(`${point.x},${chartRowY(point.score)}`);
    } else if (current.length > 0) {
      segments.push(current.join(' '));
      current = [];
    }
  });
  if (current.length > 0) segments.push(current.join(' '));

  const baselineY = CHART_TOP + 4 * CHART_ROW_GAP + 20;

  return (
    <svg
      className="diary-chart-svg"
      viewBox="0 0 600 176"
      role="img"
      aria-label="Настрій за тиждень"
    >
      {MOODS.map((mood) => (
        <g key={mood.score}>
          <text
            className="diary-chart-axis"
            x={CHART_X0 - 10}
            y={chartRowY(mood.score) + 3.5}
            textAnchor="end"
          >
            {mood.label.slice(0, 3)}
          </text>
          <line
            className="diary-chart-grid"
            x1={CHART_X0}
            x2={CHART_X1}
            y1={chartRowY(mood.score)}
            y2={chartRowY(mood.score)}
          />
        </g>
      ))}
      <line
        className="diary-chart-grid"
        x1={CHART_X0}
        x2={CHART_X1}
        y1={baselineY}
        y2={baselineY}
      />

      {segments.map((segment) => (
        <polyline key={segment} className="diary-chart-line" points={segment} />
      ))}

      {points.map((point) => {
        if (point.score !== undefined) {
          return (
            <MoodFace
              key={point.iso}
              score={point.score}
              size={36}
              x={point.x - 18}
              y={chartRowY(point.score) - 18}
            />
          );
        }
        if (!point.future) {
          return (
            <MoodFace
              key={point.iso}
              score={0}
              size={36}
              x={point.x - 18}
              y={chartRowY(1) - 18}
            />
          );
        }
        return null;
      })}

      {points.map((point) => (
        <text
          key={`${point.iso}-label`}
          className="diary-chart-day"
          x={point.x}
          y={baselineY + 20}
          textAnchor="middle"
        >
          {point.label}
        </text>
      ))}
    </svg>
  );
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
  | 'search'
  | 'sort'
  | 'clock'
  | 'plus'
  | 'check'
  | 'trash'
  | 'alert'
  | 'close';

const CUT = { stroke: 'var(--diary-cut, #1a1040)' } as const;

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
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  sort: <path d="M4 7h16M4 12h16M4 17h16" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  plus: <path d="M12 4v16M4 12h16" strokeWidth="2.4" />,
  check: <path d="M20 6 9 17l-5-5" strokeWidth="2.6" />,
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
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

export default function Diary({ onNavigate, onUnauthorized }: DiaryProps) {
  const [tab, setTab] = useState<Tab>('notes');

  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [newestFirst, setNewestFirst] = useState(true);

  const [mode, setMode] = useState<EditorMode>({ kind: 'idle' });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [saveFailed, setSaveFailed] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [moods, setMoods] = useState<MoodResponse[]>([]);
  const [moodState, setMoodState] = useState<'idle' | 'loading' | 'error'>('loading');
  const [moodBusy, setMoodBusy] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  function reportError(error: unknown) {
    if (error instanceof ApiError && error.status === 401) onUnauthorized?.();
  }

  async function loadNotes() {
    setLoadState('loading');
    setLoadError('');

    try {
      const list = await notesApi.list();
      setNotes(list);
      setLoadState('ready');
    } catch (error) {
      reportError(error);
      setLoadError(errorMessage(error, 'Не вдалося завантажити нотатки.'));
      setLoadState('error');
    }
  }

  async function loadMoods(silent = false) {
    if (!silent) setMoodState('loading');

    try {
      setMoods(await moodApi.recent());
      setMoodState('idle');
    } catch (error) {
      reportError(error);
      setMoodState('error');
    }
  }

  useEffect(() => {
    void loadNotes();
  }, []);

  useEffect(() => {
    if (tab === 'mood') void loadMoods();
  }, [tab]);

  useEffect(() => {
    if (!confirmingDelete) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !deleting) setConfirmingDelete(false);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmingDelete, deleting]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const todayMood = moods.find((item) => item.recordedOn === toISO(new Date()));
  const todayScore = todayMood?.score;

  useEffect(() => {
    if (todayScore !== undefined) {
      setSelectedMood((current) => current ?? todayScore);
    }
  }, [todayScore]);

  const moodDirty = selectedMood !== null && selectedMood !== todayScore;
  const moodsEmpty = moodState === 'idle' && moods.length === 0;

  const moodHistory = useMemo(
    () =>
      [...moods]
        .sort((a, b) => b.recordedOn.localeCompare(a.recordedOn))
        .slice(0, 6),
    [moods],
  );

  const activeNote = mode.kind === 'edit' ? notes.find((note) => note.id === mode.id) : undefined;

  const isDirty =
    mode.kind === 'edit'
      ? activeNote !== undefined &&
        (title !== activeNote.title || content !== activeNote.content)
      : mode.kind === 'create'
        ? title.trim() !== '' || content !== ''
        : false;

  const visibleNotes = useMemo(() => {
    const text = query.trim().toLowerCase();
    const filtered = text
      ? notes.filter(
          (note) =>
            note.title.toLowerCase().includes(text) ||
            note.content.toLowerCase().includes(text),
        )
      : notes;

    return [...filtered].sort((a, b) => {
      const diff = (noteDate(b)?.getTime() ?? 0) - (noteDate(a)?.getTime() ?? 0);
      return newestFirst ? diff : -diff;
    });
  }, [notes, query, newestFirst]);

  function confirmDiscard(): boolean {
    return !isDirty || window.confirm(DISCARD_CONFIRM);
  }

  function resetFeedback() {
    setFormError('');
    setSaveFailed(false);
  }

  function handleSelectNote(note: NoteResponse) {
    if (mode.kind === 'edit' && mode.id === note.id) return;
    if (!confirmDiscard()) return;

    resetFeedback();
    setMode({ kind: 'edit', id: note.id });
    setTitle(note.title);
    setContent(note.content);
  }

  function handleNewNote() {
    if (!confirmDiscard()) return;

    resetFeedback();
    setMode({ kind: 'create' });
    setTitle('');
    setContent('');
  }

  function handleCancel() {
    resetFeedback();

    if (mode.kind === 'edit' && activeNote && isDirty) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      return;
    }

    setMode({ kind: 'idle' });
    setTitle('');
    setContent('');
  }

  function handleTabChange(next: Tab) {
    if (next === tab) return;
    if (!confirmDiscard()) return;

    if (next === 'mood') {
      resetFeedback();
      setMode({ kind: 'idle' });
      setTitle('');
      setContent('');
    }
    setTab(next);
  }

  async function handleSave() {
    if (saving || mode.kind === 'idle') return;

    if (!title.trim()) {
      setFormError('Введіть назву нотатки.');
      setSaveFailed(false);
      return;
    }

    setSaving(true);
    resetFeedback();

    try {
      const body: SaveNoteRequest = { title: title.trim(), content };

      if (mode.kind === 'create') {
        const created = await notesApi.create(body);
        setNotes((current) => [created, ...current]);
        setMode({ kind: 'edit', id: created.id });
        setTitle(created.title);
        setContent(created.content);
      } else {
        const updated = await notesApi.update(mode.id, body);
        setNotes((current) =>
          current.map((note) => (note.id === updated.id ? updated : note)),
        );
        setTitle(updated.title);
        setContent(updated.content);
      }
    } catch (error) {
      reportError(error);
      setFormError(errorMessage(error, SAVE_ERROR));
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (mode.kind !== 'edit' || deleting) return;

    const id = mode.id;
    setDeleting(true);
    setDeleteError('');

    try {
      await notesApi.remove(id);
      setNotes((current) => current.filter((note) => note.id !== id));
      setMode({ kind: 'idle' });
      setTitle('');
      setContent('');
      resetFeedback();
      setConfirmingDelete(false);
    } catch (error) {
      reportError(error);
      setDeleteError(errorMessage(error, 'Не вдалося видалити нотатку. Спробуйте ще раз.'));
    } finally {
      setDeleting(false);
    }
  }

  async function handleSaveMood() {
    if (moodBusy || selectedMood === null || !moodDirty) return;

    setMoodBusy(true);
    setToast(null);

    try {
      await moodApi.saveToday(selectedMood);
      await loadMoods(true);
      setToast({
        type: 'success',
        title: 'Настрій успішно збережено!',
        text: 'Твій запис додано до історії настрою.',
      });
    } catch (error) {
      reportError(error);
      setToast({
        type: 'error',
        title: 'Не вдалося зберегти настрій',
        text: moodErrorText(error),
      });
    } finally {
      setMoodBusy(false);
    }
  }

  const hasNotes = notes.length > 0;
  const saveLabel = saveFailed
    ? 'Спробувати зберегти ще раз'
    : mode.kind === 'create'
      ? 'Зберегти'
      : 'Зберегти зміни';

  return (
    <main className="diary-page">
      <header className="diary-header">
        <a className="diary-brand" href="#home" aria-label="Stellora">
          <img className="diary-brand-star" src={logoIcon} alt="" />
          <span>Stellora</span>
        </a>
      </header>

      <div className="diary-shell">
        <aside className="diary-sidebar" aria-label="Головне меню">
          <nav className="diary-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`diary-nav-item${item.id === 'daily' ? ' is-active' : ''}`}
                aria-current={item.id === 'daily' ? 'page' : undefined}
                onClick={() => {
                  if (item.id !== 'daily') onNavigate?.(item.id);
                }}
              >
                <Icon name={item.icon} className="diary-nav-icon" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="diary-nav-item diary-profile"
            onClick={() => onNavigate?.('profile')}
          >
            <Icon name="user" className="diary-nav-icon" />
            <span>Профіль</span>
          </button>
        </aside>

        <div className="diary-main">
          <section
            className="diary-banner"
            style={{ backgroundImage: `url(${bannerImage})` }}
          >
            <Icon name="daily" className="diary-banner-icon" />
            <h1>Щоденник</h1>
          </section>

          <div className={`diary-content${tab === 'mood' ? ' is-mood' : ''}`}>
            <div className="diary-toolbar">
              <div className="diary-tabs" role="tablist" aria-label="Розділи щоденника">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'notes'}
                  className={`diary-tab${tab === 'notes' ? ' is-active' : ''}`}
                  onClick={() => handleTabChange('notes')}
                >
                  Нотатки
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'mood'}
                  className={`diary-tab${tab === 'mood' ? ' is-active' : ''}`}
                  onClick={() => handleTabChange('mood')}
                >
                  Настрій
                </button>
              </div>

              {tab === 'notes' && (
                <button type="button" className="diary-new-button" onClick={handleNewNote}>
                  <Icon name="plus" className="diary-new-icon" />
                  <span>Нова нотатка</span>
                </button>
              )}
            </div>

            {tab === 'notes' && (
              <section className="diary-panel diary-list-panel" aria-label="Список нотаток">
                <label className="diary-search">
                  <Icon name="search" className="diary-search-icon" />
                  <input
                    type="search"
                    placeholder="Пошук нотаток..."
                    aria-label="Пошук нотаток"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>

                <div className="diary-list-meta">
                  <span>
                    <strong>{loadState === 'ready' ? visibleNotes.length : 0}</strong>{' '}
                    {plural(loadState === 'ready' ? visibleNotes.length : 0, [
                      'нотатка',
                      'нотатки',
                      'нотаток',
                    ])}
                  </span>

                  <button
                    type="button"
                    className="diary-sort"
                    onClick={() => setNewestFirst((current) => !current)}
                  >
                    <Icon name="sort" className="diary-sort-icon" />
                    {newestFirst ? 'Новіші зверху' : 'Старіші зверху'}
                  </button>
                </div>

                {loadState === 'loading' && (
                  <p className="diary-list-state">Завантаження…</p>
                )}

                {loadState === 'error' && (
                  <div className="diary-list-state">
                    <strong>{loadError}</strong>
                    <button type="button" className="diary-link-button" onClick={loadNotes}>
                      Спробувати ще раз
                    </button>
                  </div>
                )}

                {loadState === 'ready' && !hasNotes && (
                  <div className="diary-list-state">
                    <strong>Тут поки немає нотаток ✨</strong>
                    <span>Збережи свої думки, плани або ідеї</span>
                  </div>
                )}

                {loadState === 'ready' && hasNotes && visibleNotes.length === 0 && (
                  <div className="diary-list-state">
                    <strong>Нічого не знайдено</strong>
                    <span>Спробуй змінити запит</span>
                  </div>
                )}

                {visibleNotes.length > 0 && (
                  <ul className="diary-notes">
                    {visibleNotes.map((note) => {
                      const active = mode.kind === 'edit' && mode.id === note.id;

                      return (
                        <li key={note.id}>
                          <button
                            type="button"
                            className={`diary-note${active ? ' is-active' : ''}`}
                            aria-pressed={active}
                            onClick={() => handleSelectNote(note)}
                          >
                            <span className="diary-note-title">{note.title}</span>
                            <span className="diary-note-preview">
                              {notePreview(note.content)}
                            </span>
                            <span className="diary-note-meta">
                              <Icon name="clock" className="diary-note-clock" />
                              {formatNoteDate(note)}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}

            {tab === 'notes' && mode.kind === 'idle' && (
              <section className="diary-panel diary-editor is-idle">
                <img className="diary-idle-image" src={emptyImage} alt="" />

                <div className="diary-idle-title">
                  <span className="diary-idle-line" />
                  <SparkIcon className="diary-idle-spark" />
                  <h2>Обери або створи нотатку</h2>
                  <SparkIcon className="diary-idle-spark" />
                  <span className="diary-idle-line" />
                </div>

                <p>
                  Вибери нотатку зі списку або натисни «Нова нотатка»,
                  <br />
                  щоб почати працювати.
                </p>
              </section>
            )}

            {tab === 'notes' && mode.kind !== 'idle' && (
              <section
                className={`diary-panel diary-editor${mode.kind === 'create' ? ' is-create' : ' is-edit'}`}
              >
                <div className="diary-editor-head">
                  <span className="diary-editor-label">
                    {mode.kind === 'create' ? 'Нова нотатка' : 'Редактор нотатки'}
                  </span>

                  {mode.kind === 'edit' && (
                    <button
                      type="button"
                      className="diary-delete-button"
                      onClick={() => {
                        setDeleteError('');
                        setConfirmingDelete(true);
                      }}
                    >
                      Видалити
                    </button>
                  )}
                </div>

                <input
                  className="diary-title-input"
                  type="text"
                  value={title}
                  maxLength={200}
                  placeholder="Введіть назву нотатки..."
                  aria-label="Назва нотатки"
                  onChange={(event) => {
                    setTitle(event.target.value);
                    resetFeedback();
                  }}
                />

                {mode.kind === 'edit' && <div className="diary-editor-divider" />}

                {formError && (
                  <p className="diary-form-error" role="alert">
                    <Icon name="alert" className="diary-form-error-icon" />
                    <span>{formError}</span>
                  </p>
                )}

                <div className="diary-textarea-wrap">
                  <textarea
                    className="diary-textarea"
                    value={content}
                    placeholder="Почніть писати тут..."
                    aria-label="Текст нотатки"
                    onChange={(event) => {
                      setContent(event.target.value);
                      resetFeedback();
                    }}
                  />
                  <span className="diary-counter">
                    {content.length} {plural(content.length, ['символ', 'символи', 'символів'])}
                  </span>
                </div>

                <div className="diary-editor-footer">
                  {isDirty && !formError ? (
                    <span className="diary-dirty-pill">• Є незбережені зміни</span>
                  ) : (
                    <span />
                  )}

                  <div className="diary-editor-actions">
                    <button type="button" className="diary-btn" onClick={handleCancel}>
                      Скасувати
                    </button>
                    <button
                      type="button"
                      className={`diary-btn diary-btn--save${isDirty || saveFailed ? ' is-dirty' : ''}`}
                      disabled={saving || (!isDirty && !saveFailed)}
                      onClick={handleSave}
                    >
                      <Icon name="check" className="diary-btn-icon" />
                      {saving ? 'Зберігаємо…' : saveLabel}
                    </button>
                  </div>
                </div>
              </section>
            )}

            {tab === 'mood' && (
              <>
                <section className="diary-panel diary-mood-card" aria-label="Запис настрою">
                  <div className="diary-mood-head">
                    <div>
                      <span className="diary-eyebrow">Запис настрою</span>
                      <h2 className="diary-mood-title">Як ти почуваєшся сьогодні?</h2>
                    </div>

                    <button
                      type="button"
                      className={`diary-mood-save${moodDirty ? ' is-ready' : ''}`}
                      disabled={!moodDirty || moodBusy}
                      onClick={handleSaveMood}
                    >
                      <Icon name="check" className="diary-mood-save-icon" />
                      {moodBusy ? 'Зберігаємо…' : 'Зберегти настрій'}
                    </button>
                  </div>

                  <div className="diary-mood-options" role="radiogroup" aria-label="Настрій">
                    {MOODS.map((item) => {
                      const picked = selectedMood === item.score;
                      const stateClass = picked
                        ? moodDirty
                          ? ' is-selected'
                          : ' is-saved'
                        : '';

                      return (
                        <button
                          key={item.score}
                          type="button"
                          role="radio"
                          aria-checked={picked}
                          className={`diary-mood-option${stateClass}`}
                          disabled={moodBusy}
                          onClick={() => setSelectedMood(item.score)}
                        >
                          {picked && moodDirty && (
                            <span className="diary-mood-check" aria-hidden="true">
                              ✓
                            </span>
                          )}
                          <MoodFace score={item.score} className="diary-mood-face" />
                          <span className="diary-mood-label">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {moodsEmpty ? (
                  <section
                    className="diary-panel diary-mood-chart is-empty"
                    aria-label="Динаміка настрою"
                  >
                    <img src={moodChartEmptyImage} alt="" />
                    <p>Графік настрою з’явиться після першого запису</p>
                  </section>
                ) : (
                  <section className="diary-panel diary-mood-chart" aria-label="Динаміка настрою">
                    <span className="diary-eyebrow">Динаміка настрою</span>
                    <h3 className="diary-chart-title">Настрій за тиждень</h3>

                    {moodState === 'loading' && (
                      <p className="diary-mood-hint">Завантаження…</p>
                    )}
                    {moodState === 'error' && (
                      <p className="diary-mood-hint">Дані настрою зараз недоступні.</p>
                    )}
                    {moodState === 'idle' && <MoodChart moods={moods} />}
                  </section>
                )}

                <section
                  className={`diary-panel diary-mood-history-card${moodsEmpty ? ' is-empty' : ''}`}
                  aria-label="Історія настрою"
                >
                  {moodsEmpty ? (
                    <div className="diary-mood-history-empty">
                      <img src={moodHistoryEmptyImage} alt="" />
                      <h3>Твоя історія настрою ще порожня</h3>
                      <p>Обери як ти почуваєшся сьогодні і тут з’явиться перший запис</p>
                    </div>
                  ) : (
                    <>
                      <span className="diary-eyebrow">Історія настрою</span>
                      <h2 className="diary-mood-subtitle">Останні записи</h2>

                      {moodState === 'loading' && (
                        <p className="diary-mood-hint">Завантаження…</p>
                      )}
                      {moodState === 'error' && (
                        <p className="diary-mood-hint">
                          Не вдалося завантажити настрій.{' '}
                          <button
                            type="button"
                            className="diary-link-button"
                            onClick={() => void loadMoods()}
                          >
                            Спробувати ще раз
                          </button>
                        </p>
                      )}

                      <ul className="diary-mood-history">
                        {moodHistory.map((item) => {
                          const mood = MOODS.find((entry) => entry.score === item.score);

                          return (
                            <li key={item.id} className="diary-history-item">
                              <span className="diary-history-icon">
                                <MoodFace score={item.score} className="diary-history-face" />
                              </span>
                              <span className="diary-history-text">
                                <strong>{mood?.label ?? item.score}</strong>
                                <small>
                                  <Icon name="clock" className="diary-note-clock" />
                                  {formatMoodDate(item.recordedOn)}
                                </small>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={`diary-toast is-${toast.type}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <MoodFace
            score={toast.type === 'success' ? 4 : 2}
            className="diary-toast-face"
          />
          <div className="diary-toast-text">
            <strong>{toast.title}</strong>
            <span>{toast.text}</span>
          </div>
          <button
            type="button"
            className="diary-toast-close"
            aria-label="Закрити"
            onClick={() => setToast(null)}
          >
            <Icon name="close" />
          </button>
        </div>
      )}

      {confirmingDelete && (
        <div
          className="diary-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setConfirmingDelete(false);
            }
          }}
        >
          <div
            className="diary-confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="diary-confirm-title"
          >
            <span className="diary-confirm-icon">
              <Icon name="trash" />
            </span>

            <h2 id="diary-confirm-title">Видалити нотатку?</h2>
            <p className="diary-confirm-text">
              Ви впевнені, що хочеш видалити нотатку «{activeNote?.title ?? title}»?
            </p>
            <p className="diary-confirm-warning">Цю дію буде неможливо скасувати.</p>

            {deleteError && (
              <p className="diary-confirm-error" role="alert">
                {deleteError}
              </p>
            )}

            <div className="diary-confirm-actions">
              <button
                type="button"
                className="diary-confirm-cancel"
                disabled={deleting}
                onClick={() => setConfirmingDelete(false)}
              >
                Скасувати
              </button>
              <button
                type="button"
                className="diary-confirm-delete"
                disabled={deleting}
                onClick={handleConfirmDelete}
              >
                {deleting ? 'Видаляємо…' : 'Видалити'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}