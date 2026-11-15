import { authenticatedRequest } from './authService';

export interface HabitCompletion {
  id: string;
  completedOn: string;
  createdAtUtc: string;
}

export async function getHabitHistory(
  habitId: string,
  pageSize = 100,
): Promise<HabitCompletion[]> {
  return authenticatedRequest<HabitCompletion[]>(
    `/api/habits/${encodeURIComponent(habitId)}/completions?page=1&pageSize=${pageSize}`,
  );
}

export async function setHabitCompletedToday(
  habitId: string,
  completed: boolean,
): Promise<void> {
  await authenticatedRequest<void>(
    `/api/habits/${encodeURIComponent(habitId)}/completions/today`,
    { method: completed ? 'PUT' : 'DELETE' },
  );
}
