import { FoodEntry, DailyGoals, DEFAULT_GOALS, Recipe } from '@/types/food';

function prefix(userId: string): string {
  return `u_${userId}_`;
}

function getLogKey(userId: string, date: string): string {
  return `${prefix(userId)}log_${date}`;
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function offsetDate(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T12:00:00');
  date.setDate(date.getDate() + days);
  return getDateString(date);
}

export function getEntriesForDate(userId: string, date: string): FoodEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getLogKey(userId, date));
    return raw ? (JSON.parse(raw) as FoodEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveEntry(userId: string, entry: FoodEntry): void {
  if (typeof window === 'undefined') return;
  const entries = getEntriesForDate(userId, entry.date);
  entries.push(entry);
  localStorage.setItem(getLogKey(userId, entry.date), JSON.stringify(entries));
}

export function updateEntry(userId: string, updated: FoodEntry): void {
  if (typeof window === 'undefined') return;
  const entries = getEntriesForDate(userId, updated.date).map((e) =>
    e.id === updated.id ? updated : e
  );
  localStorage.setItem(getLogKey(userId, updated.date), JSON.stringify(entries));
}

export function deleteEntry(userId: string, id: string, date: string): void {
  if (typeof window === 'undefined') return;
  const entries = getEntriesForDate(userId, date).filter((e) => e.id !== id);
  localStorage.setItem(getLogKey(userId, date), JSON.stringify(entries));
}

export function getGoals(userId: string): DailyGoals {
  if (typeof window === 'undefined') return DEFAULT_GOALS;
  try {
    const raw = localStorage.getItem(`${prefix(userId)}goals`);
    if (!raw) return DEFAULT_GOALS;
    return { ...DEFAULT_GOALS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_GOALS;
  }
}

export function saveGoals(userId: string, goals: DailyGoals): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${prefix(userId)}goals`, JSON.stringify(goals));
}

// Recipe storage
export function getRecipes(userId: string): Recipe[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${prefix(userId)}recipes`);
    return raw ? (JSON.parse(raw) as Recipe[]) : [];
  } catch {
    return [];
  }
}

export function saveRecipe(userId: string, recipe: Recipe): void {
  if (typeof window === 'undefined') return;
  const recipes = getRecipes(userId);
  const existing = recipes.findIndex((r) => r.id === recipe.id);
  if (existing >= 0) {
    recipes[existing] = recipe;
  } else {
    recipes.push(recipe);
  }
  localStorage.setItem(`${prefix(userId)}recipes`, JSON.stringify(recipes));
}

export function deleteRecipe(userId: string, id: string): void {
  if (typeof window === 'undefined') return;
  const recipes = getRecipes(userId).filter((r) => r.id !== id);
  localStorage.setItem(`${prefix(userId)}recipes`, JSON.stringify(recipes));
}
