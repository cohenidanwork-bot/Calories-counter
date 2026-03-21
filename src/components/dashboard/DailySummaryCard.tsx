'use client';

import { Nutrients, DailyGoals } from '@/types/food';
import { Card } from '@/components/ui/Card';

interface DailySummaryCardProps {
  totals: Nutrients;
  goals: DailyGoals;
}

export function DailySummaryCard({ totals, goals }: DailySummaryCardProps) {
  const pct = Math.min((totals.calories / goals.calories) * 100, 100);
  const remaining = Math.max(goals.calories - totals.calories, 0);

  // SVG donut ring
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const ringColor =
    pct >= 100 ? '#ef4444' : pct >= 85 ? '#f59e0b' : '#22c55e';

  return (
    <Card className="flex flex-col items-center py-6">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="12"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">
            {Math.round(totals.calories)}
          </span>
          <span className="text-xs text-gray-400">of {goals.calories} kcal</span>
        </div>
      </div>

      <div className="flex gap-8 mt-4 text-center">
        <div>
          <p className="text-lg font-bold text-gray-900">{Math.round(remaining)}</p>
          <p className="text-xs text-gray-400">remaining</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">{Math.round(pct)}%</p>
          <p className="text-xs text-gray-400">of goal</p>
        </div>
      </div>
    </Card>
  );
}
