'use client';

import { useState, useEffect } from 'react';
import { DailyGoals, DEFAULT_GOALS } from '@/types/food';
import { getGoals, saveGoals } from '@/lib/storage';
import { useUser } from '@/context/UserContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

const GOAL_FIELDS: { key: keyof DailyGoals; label: string; unit: string; color: string }[] = [
  { key: 'protein', label: 'Protein', unit: 'g', color: 'text-blue-600' },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: 'text-amber-600' },
  { key: 'fat', label: 'Fat', unit: 'g', color: 'text-orange-500' },
  { key: 'fiber', label: 'Fiber', unit: 'g', color: 'text-green-600' },
  { key: 'sugar', label: 'Sugar', unit: 'g', color: 'text-pink-600' },
  { key: 'sodium', label: 'Sodium', unit: 'mg', color: 'text-purple-600' },
];

export default function SettingsPage() {
  const { userId } = useUser();
  const [goals, setGoals] = useState<DailyGoals>(DEFAULT_GOALS);
  const [saved, setSaved] = useState(false);

  // Net-carb Atwater: fiber ≈ 0 kcal/g (FDA), subtract it from total carbs.
  const calcCalories = (g: DailyGoals) =>
    Math.round(g.protein * 4 + Math.max(0, g.carbs - g.fiber) * 4 + g.fat * 9);

  useEffect(() => {
    if (userId) {
      const g = getGoals(userId);
      setGoals({ ...g, calories: calcCalories(g) });
    }
  }, [userId]);

  const handleChange = (key: keyof DailyGoals, value: string) => {
    setGoals((prev) => {
      const updated = { ...prev, [key]: parseFloat(value) || 0 };
      return { ...updated, calories: calcCalories(updated) };
    });
    setSaved(false);
  };

  const handleSave = () => {
    if (!userId) return;
    saveGoals(userId, goals);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (!userId) return;
    setGoals(DEFAULT_GOALS);
    saveGoals(userId, DEFAULT_GOALS);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="max-w-md mx-auto px-4 pt-6 pb-24">
      <PageHeader title="Daily Goals" subtitle="Set your nutrition targets" backHref="/" />

      <Card className="space-y-4">
        <p className="text-sm text-gray-500">
          Customize your daily nutrition goals. These are saved per user.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between bg-orange-50 rounded-xl px-3 py-2">
            <div>
              <p className="text-sm font-medium text-orange-700">Calories (auto)</p>
              <p className="text-xs text-orange-400">calculated from macros</p>
            </div>
            <span className="text-lg font-bold text-orange-600">{goals.calories} <span className="text-xs font-normal text-orange-400">kcal</span></span>
          </div>

          {GOAL_FIELDS.map(({ key, label, unit, color }) => (
            <div key={key} className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <p className="text-xs text-gray-400">{unit}</p>
              </div>
              <input
                type="number"
                min="0"
                className={`w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-right ${color} focus:outline-none focus:ring-2 focus:ring-green-500`}
                value={goals[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
              />
              <span className="text-xs text-gray-400 w-8">{unit}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Reset defaults
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 py-3 rounded-xl text-sm font-medium text-white transition-colors ${
              saved ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {saved ? 'Saved!' : 'Save goals'}
          </button>
        </div>
      </Card>
    </main>
  );
}
