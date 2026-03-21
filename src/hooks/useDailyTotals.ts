'use client';

import { useMemo } from 'react';
import { FoodEntry, DailyGoals, Nutrients } from '@/types/food';

export function useDailyTotals(entries: FoodEntry[], goals: DailyGoals) {
  return useMemo(() => {
    const totals: Nutrients = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    for (const entry of entries) {
      totals.calories += entry.nutrients.calories;
      totals.protein += entry.nutrients.protein;
      totals.carbs += entry.nutrients.carbs;
      totals.fat += entry.nutrients.fat;
      totals.fiber += entry.nutrients.fiber;
      totals.sugar += entry.nutrients.sugar;
      totals.sodium += entry.nutrients.sodium;
    }

    const percentages = {
      calories: goals.calories > 0 ? (totals.calories / goals.calories) * 100 : 0,
      protein: goals.protein > 0 ? (totals.protein / goals.protein) * 100 : 0,
      carbs: goals.carbs > 0 ? (totals.carbs / goals.carbs) * 100 : 0,
      fat: goals.fat > 0 ? (totals.fat / goals.fat) * 100 : 0,
      fiber: goals.fiber > 0 ? (totals.fiber / goals.fiber) * 100 : 0,
      sugar: goals.sugar > 0 ? (totals.sugar / goals.sugar) * 100 : 0,
      sodium: goals.sodium > 0 ? (totals.sodium / goals.sodium) * 100 : 0,
    };

    return { totals, percentages };
  }, [entries, goals]);
}
