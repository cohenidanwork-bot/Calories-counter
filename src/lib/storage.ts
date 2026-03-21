import { FoodEntry, DailyGoals, DEFAULT_GOALS, Recipe } from '@/types/food';

function getLogKey(date: string): string {
  return `calories_log_${date}`;
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

export function updateEntry(updated: FoodEntry): void {
  if (typeof window === 'undefined') return;
  const entries = getEntriesForDate(updated.date).map((e) =>
    e.id === updated.id ? updated : e
  );
  localStorage.setItem(getLogKey(updated.date), JSON.stringify(entries));
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

// Recipe storage
export function getRecipes(): Recipe[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('calories_recipes');
    return raw ? (JSON.parse(raw) as Recipe[]) : [];
  } catch {
    return [];
  }
}

export function saveRecipe(recipe: Recipe): void {
  if (typeof window === 'undefined') return;
  const recipes = getRecipes();
  const existing = recipes.findIndex((r) => r.id === recipe.id);
  if (existing >= 0) {
    recipes[existing] = recipe;
  } else {
    recipes.push(recipe);
  }
  localStorage.setItem('calories_recipes', JSON.stringify(recipes));
}

export function deleteRecipe(id: string): void {
  if (typeof window === 'undefined') return;
  const recipes = getRecipes().filter((r) => r.id !== id);
  localStorage.setItem('calories_recipes', JSON.stringify(recipes));
}
