export type Habit = {
  id: string;
  name: string;
  icon: string;
  description: string;
  days: number[];
  time: string;
  doneToday: boolean;
  streak: number;
};

export type HabitFormValues = Pick<
  Habit,
  'name' | 'icon' | 'description' | 'days' | 'time'
>;

export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export const HABIT_ICONS = ['📖', '💧', '🏃', '🧘', '💤', '🥗', '✍️', '🎸', '💻', '🌿'];

export function formatDays(days: number[]): string {
  if (days.length === 7) return 'Щодня';
  return [...days]
    .sort((a, b) => a - b)
    .map((d) => WEEKDAYS[d])
    .join(', ');
}