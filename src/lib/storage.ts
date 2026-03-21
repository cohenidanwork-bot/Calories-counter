import { FoodEntry, DailyGoals, DEFAULT_GOALS } from '@/types/food';

function getLogKey(date: string): string {
  return `calories_log_${date}`;
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getEntriesForDate(date: string): FoodEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getLogKey(date));
    return raw ? (JSON.parse(raw) as FoodEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: FoodEntry): void {
  if (typeof window === 'undefined') return;
  const entries = getEntriesForDate(entry.date);
  entries.push(entry);
  localStorage.setItem(getLogKey(entry.date), JSON.stringify(entries));
}

export function deleteEntry(id: string, date: string): void {
  if (typeof window === 'undefined') return;
  const entries = getEntriesForDate(date).filter((e) => e.id !== id);
  localStorage.setItem(getLogKey(date), JSON.stringify(entries));
}

export function getGoals(): DailyGoals {
  if (typeof window === 'undefined') return DEFAULT_GOALS;
  try {
    const raw = localStorage.getItem('calories_goals');
    if (!raw) return DEFAULT_GOALS;
    return { ...DEFAULT_GOALS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_GOALS;
  }
}

export function saveGoals(goals: DailyGoals): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('calories_goals', JSON.stringify(goals));
}
