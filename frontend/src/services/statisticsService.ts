import { authenticatedRequest, ApiError } from './authService';

export type StatisticsPeriod = '7d' | '30d' | 'all';

export const STATISTICS_PERIODS: { key: StatisticsPeriod; label: string }[] = [
  { key: '7d', label: '7 днів' },
  { key: '30d', label: '30 днів' },
  { key: 'all', label: 'Весь час' },
];

export type ChartPoint = { label: string; value: number };

export type StatisticsData = {
  summary: {
    tasks: { value: number; completion: number };
    habits: number;
    goals: number;
    focusHours: number;
    focusSessions: number;
  };
  taskBreakdown: { completed: number; inProgress: number; notStarted: number };
  habits: ChartPoint[];
  goals: { title: string; progress: number }[];
  focus: ChartPoint[];
};

type StoredTask = {
  date: string;
  done: boolean;
};

type StoredFocusSession = {
  date: string;
  minutes: number;
};

type ApiHabit = {
  createdAtUtc: string;
  scheduledDays: number[];
};

const WEEK_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getPeriodStart(period: StatisticsPeriod, now: Date): Date | null {
  if (period === 'all') return null;
  return startOfDay(addDays(now, period === '7d' ? -6 : -29));
}

function isInPeriod(date: string, periodStart: Date | null, now: Date): boolean {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return false;
  const day = startOfDay(parsed);
  return (!periodStart || day >= periodStart) && day <= startOfDay(now);
}

function getMondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function getWeekLabels(period: StatisticsPeriod): string[] {
  if (period === '7d') return WEEK_LABELS;
  if (period === '30d') return ['1 тиж.', '2 тиж.', '3 тиж.', '4 тиж.', '5 тиж.'];
  return ['1 міс.', '2 міс.', '3 міс.', '4 міс.', '5 міс.', '6 міс.'];
}

function getBucketIndex(date: Date, period: StatisticsPeriod, now: Date): number {
  if (period === '7d') return getMondayIndex(date);

  const ageInDays = Math.max(
    0,
    Math.floor(
      (startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000,
    ),
  );
  if (period === '30d') return Math.min(4, Math.floor((29 - ageInDays) / 7));

  const monthAge =
    (now.getFullYear() - date.getFullYear()) * 12 +
    now.getMonth() -
    date.getMonth();
  return Math.min(5, Math.max(0, 5 - monthAge));
}

function buildChart(
  dates: { date: string; value: number }[],
  period: StatisticsPeriod,
  now: Date,
): ChartPoint[] {
  const labels = getWeekLabels(period);
  const values = labels.map(() => 0);

  for (const item of dates) {
    const date = new Date(item.date);
    if (Number.isNaN(date.getTime()) || !isInPeriod(item.date, getPeriodStart(period, now), now)) {
      continue;
    }
    const index = getBucketIndex(date, period, now);
    if (index >= 0 && index < values.length) values[index] += item.value;
  }

  return labels.map((label, index) => ({ label, value: values[index] }));
}

async function loadHabits(): Promise<ApiHabit[]> {
  try {
    const response = await authenticatedRequest<{ items: ApiHabit[] }>(
      '/api/habits?page=1&pageSize=100',
    );
    return response.items;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return [];
    throw error;
  }
}

function calculateTaskStats(
  tasks: StoredTask[],
  period: StatisticsPeriod,
  now: Date,
) {
  const periodStart = getPeriodStart(period, now);
  const filtered = tasks.filter((task) => isInPeriod(task.date, periodStart, now));
  const completed = filtered.filter((task) => task.done).length;
  const notStarted = filtered.filter(
    (task) => !task.done && new Date(`${task.date}T23:59:59`) > now,
  ).length;
  const inProgress = filtered.length - completed - notStarted;

  return {
    total: filtered.length,
    completion: filtered.length ? Math.round((completed / filtered.length) * 100) : 0,
    breakdown: { completed, inProgress, notStarted },
  };
}

function calculateHabitStats(
  habits: ApiHabit[],
  period: StatisticsPeriod,
  now: Date,
): ChartPoint[] {
  const values = getWeekLabels(period).map(() => 0);
  const periodStart = getPeriodStart(period, now) ?? startOfDay(addDays(now, -179));
  const cursor = new Date(periodStart);

  while (cursor <= now) {
    const weekday = cursor.getDay() === 0 ? 7 : cursor.getDay();
    for (const habit of habits) {
      const createdAt = new Date(habit.createdAtUtc);
      if (!Number.isNaN(createdAt.getTime()) && startOfDay(createdAt) > cursor) {
        continue;
      }
      if (habit.scheduledDays.includes(weekday)) {
        const index = getBucketIndex(cursor, period, now);
        if (index >= 0 && index < values.length) values[index] += 1;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return getWeekLabels(period).map((label, index) => ({ label, value: values[index] }));
}

export function createEmptyStatistics(period: StatisticsPeriod): StatisticsData {
  const labels = getWeekLabels(period);
  const zeros = labels.map((label) => ({ label, value: 0 }));
  return {
    summary: {
      tasks: { value: 0, completion: 0 },
      habits: 0,
      goals: 0,
      focusHours: 0,
      focusSessions: 0,
    },
    taskBreakdown: { completed: 0, inProgress: 0, notStarted: 0 },
    habits: zeros,
    goals: [],
    focus: zeros.map((point) => ({ ...point })),
  };
}

export function isStatisticsEmpty(data: StatisticsData): boolean {
  return (
    data.summary.tasks.value === 0 &&
    data.summary.habits === 0 &&
    data.summary.goals === 0 &&
    data.summary.focusSessions === 0
  );
}

export async function getStatistics(
  userId: string,
  period: StatisticsPeriod,
): Promise<StatisticsData> {
  const now = new Date();
  const tasks = readLocalStorage<StoredTask[]>(`stellora:${userId}:tasks`, []);
  const focusSessions = readLocalStorage<StoredFocusSession[]>(
    `stellora:${userId}:focus`,
    [],
  );
  const habits = await loadHabits();
  const taskStats = calculateTaskStats(tasks, period, now);
  const periodStart = getPeriodStart(period, now);
  const filteredFocus = focusSessions.filter((session) =>
    isInPeriod(session.date, periodStart, now),
  );
  const focusMinutes = filteredFocus.reduce(
    (total, session) => total + Math.max(0, session.minutes || 0),
    0,
  );

  return {
    summary: {
      tasks: { value: taskStats.total, completion: taskStats.completion },
      habits: habits.length,
      goals: 0,
      focusHours: Math.round((focusMinutes / 60) * 10) / 10,
      focusSessions: filteredFocus.length,
    },
    taskBreakdown: taskStats.breakdown,
    habits: calculateHabitStats(habits, period, now),
    goals: [],
    focus: buildChart(
      filteredFocus.map((session) => ({ date: session.date, value: session.minutes })),
      period,
      now,
    ),
  };
}
