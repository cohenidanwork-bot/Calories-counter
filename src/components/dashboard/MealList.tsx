'use client';

import { useState } from 'react';
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
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverMeal, setDragOverMeal] = useState<MealType | null>(null);

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

  const draggingEntry = draggingId ? entries.find((e) => e.id === draggingId) : null;

  // Show all groups while dragging so every meal type is a valid drop target
  const visibleGroups = draggingId
    ? MEAL_ORDER
    : MEAL_ORDER.filter((mt) => grouped[mt].length > 0);

  const handleDrop = (targetMeal: MealType) => {
    if (!draggingEntry || draggingEntry.mealType === targetMeal) {
      setDraggingId(null);
      setDragOverMeal(null);
      return;
    }
    onEdit({ ...draggingEntry, mealType: targetMeal });
    setDraggingId(null);
    setDragOverMeal(null);
  };

  return (
    <div className="space-y-3">
      {visibleGroups.map((mt) => {
        const config = MEAL_TYPES.find((m) => m.value === mt)!;
        const groupEntries = [...grouped[mt]].sort((a, b) => a.timestamp - b.timestamp);
        const groupCalories = groupEntries.reduce((sum, e) => sum + e.nutrients.calories, 0);
        const isOver = dragOverMeal === mt;
        const isDraggingIntoEmpty = isOver && grouped[mt].length === 0;

        return (
          <Card
            key={mt}
            padding={false}
            className={`overflow-hidden transition-colors ${isOver ? 'ring-2 ring-green-400 bg-green-50/30' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverMeal(mt); }}
            onDragLeave={(e) => {
              // only clear if leaving the card entirely
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverMeal(null);
            }}
            onDrop={() => handleDrop(mt)}
          >
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{config.emoji}</span>
                <h2 className="font-semibold text-gray-700 text-sm">{config.label}</h2>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {grouped[mt].length > 0 ? `${Math.round(groupCalories)} kcal` : ''}
              </span>
            </div>

            <div className="px-4">
              {groupEntries.map((entry) => (
                <MealItem
                  key={entry.id}
                  entry={entry}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onDuplicate={onDuplicate}
                  isDragging={draggingId === entry.id}
                  onDragStart={() => setDraggingId(entry.id)}
                  onDragEnd={() => { setDraggingId(null); setDragOverMeal(null); }}
                />
              ))}

              {isDraggingIntoEmpty && (
                <div className="py-4 text-center text-xs text-green-500 font-medium">
                  Drop here to move to {config.label}
                </div>
              )}

              {!isDraggingIntoEmpty && grouped[mt].length === 0 && draggingId && (
                <div className="py-4 text-center text-xs text-gray-300">
                  Drop here to move to {config.label}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
