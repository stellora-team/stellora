import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  ALL_DAYS,
  HABIT_ICONS,
  WEEKDAYS,
  type Habit,
  type HabitFormValues,
} from './types';

type HabitFormProps = {
  habit?: Habit | null;
  onSubmit: (values: HabitFormValues) => void;
  onCancel: () => void;
};

const inputClass =
  'w-full bg-[#1b1736]/90 border border-[#443869] rounded-xl py-3 px-4 text-[#EAE5FF] placeholder:text-[#EAE5FF]/50 focus:outline-none focus:border-[#A749EE] transition-colors';

export default function HabitForm({ habit, onSubmit, onCancel }: HabitFormProps) {
  const isEdit = Boolean(habit);

  const [values, setValues] = useState<HabitFormValues>({
    name: habit?.name ?? '',
    icon: habit?.icon ?? HABIT_ICONS[0],
    description: habit?.description ?? '',
    days: habit?.days ?? ALL_DAYS,
    time: habit?.time ?? '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function toggleDay(day: number) {
    setValues((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!values.name.trim()) {
      setError('Введіть назву звички');
      return;
    }
    if (values.days.length === 0) {
      setError('Оберіть хоча б один день');
      return;
    }

    onSubmit({ ...values, name: values.name.trim() });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-form-title"
        className="w-full max-w-[480px] max-h-full overflow-y-auto p-8 rounded-[24px] bg-[#0c0a1d] border border-[#7454C5]/40 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="habit-form-title" className="text-2xl font-bold mb-6">
          {isEdit ? 'Редагувати звичку' : 'Нова звичка'}
        </h3>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="habit-name" className="text-sm text-[#EAE5FF]/70">
              Назва
            </label>
            <input
              id="habit-name"
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange}
              placeholder="Наприклад, Читати 20 хвилин"
              maxLength={60}
              className={inputClass}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#EAE5FF]/70">Іконка</span>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  aria-pressed={values.icon === icon}
                  onClick={() => setValues((prev) => ({ ...prev, icon }))}
                  className={`w-11 h-11 rounded-xl text-xl border transition-colors ${
                    values.icon === icon
                      ? 'border-[#A749EE] bg-[#A749EE]/20'
                      : 'border-[#443869] bg-[#1b1736]/90 hover:border-[#7454C5]'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#EAE5FF]/70">Дні</span>
              <button
                type="button"
                onClick={() => setValues((prev) => ({ ...prev, days: ALL_DAYS }))}
                className="text-xs text-[#A749EE] hover:underline"
              >
                Щодня
              </button>
            </div>
            <div className="flex gap-2">
              {WEEKDAYS.map((label, day) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={values.days.includes(day)}
                  onClick={() => toggleDay(day)}
                  className={`flex-1 py-2 rounded-xl text-sm border transition-colors ${
                    values.days.includes(day)
                      ? 'border-[#A749EE] bg-[#A749EE]/20 text-white'
                      : 'border-[#443869] bg-[#1b1736]/90 text-[#EAE5FF]/60 hover:border-[#7454C5]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="habit-time" className="text-sm text-[#EAE5FF]/70">
              Нагадування
            </label>
            <input
              id="habit-time"
              name="time"
              type="time"
              value={values.time}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="habit-description" className="text-sm text-[#EAE5FF]/70">
              Нотатка
            </label>
            <textarea
              id="habit-description"
              name="description"
              value={values.description}
              onChange={handleChange}
              rows={3}
              maxLength={200}
              placeholder="Необов’язково"
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3.5 rounded-full border border-[#7454C5]/40 hover:bg-white/5 transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-full font-bold bg-gradient-to-r from-[#7b32d9] to-[#b240e5] hover:opacity-90 transition-opacity"
            >
              {isEdit ? 'Зберегти зміни' : 'Створити звичку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}