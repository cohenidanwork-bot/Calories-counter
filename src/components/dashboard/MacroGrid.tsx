'use client';

import { Nutrients, DailyGoals } from '@/types/food';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface MacroGridProps {
  totals: Nutrients;
  goals: DailyGoals;
}

const MACROS = [
  { key: 'protein' as const, label: 'Protein', unit: 'g', color: 'blue' as const },
  { key: 'carbs' as const, label: 'Carbs', unit: 'g', color: 'amber' as const },
  { key: 'fat' as const, label: 'Fat', unit: 'g', color: 'orange' as const },
  { key: 'fiber' as const, label: 'Fiber', unit: 'g', color: 'green' as const },
  { key: 'sugar' as const, label: 'Sugar', unit: 'g', color: 'pink' as const },
  { key: 'sodium' as const, label: 'Sodium', unit: 'mg', color: 'purple' as const },
];

export function MacroGrid({ totals, goals }: MacroGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {MACROS.map(({ key, label, unit, color }) => {
        const current = Math.round(totals[key]);
        const goal = goals[key];
        const pct = goal > 0 ? (totals[key] / goal) * 100 : 0;
        return (
          <div key={key} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-base font-bold text-gray-900">
              {current}
              <span className="text-xs font-normal text-gray-400 ml-0.5">{unit}</span>
            </p>
            <ProgressBar value={pct} color={color} />
            <p className="text-xs text-gray-400 mt-1">
              {Math.round(pct)}% of {goal}{unit}
            </p>
          </div>
        );
      })}
    </div>
  );
}
