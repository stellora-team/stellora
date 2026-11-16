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
}

export async function loadHomeData(): Promise<HomeData> {
  const [dashboard, habitPage, categories] = await Promise.all([
    authenticatedRequest<DashboardResponse>('/api/dashboard'),
    authenticatedRequest<HabitPageResponse>('/api/habits?page=1&pageSize=100'),
    authenticatedRequest<ApiCategory[]>('/api/categories'),
  ]);

  return {
    dashboard,
    habits: habitPage.items,
    categories,
  };
}

export async function createHabit(details: CreateHabitDetails): Promise<ApiHabit> {
  return authenticatedRequest<ApiHabit>('/api/habits', {
    method: 'POST',
    body: JSON.stringify(details),
  });
}

export async function updateHabit(
  id: string,
  details: CreateHabitDetails,
): Promise<ApiHabit> {
  return authenticatedRequest<ApiHabit>(`/api/habits/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(details),
  });
}

export async function deleteHabit(id: string): Promise<void> {
  await authenticatedRequest<void>(`/api/habits/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
