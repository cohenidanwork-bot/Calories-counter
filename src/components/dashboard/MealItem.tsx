'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FoodEntry, MealType, MEAL_TYPES, AMOUNT_UNITS, AmountUnit } from '@/types/food';
import { Badge } from '@/components/ui/Badge';

interface MealItemProps {
  entry: FoodEntry;
  onDelete: (id: string) => void;
  onEdit: (updated: FoodEntry) => void;
  onDuplicate: (entry: FoodEntry) => void;
}

const methodIcon = {
  text: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  image: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    </svg>
  ),
  voice: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  recipe: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  manual: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface EditModalProps {
  entry: FoodEntry;
  onSave: (updated: FoodEntry) => void;
  onClose: () => void;
}

function EditModal({ entry, onSave, onClose }: EditModalProps) {
  const [name, setName] = useState(entry.name);
  const [description, setDescription] = useState(entry.description);
  const [mealType, setMealType] = useState<MealType>(entry.mealType || 'snack');
  const [amount, setAmount] = useState(entry.amount?.toString() || '');
  const [unit, setUnit] = useState<AmountUnit>(entry.unit || 'g');
  const [protein, setProtein] = useState(entry.nutrients.protein.toString());
  const [carbs, setCarbs] = useState(entry.nutrients.carbs.toString());
  const [fat, setFat] = useState(entry.nutrients.fat.toString());
  const calories = Math.round((parseFloat(protein) || 0) * 4 + (parseFloat(carbs) || 0) * 4 + (parseFloat(fat) || 0) * 9);
  const [fiber, setFiber] = useState(entry.nutrients.fiber.toString());
  const [sugar, setSugar] = useState(entry.nutrients.sugar.toString());
  const [sodium, setSodium] = useState(entry.nutrients.sodium.toString());

  const handleSave = () => {
    onSave({
      ...entry,
      name: name.trim() || entry.name,
      description: description.trim(),
      mealType,
      amount: amount ? parseFloat(amount) : undefined,
      unit: amount ? unit : undefined,
      nutrients: {
        calories,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        fiber: parseFloat(fiber) || 0,
        sugar: parseFloat(sugar) || 0,
        sodium: parseFloat(sodium) || 0,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Edit Entry</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Name</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Meal type */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Meal</label>
            <div className="grid grid-cols-4 gap-2">
              {MEAL_TYPES.map((mt) => (
                <button
                  key={mt.value}
                  onClick={() => setMealType(mt.value)}
                  className={`flex flex-col items-center py-2 rounded-xl border text-xs transition-colors ${
                    mealType === mt.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="text-base">{mt.emoji}</span>
                  <span>{mt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount + unit */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Amount</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 100"
              />
            </div>
            <div className="w-28">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Unit</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={unit}
                onChange={(e) => setUnit(e.target.value as AmountUnit)}
              >
                {AMOUNT_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Nutrients */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">Nutrition</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2 bg-orange-50 rounded-xl px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-orange-600 font-medium">Calories (auto)</span>
                <span className="text-lg font-bold text-orange-600">{calories} <span className="text-xs font-normal text-orange-400">kcal</span></span>
              </div>
              {[
                { label: 'Protein (g)', val: protein, set: setProtein },
                { label: 'Carbs (g)', val: carbs, set: setCarbs },
                { label: 'Fat (g)', val: fat, set: setFat },
                { label: 'Fiber (g)', val: fiber, set: setFiber },
                { label: 'Sugar (g)', val: sugar, set: setSugar },
                { label: 'Sodium (mg)', val: sodium, set: setSodium },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <label className="text-xs text-gray-400 block mb-0.5">{label}</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pb-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MealItem({ entry, onDelete, onEdit, onDuplicate }: MealItemProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveTo, setShowMoveTo] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top?: number; bottom?: number; right: number }>({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showMenu) { setShowMoveTo(false); return; }
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowMoveTo(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const handleMenuToggle = () => {
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const right = window.innerWidth - rect.right;
      if (spaceBelow < 280) {
        setMenuStyle({ bottom: window.innerHeight - rect.top, right });
      } else {
        setMenuStyle({ top: rect.bottom + 4, right });
      }
    }
    setShowMenu((v) => !v);
  };

  const handleSave = (updated: FoodEntry) => {
    onEdit(updated);
    setShowEdit(false);
  };

  const moveTo = (target: MealType) => {
    onEdit({ ...entry, mealType: target });
    setShowMenu(false);
    setShowMoveTo(false);
  };

  const { protein, carbs, fat } = entry.nutrients;
  const otherMeals = MEAL_TYPES.filter((m) => m.value !== entry.mealType);

  return (
    <>
      <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 mt-0.5">
          {methodIcon[entry.inputMethod] ?? methodIcon.text}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 leading-snug line-clamp-2">{entry.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-400">{formatTime(entry.timestamp)}</span>
            {entry.amount && entry.unit && (
              <span className="text-xs text-gray-400">{entry.amount} {entry.unit}</span>
            )}
            {entry.confidence === 'low' && <Badge label="uncertain" variant="yellow" />}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-blue-500 font-medium">P {Math.round(protein)}g</span>
            <span className="text-xs text-amber-500 font-medium">C {Math.round(carbs)}g</span>
            <span className="text-xs text-orange-400 font-medium">F {Math.round(fat)}g</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="text-right mr-1">
            <p className="font-semibold text-gray-900 leading-none">{Math.round(entry.nutrients.calories)}</p>
            <p className="text-xs text-gray-400">kcal</p>
          </div>

          <div className="relative">
            <button
              ref={buttonRef}
              onClick={handleMenuToggle}
              className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="More options"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {showMenu && typeof document !== 'undefined' && createPortal(
              <div
                ref={menuRef}
                style={{ position: 'fixed', ...menuStyle, width: 176, zIndex: 9999 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 py-1">
                <button
                  onClick={() => { setShowEdit(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 active:bg-gray-50"
                >
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>

                {/* Move to submenu trigger */}
                <button
                  onClick={() => setShowMoveTo((v) => !v)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 active:bg-gray-50"
                >
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="flex-1 text-left">Move to</span>
                  <svg className={`w-3 h-3 text-gray-400 transition-transform ${showMoveTo ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {showMoveTo && (
                  <div className="border-t border-gray-100 py-1 bg-gray-50 rounded-b-2xl">
                    {otherMeals.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => moveTo(m.value)}
                        className="w-full flex items-center gap-2 px-5 py-2 text-sm text-gray-600 active:bg-gray-100"
                      >
                        <span>{m.emoji}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => { onDuplicate(entry); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 active:bg-gray-50"
                  >
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicate
                  </button>
                  <button
                    onClick={() => { onDelete(entry.id); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 active:bg-red-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <EditModal entry={entry} onSave={handleSave} onClose={() => setShowEdit(false)} />
      )}
    </>
  );
}
