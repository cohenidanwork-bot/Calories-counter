'use client';

import { useState, useCallback } from 'react';
import { FoodEntry } from '@/types/food';
import {
  getEntriesForDate,
  saveEntry,
  deleteEntry,
  getTodayString,
} from '@/lib/storage';

export function useFoodLog() {
  const today = getTodayString();
  const [entries, setEntries] = useState<FoodEntry[]>(() => getEntriesForDate(today));

  const addEntry = useCallback(
    (partial: Omit<FoodEntry, 'id' | 'date' | 'timestamp'>): FoodEntry => {
      const entry: FoodEntry = {
        ...partial,
        id: crypto.randomUUID(),
        date: today,
        timestamp: Date.now(),
      };
      saveEntry(entry);
      setEntries(getEntriesForDate(today));
      return entry;
    },
    [today]
  );

  const removeEntry = useCallback(
    (id: string) => {
      deleteEntry(id, today);
      setEntries(getEntriesForDate(today));
    },
    [today]
  );

  return { entries, addEntry, removeEntry };
}
