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

  const calcCalories = (n: FoodEntry['nutrients']) =>
    Math.round(n.protein * 4 + n.carbs * 4 + n.fat * 9);

  const addEntry = useCallback(
    (partial: Omit<FoodEntry, 'id' | 'date' | 'timestamp'> & { mealType: MealType }): FoodEntry => {
      const entry: FoodEntry = {
        ...partial,
        id: crypto.randomUUID(),
        date: targetDate,
        timestamp: Date.now(),
        nutrients: {
          ...partial.nutrients,
          calories: calcCalories(partial.nutrients),
        },
      };
      saveEntry(userId, entry);
      setEntries(getEntriesForDate(userId, targetDate));
      return entry;
    },
    [userId, targetDate]
  );

  const editEntry = useCallback(
    (updated: FoodEntry) => {
      const fixed: FoodEntry = {
        ...updated,
        nutrients: {
          ...updated.nutrients,
          calories: calcCalories(updated.nutrients),
        },
      };
      updateEntry(userId, fixed);
      setEntries(getEntriesForDate(userId, fixed.date));
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
