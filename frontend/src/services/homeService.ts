import { authenticatedRequest } from './authService';

export interface ApiCategory {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
}

export interface ApiHabit {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
  scheduledDays: number[];
}

export interface DashboardHabit {
  id: string;
  title: string;
  categoryId: string | null;
  isCompletedToday: boolean;
}

export interface DashboardResponse {
  displayName: string;
  timeZone: string;
  today: string;
  localNow: string;
  habits: {
    totalCount: number;
    completedTodayCount: number;
    scheduledTodayCount: number;
    completedScheduledTodayCount: number;
    items: DashboardHabit[];
  };
}

interface HabitPageResponse {
  items: ApiHabit[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface CreateHabitDetails {
  title: string;
  description: string;
  categoryId?: string;
  scheduledDays: number[];
}

export interface HomeData {
  dashboard: DashboardResponse;
  habits: ApiHabit[];
  categories: ApiCategory[];
  moodScore: number | null;
}

export async function loadHomeData(): Promise<HomeData> {
  const [dashboard, habitPage, categories, moods] = await Promise.all([
    authenticatedRequest<DashboardResponse>('/api/dashboard'),
    authenticatedRequest<HabitPageResponse>('/api/habits?page=1&pageSize=100'),
    authenticatedRequest<ApiCategory[]>('/api/categories'),
    authenticatedRequest<{ recordedOn: string; score: number }[]>(
      '/api/moods?page=1&pageSize=14',
    ),
  ]);

  return {
    dashboard,
    habits: habitPage.items,
    categories,
    moodScore: moods.find((mood) => mood.recordedOn === dashboard.today)?.score ?? null,
  };
}

export async function saveTodayMood(score: number): Promise<void> {
  await authenticatedRequest<void>('/api/moods/today', {
    method: 'PUT',
    body: JSON.stringify({ score }),
  });
}

export async function createHabit(details: CreateHabitDetails): Promise<ApiHabit> {
  return authenticatedRequest<ApiHabit>('/api/habits', {
    method: 'POST',
    body: JSON.stringify(details),
  });
}

export async function deleteHabit(id: string): Promise<void> {
  await authenticatedRequest<void>(`/api/habits/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function setHabitCompletedToday(
  id: string,
  completed: boolean,
): Promise<void> {
  await authenticatedRequest<void>(
    `/api/habits/${encodeURIComponent(id)}/completions/today`,
    { method: completed ? 'PUT' : 'DELETE' },
  );
}

export interface CalendarHabit {
  id: string;
  title: string;
  categoryId: number | null;
  isScheduled: boolean;
  isCompleted: boolean;
}

export interface CalendarDay {
  date: string;
  habits: CalendarHabit[];
}

export interface CalendarResponse {
  from: string;
  to: string;
  timeZone: string;
  days: CalendarDay[];
}

export function loadCalendar(from: string, to: string): Promise<CalendarResponse> {
  const params = new URLSearchParams({ from, to });
  return authenticatedRequest<CalendarResponse>(`/api/calendar?${params}`);
}