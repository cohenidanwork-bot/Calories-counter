'use client';

import { FoodEntry } from '@/types/food';
import { MealItem } from './MealItem';
import { Card } from '@/components/ui/Card';

interface MealListProps {
  entries: FoodEntry[];
  onDelete: (id: string) => void;
}

export function MealList({ entries, onDelete }: MealListProps) {
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

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-700 text-sm">Today&apos;s Meals</h2>
      </div>
      <div className="px-4">
        {[...entries].reverse().map((entry) => (
          <MealItem key={entry.id} entry={entry} onDelete={onDelete} />
        ))}
      </div>
    </Card>
  );
}
