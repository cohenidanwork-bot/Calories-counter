'use client';

import { useState, useCallback, useEffect } from 'react';
import { FoodEntry, MealType } from '@/types/food';
import {
  getEntriesForDate,
  saveEntry,
  updateEntry,
  deleteEntry,
  getTodayString,
} from '@/lib/storage';

export function useFoodLog(userId: string, date?: string) {
  const targetDate = date || getTodayString();
  const [entries, setEntries] = useState<FoodEntry[]>(() =>
    userId ? getEntriesForDate(userId, targetDate) : []
  );

  useEffect(() => {
    setEntries(userId ? getEntriesForDate(userId, targetDate) : []);
  }, [userId, targetDate]);

  /**
   * Calculates calories from macros using net-carb Atwater factors.
   * Net carbs = total carbs − fiber (fiber ≈ 0 kcal/g per FDA).
   * Use this ONLY as a fallback when no calories value is available from
   * AI or a nutrition database.
   */
  const calcCalories = (n: FoodEntry['nutrients']) =>
    Math.round(n.protein * 4 + Math.max(0, n.carbs - n.fiber) * 4 + n.fat * 9);

  const addEntry = useCallback(
    (partial: Omit<FoodEntry, 'id' | 'date' | 'timestamp'> & { mealType: MealType }): FoodEntry => {
      // Preserve calories from the AI/database source; only fall back to the
      // Atwater formula when the upstream value is missing or zero.
      const calories =
        partial.nutrients.calories > 0
          ? partial.nutrients.calories
          : calcCalories(partial.nutrients);

      const entry: FoodEntry = {
        ...partial,
        id: crypto.randomUUID(),
        date: targetDate,
        timestamp: Date.now(),
        nutrients: { ...partial.nutrients, calories },
      };
      saveEntry(userId, entry);
      setEntries(getEntriesForDate(userId, targetDate));
      return entry;
    },
    [userId, targetDate]
  );

  const editEntry = useCallback(
    (updated: FoodEntry) => {
      // Trust the calories stored in the updated entry (set by the edit modal
      // which already recomputes them from the user-edited macros).
      updateEntry(userId, updated);
      setEntries(getEntriesForDate(userId, updated.date));
    },
    [userId]
  );

  const removeEntry = useCallback(
    (id: string) => {
      deleteEntry(userId, id, targetDate);
      setEntries(getEntriesForDate(userId, targetDate));
    },
    [userId, targetDate]
  );

  return { entries, addEntry, editEntry, removeEntry };
}
