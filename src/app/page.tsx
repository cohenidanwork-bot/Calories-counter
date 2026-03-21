'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFoodLog } from '@/hooks/useFoodLog';
import { useDailyTotals } from '@/hooks/useDailyTotals';
import { getGoals, getTodayString, offsetDate } from '@/lib/storage';
import { useUser } from '@/context/UserContext';
import { DailySummaryCard } from '@/components/dashboard/DailySummaryCard';
import { MacroGrid } from '@/components/dashboard/MacroGrid';
import { MealList } from '@/components/dashboard/MealList';

function formatDate(dateStr: string): string {
  const today = getTodayString();
  const yesterday = offsetDate(today, -1);
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateSub(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function HomePage() {
  const { user } = useUser();
  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState(today);

  const { entries, removeEntry, editEntry } = useFoodLog(user?.id ?? '', selectedDate);
  const goals = user ? getGoals(user.id) : { calories: 2000, protein: 50, carbs: 275, fat: 78, fiber: 28, sugar: 50, sodium: 2300 };
  const { totals } = useDailyTotals(entries, goals);

  const isToday = selectedDate === today;

  const goBack = () => setSelectedDate((d) => offsetDate(d, -1));
  const goForward = () => { if (!isToday) setSelectedDate((d) => offsetDate(d, 1)); };

  return (
    <main className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors shrink-0"
            aria-label="Previous day"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{formatDate(selectedDate)}</h1>
            <p className="text-xs text-gray-400">{formatDateSub(selectedDate)}</p>
          </div>
          <button
            onClick={goForward}
            disabled={isToday}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            aria-label="Next day"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {isToday && (
          <Link
            href="/log"
            className="w-11 h-11 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-md hover:bg-green-600 transition-colors shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        )}
      </div>

      <DailySummaryCard totals={totals} goals={goals} />
      <MacroGrid totals={totals} goals={goals} />
      <MealList entries={entries} onDelete={removeEntry} onEdit={editEntry} />
    </main>
  );
}
