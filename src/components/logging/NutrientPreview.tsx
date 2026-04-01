'use client';

import { AnalyzeResponse } from '@/types/food';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface NutrientPreviewProps {
  result: AnalyzeResponse;
  onConfirm: () => void;
  onReset: () => void;
}

const NUTRIENT_CONFIG = [
  { key: 'calories' as const, label: 'Calories', unit: 'kcal', color: 'text-orange-600' },
  { key: 'protein' as const, label: 'Protein', unit: 'g', color: 'text-blue-600' },
  { key: 'carbs' as const, label: 'Carbs', unit: 'g', color: 'text-amber-600' },
  { key: 'fat' as const, label: 'Fat', unit: 'g', color: 'text-orange-500' },
  { key: 'fiber' as const, label: 'Fiber', unit: 'g', color: 'text-green-600' },
  { key: 'sugar' as const, label: 'Sugar', unit: 'g', color: 'text-pink-600' },
  { key: 'sodium' as const, label: 'Sodium', unit: 'mg', color: 'text-purple-600' },
];

const confidenceBadge = {
  high: { label: 'High confidence', variant: 'green' as const },
  medium: { label: 'Medium confidence', variant: 'yellow' as const },
  low: { label: 'Low confidence', variant: 'red' as const },
};

export function NutrientPreview({ result, onConfirm, onReset }: NutrientPreviewProps) {
  if (!result.success || !result.entry) {
    return (
      <Card className="text-center">
        <p className="text-red-600 font-medium mb-1">Could not analyze food</p>
        <p className="text-sm text-gray-500 mb-4">{result.error || 'Unknown error'}</p>
        <Button variant="secondary" onClick={onReset}>Try Again</Button>
      </Card>
    );
  }

  const { entry } = result;
  const conf = confidenceBadge[entry.confidence];

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{entry.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{entry.description}</p>
          <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI analyzed
          </span>
        </div>
        <Badge label={conf.label} variant={conf.variant} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {NUTRIENT_CONFIG.map(({ key, label, unit, color }) => (
          <div key={key} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className={`text-lg font-bold ${color}`}>
              {Math.round(entry.nutrients[key])}
              <span className="text-xs font-normal text-gray-400 ml-0.5">{unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onReset} className="flex-1">
          Try Again
        </Button>
        <Button onClick={onConfirm} className="flex-1">
          Add to Log
        </Button>
      </div>
    </Card>
  );
}
