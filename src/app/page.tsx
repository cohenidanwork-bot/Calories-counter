'use client';

import Link from 'next/link';
import { useFoodLog } from '@/hooks/useFoodLog';
import { useDailyTotals } from '@/hooks/useDailyTotals';
import { getGoals, getTodayString } from '@/lib/storage';
import { DailySummaryCard } from '@/components/dashboard/DailySummaryCard';
import { MacroGrid } from '@/components/dashboard/MacroGrid';
import { MealList } from '@/components/dashboard/MealList';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function HomePage() {
  const { entries, removeEntry } = useFoodLog();
  const goals = getGoals();
  const { totals } = useDailyTotals(entries, goals);
  const today = getTodayString();

  return (
    <main className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today</h1>
          <p className="text-sm text-gray-400">{formatDate(today)}</p>
        </div>
        <Link
          href="/log"
          className="w-11 h-11 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-md hover:bg-green-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>

      <DailySummaryCard totals={totals} goals={goals} />
      <MacroGrid totals={totals} goals={goals} />
      <MealList entries={entries} onDelete={removeEntry} />
    </main>
  );
}
