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

export function useFoodLog(userId: string, date?: string) {
  const targetDate = date || getTodayString();
  const [entries, setEntries] = useState<FoodEntry[]>(() =>
    userId ? getEntriesForDate(userId, targetDate) : []
  );

  const refresh = useCallback(() => {
    if (userId) setEntries(getEntriesForDate(userId, targetDate));
  }, [userId, targetDate]);

  const addEntry = useCallback(
    (partial: Omit<FoodEntry, 'id' | 'date' | 'timestamp'> & { mealType: MealType }): FoodEntry => {
      const entry: FoodEntry = {
        ...partial,
        id: crypto.randomUUID(),
        date: targetDate,
        timestamp: Date.now(),
      };
      saveEntry(userId, entry);
      setEntries(getEntriesForDate(userId, targetDate));
      return entry;
    },
    [userId, targetDate]
  );

  const editEntry = useCallback(
    (updated: FoodEntry) => {
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

  return { entries, addEntry, editEntry, removeEntry, refresh };
}
