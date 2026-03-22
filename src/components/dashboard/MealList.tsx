'use client';

import { FoodEntry, MealType, MEAL_TYPES } from '@/types/food';
import { MealItem } from './MealItem';
import { Card } from '@/components/ui/Card';

interface MealListProps {
  entries: FoodEntry[];
  onDelete: (id: string) => void;
  onEdit: (updated: FoodEntry) => void;
  onDuplicate: (entry: FoodEntry) => void;
}

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export function MealList({ entries, onDelete, onEdit, onDuplicate }: MealListProps) {
  if (entries.length === 0) {
    return (
      <Card className="text-center py-10">
        <svg className="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-gray-400 text-sm font-medium">No meals logged yet</p>
        <p className="text-gray-300 text-xs mt-1">Tap + to log your first meal</p>
      </Card>
    );
  }

  // Group entries by mealType
  const grouped: Record<MealType, FoodEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  for (const entry of entries) {
    const mt = entry.mealType || 'snack';
    grouped[mt].push(entry);
  }

  const visibleGroups = MEAL_ORDER.filter((mt) => grouped[mt].length > 0);

  return (
    <div className="space-y-3">
      {visibleGroups.map((mt) => {
        const config = MEAL_TYPES.find((m) => m.value === mt)!;
        const groupEntries = [...grouped[mt]].sort((a, b) => a.timestamp - b.timestamp);
        const groupCalories = groupEntries.reduce((sum, e) => sum + e.nutrients.calories, 0);

        return (
          <Card key={mt} padding={false} className="overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{config.emoji}</span>
                <h2 className="font-semibold text-gray-700 text-sm">{config.label}</h2>
              </div>
              <span className="text-xs text-gray-400 font-medium">{Math.round(groupCalories)} kcal</span>
            </div>
            <div className="px-4">
              {groupEntries.map((entry) => (
                <MealItem key={entry.id} entry={entry} onDelete={onDelete} onEdit={onEdit} onDuplicate={onDuplicate} />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
