'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyzeRequest, AnalyzeResponse, MealType, MEAL_TYPES, AmountUnit, AMOUNT_UNITS, Recipe } from '@/types/food';
import { useFoodLog } from '@/hooks/useFoodLog';
import { getRecipes } from '@/lib/storage';
import { useUser } from '@/context/UserContext';
import { LoggingTabs } from '@/components/logging/LoggingTabs';
import { TextInput } from '@/components/logging/TextInput';
import { ImageUploader } from '@/components/logging/ImageUploader';
import { VoiceRecorder } from '@/components/logging/VoiceRecorder';
import { NutrientPreview } from '@/components/logging/NutrientPreview';
import { PageHeader } from '@/components/layout/PageHeader';

function getMealTypeForTime(): MealType {
  const h = new Date().getHours();
  if (h >= 6 && h < 11) return 'breakfast';
  if (h >= 11 && h < 15) return 'lunch';
  if (h >= 15 && h < 21) return 'dinner';
  return 'snack';
}

export default function LogPage() {
  const router = useRouter();
  const { userId } = useUser();
  const { addEntry } = useFoodLog(userId ?? '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [mealType, setMealType] = useState<MealType>(getMealTypeForTime());
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<AmountUnit>('g');
  const [showRecipes, setShowRecipes] = useState(false);

  const recipes: Recipe[] = userId ? getRecipes(userId) : [];

  const analyze = async (req: AnalyzeRequest) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      const data = (await res.json()) as AnalyzeResponse;
      setResult(data);
    } catch {
      setResult({ success: false, error: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (result?.success && result.entry) {
      addEntry({
        ...result.entry,
        mealType,
        amount: amount ? parseFloat(amount) : undefined,
        unit: amount ? unit : undefined,
      });
      router.push('/');
    }
  };

  const handleRecipeAdd = (recipe: Recipe) => {
    addEntry({
      name: recipe.name,
      description: recipe.description,
      inputMethod: 'recipe',
      mealType,
      amount: recipe.amount,
      unit: recipe.unit,
      nutrients: recipe.nutrients,
      confidence: 'high',
    });
    router.push('/');
  };

  return (
    <main className="max-w-md mx-auto px-4 pt-6 pb-24">
      <PageHeader title="Log Food" subtitle="What did you eat?" backHref="/" />

      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Meal</p>
        <div className="grid grid-cols-4 gap-2">
          {MEAL_TYPES.map((mt) => (
            <button
              key={mt.value}
              onClick={() => setMealType(mt.value)}
              className={`flex flex-col items-center py-2.5 rounded-xl border text-xs font-medium transition-colors ${
                mealType === mt.value ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <span className="text-lg mb-0.5">{mt.emoji}</span>
              <span>{mt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 mb-1">Amount (optional)</p>
          <input type="number" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 200" />
        </div>
        <div className="w-28">
          <p className="text-xs font-medium text-gray-500 mb-1">Unit</p>
          <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={unit} onChange={(e) => setUnit(e.target.value as AmountUnit)}>
            {AMOUNT_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {recipes.length > 0 && !result && (
        <div className="mb-4">
          <button onClick={() => setShowRecipes(!showRecipes)} className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl text-sm font-medium text-purple-700">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              My Recipes ({recipes.length})
            </div>
            <svg className={`w-4 h-4 transition-transform ${showRecipes ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showRecipes && (
            <div className="mt-2 space-y-2">
              {recipes.map((recipe) => (
                <button key={recipe.id} onClick={() => handleRecipeAdd(recipe)} className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors">
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{recipe.name}</p>
                    <p className="text-xs text-gray-400">{recipe.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-semibold text-gray-900">{Math.round(recipe.nutrients.calories)}</p>
                    <p className="text-xs text-gray-400">kcal</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {result ? (
        <NutrientPreview result={result} onConfirm={handleConfirm} onReset={() => setResult(null)} />
      ) : (
        <LoggingTabs>
          {(tab) => (
            <>
              {tab === 'text' && <TextInput loading={loading} onSubmit={(text) => analyze({ method: 'text', text })} />}
              {tab === 'image' && <ImageUploader loading={loading} onSubmit={(imageBase64, imageMime) => analyze({ method: 'image', imageBase64, imageMime })} />}
              {tab === 'voice' && <VoiceRecorder loading={loading} onSubmit={(text) => analyze({ method: 'voice', text })} />}
            </>
          )}
        </LoggingTabs>
      )}
    </main>
  );
}
