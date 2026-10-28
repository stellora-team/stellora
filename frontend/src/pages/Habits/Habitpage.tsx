import { useState } from 'react';
import HabitForm from './HabitForm';
import { ALL_DAYS, formatDays, type Habit, type HabitFormValues } from './types';

type Filter = 'all' | 'active' | 'done';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Усі' },
  { id: 'active', label: 'Не виконані' },
  { id: 'done', label: 'Виконані' },
];

// Тимчасові дані, поки немає API (його робить задача "Реалізувати API CRUD звичок")
const INITIAL_HABITS: Habit[] = [
  {
    id: '1',
    name: 'Прочитати 10 сторінок книги',
    icon: '📖',
    description: '',
    days: ALL_DAYS,
    time: '11:00',
    doneToday: true,
    streak: 6,
  },
  {
    id: '2',
    name: 'Випити склянку води',
    icon: '💧',
    description: 'Одразу після пробудження',
    days: ALL_DAYS,
    time: '08:00',
    doneToday: true,
    streak: 12,
  },
  {
    id: '3',
    name: 'Пробіжка',
    icon: '🏃',
    description: '',
    days: [0, 2, 4],
    time: '19:00',
    doneToday: false,
    streak: 0,
  },
];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [filter, setFilter] = useState<Filter>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  const doneCount = habits.filter((h) => h.doneToday).length;

  const visibleHabits = habits.filter((h) => {
    if (filter === 'active') return !h.doneToday;
    if (filter === 'done') return h.doneToday;
    return true;
  });

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(habit: Habit) {
    setEditing(habit);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function handleSubmit(values: HabitFormValues) {
    if (editing) {
      setHabits((prev) =>
        prev.map((h) => (h.id === editing.id ? { ...h, ...values } : h)),
      );
    } else {
      setHabits((prev) => [
        ...prev,
        { ...values, id: crypto.randomUUID(), doneToday: false, streak: 0 },
      ]);
    }
    closeForm();
  }

  function toggleDone(id: string) {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              doneToday: !h.doneToday,
              streak: h.doneToday ? Math.max(0, h.streak - 1) : h.streak + 1,
            }
          : h,
      ),
    );
  }

  function handleDelete(habit: Habit) {
    if (!window.confirm(`Видалити звичку «${habit.name}»?`)) return;
    setHabits((prev) => prev.filter((h) => h.id !== habit.id));
  }

  return (
    <section className="w-full max-w-[860px] mx-auto p-6 text-white">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Мої звички</h1>
          <p className="text-sm text-[#EAE5FF]/70 mt-1">
            Сьогодні виконано {doneCount} з {habits.length}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-6 py-3 rounded-full font-bold bg-gradient-to-r from-[#7b32d9] to-[#b240e5] hover:opacity-90 transition-opacity"
        >
          Нова звичка
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              filter === id
                ? 'border-[#A749EE] bg-[#A749EE]/20'
                : 'border-[#443869] text-[#EAE5FF]/70 hover:border-[#7454C5]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-[24px] bg-[#0c0a1d]/80 border border-[#7454C5]/40 backdrop-blur-md p-4">
        {visibleHabits.length === 0 ? (
          <div className="py-12 text-center text-[#EAE5FF]/70">
            <p className="mb-4">
              {habits.length === 0
                ? 'Тут поки порожньо. Створи першу звичку.'
                : 'У цьому списку немає звичок.'}
            </p>
            {habits.length === 0 && (
              <button
                type="button"
                onClick={openCreate}
                className="px-6 py-3 rounded-full border border-[#7454C5]/40 hover:bg-white/5 transition-colors"
              >
                Створити звичку
              </button>
            )}
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-[#443869]/60">
            {visibleHabits.map((habit) => (
              <li key={habit.id} className="flex items-center gap-4 py-4 px-2">
                <input
                  type="checkbox"
                  checked={habit.doneToday}
                  onChange={() => toggleDone(habit.id)}
                  aria-label={`Позначити «${habit.name}» виконаною`}
                  className="accent-[#A749EE] w-[20px] h-[20px] cursor-pointer shrink-0"
                />

                <span className="text-2xl shrink-0" aria-hidden="true">
                  {habit.icon}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={`font-medium truncate ${
                      habit.doneToday ? 'line-through text-[#EAE5FF]/50' : ''
                    }`}
                  >
                    {habit.name}
                  </p>
                  <p className="text-xs text-[#EAE5FF]/60 mt-1">
                    {formatDays(habit.days)}
                    {habit.time && ` · ${habit.time}`}
                  </p>
                </div>

                <span className="text-sm text-[#EAE5FF]/70 shrink-0 hidden sm:block">
                  🔥 {habit.streak}
                </span>

                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(habit)}
                    className="px-3 py-1.5 rounded-lg text-sm text-[#EAE5FF]/70 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Змінити
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(habit)}
                    className="px-3 py-1.5 rounded-lg text-sm text-red-300/80 hover:bg-red-500/10 hover:text-red-200 transition-colors"
                  >
                    Видалити
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {formOpen && (
        <HabitForm habit={editing} onSubmit={handleSubmit} onCancel={closeForm} />
      )}
    </section>
  );
}