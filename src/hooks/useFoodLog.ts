'use client';

import { useState, useCallback } from 'react';
import { FoodEntry, MealType } from '@/types/food';
import {
  getEntriesForDate,
  saveEntry,
  updateEntry,
  deleteEntry,
  getTodayString,
} from '@/lib/storage';

export function useFoodLog(date?: string) {
  const targetDate = date || getTodayString();
  const [entries, setEntries] = useState<FoodEntry[]>(() => getEntriesForDate(targetDate));

  const refresh = useCallback(() => {
    setEntries(getEntriesForDate(targetDate));
  }, [targetDate]);

  const addEntry = useCallback(
    (partial: Omit<FoodEntry, 'id' | 'date' | 'timestamp'> & { mealType: MealType }): FoodEntry => {
      const entry: FoodEntry = {
        ...partial,
        id: crypto.randomUUID(),
        date: targetDate,
        timestamp: Date.now(),
      };
      saveEntry(entry);
      setEntries(getEntriesForDate(targetDate));
      return entry;
    },
    [targetDate]
  );

  const editEntry = useCallback(
    (updated: FoodEntry) => {
      updateEntry(updated);
      setEntries(getEntriesForDate(updated.date));
    },
    []
  );

  const removeEntry = useCallback(
    (id: string) => {
      deleteEntry(id, targetDate);
      setEntries(getEntriesForDate(targetDate));
    },
    [targetDate]
  );

  return { entries, addEntry, editEntry, removeEntry, refresh };
}
