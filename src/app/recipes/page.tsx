'use client';

import { useState, useEffect } from 'react';
import { Recipe, Nutrients, AmountUnit, AMOUNT_UNITS } from '@/types/food';
import { getRecipes, saveRecipe, deleteRecipe } from '@/lib/storage';
import { useUser } from '@/context/UserContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

type Tab = 'list' | 'manual' | 'ai' | 'image';

const EMPTY_NUTRIENTS: Nutrients = {
  calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0,
};

function ManualForm({ onSave }: { onSave: (r: Recipe) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<AmountUnit>('g');
  const [nutrients, setNutrients] = useState<Nutrients>({ ...EMPTY_NUTRIENTS });

  const setN = (key: keyof Nutrients, val: string) =>
    setNutrients((prev) => ({ ...prev, [key]: parseFloat(val) || 0 }));

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      amount: amount ? parseFloat(amount) : undefined,
      unit: amount ? unit : undefined,
      nutrients,
      createdAt: Date.now(),
    });
    setName(''); setDescription(''); setAmount('');
    setNutrients({ ...EMPTY_NUTRIENTS });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Recipe name *</label>
        <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Protein bar" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
        <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Homemade, chocolate flavour" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Amount</label>
          <input type="number" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 60" />
        </div>
        <div className="w-28">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Unit</label>
          <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={unit} onChange={(e) => setUnit(e.target.value as AmountUnit)}>
            {AMOUNT_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-2 block">Nutrition values</label>
        <div className="grid grid-cols-2 gap-2">
          {([['calories','Calories (kcal)'],['protein','Protein (g)'],['carbs','Carbs (g)'],['fat','Fat (g)'],['fiber','Fiber (g)'],['sugar','Sugar (g)'],['sodium','Sodium (mg)']] as [keyof Nutrients, string][]).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs text-gray-400 block mb-0.5">{label}</label>
              <input type="number" className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={nutrients[key] || ''} onChange={(e) => setN(key, e.target.value)} placeholder="0" />
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleSave} disabled={!name.trim()} className="w-full py-3 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-40">Save Recipe</button>
    </div>
  );
}

function AIForm({ onSave }: { onSave: (r: Recipe) => void }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Recipe | null>(null);

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(''); setPreview(null);
    try {
      const res = await fetch('/api/analyze-food', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ method: 'text', text }) });
      const data = await res.json();
      if (data.success && data.entry) {
        setPreview({ id: crypto.randomUUID(), name: data.entry.name, description: data.entry.description, nutrients: data.entry.nutrients, createdAt: Date.now() });
      } else setError(data.error || 'Could not analyze recipe');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  if (preview) return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <p className="font-semibold text-gray-900">{preview.name}</p>
        <p className="text-sm text-gray-500">{preview.description}</p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {Object.entries(preview.nutrients).map(([k, v]) => (
            <div key={k} className="bg-white rounded-lg p-2"><p className="text-xs text-gray-400 capitalize">{k}</p><p className="text-sm font-semibold text-gray-900">{Math.round(v)}</p></div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setPreview(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">Try again</button>
        <button onClick={() => onSave(preview)} className="flex-1 py-3 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600">Save Recipe</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Describe your recipe and AI will calculate the nutrition values.</p>
      <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Homemade protein bar: 30g oats, 20g whey protein, 15g peanut butter, 10g honey..." />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button onClick={analyze} disabled={loading || !text.trim()} className="w-full py-3 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-40 flex items-center justify-center gap-2">
        {loading ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Analyzing...</>) : 'Analyze with AI'}
      </button>
    </div>
  );
}

function ImageForm({ onSave }: { onSave: (r: Recipe) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Recipe | null>(null);
  const [imgSrc, setImgSrc] = useState('');

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setImgSrc(dataUrl);
      const base64 = dataUrl.split(',')[1];
      const mime = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
      setLoading(true); setPreview(null);
      try {
        const res = await fetch('/api/analyze-food', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ method: 'image', imageBase64: base64, imageMime: mime }) });
        const data = await res.json();
        if (data.success && data.entry) setPreview({ id: crypto.randomUUID(), name: data.entry.name, description: data.entry.description, nutrients: data.entry.nutrients, createdAt: Date.now() });
        else setError(data.error || 'Could not analyze image');
      } catch { setError('Network error. Please try again.'); }
      finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  if (preview) return (
    <div className="space-y-4">
      {imgSrc && <img src={imgSrc} alt="Recipe" className="w-full rounded-xl object-cover max-h-40" />}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <p className="font-semibold text-gray-900">{preview.name}</p>
        <p className="text-sm text-gray-500">{preview.description}</p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {Object.entries(preview.nutrients).map(([k, v]) => (
            <div key={k} className="bg-white rounded-lg p-2"><p className="text-xs text-gray-400 capitalize">{k}</p><p className="text-sm font-semibold text-gray-900">{Math.round(v)}</p></div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { setPreview(null); setImgSrc(''); }} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">Try again</button>
        <button onClick={() => onSave(preview)} className="flex-1 py-3 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600">Save Recipe</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Upload a photo and AI will break down the nutrition.</p>
      <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
        <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
        <span className="text-sm text-gray-400">Tap to upload image</span>
        <input type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </label>
      {loading && <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Analyzing image...</div>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default function RecipesPage() {
  const { userId } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [tab, setTab] = useState<Tab>('list');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (userId) setRecipes(getRecipes(userId));
  }, [userId]);

  const handleSave = (recipe: Recipe) => {
    if (!userId) return;
    saveRecipe(userId, recipe);
    setRecipes(getRecipes(userId));
    setTab('list');
  };

  const handleDelete = (id: string) => {
    if (!userId) return;
    deleteRecipe(userId, id);
    setRecipes(getRecipes(userId));
    setConfirmDelete(null);
  };

  const tabs: { value: Tab; label: string }[] = [
    { value: 'list', label: 'My Recipes' },
    { value: 'manual', label: 'Manual' },
    { value: 'ai', label: 'AI' },
    { value: 'image', label: 'Image' },
  ];

  return (
    <main className="max-w-md mx-auto px-4 pt-6 pb-24">
      <PageHeader title="Recipes" subtitle="Save your favourite meals" backHref="/" />

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
        {tabs.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${tab === t.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <div className="space-y-3">
          {recipes.length === 0 ? (
            <Card className="text-center py-10">
              <svg className="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              <p className="text-gray-400 text-sm font-medium">No recipes saved yet</p>
              <p className="text-gray-300 text-xs mt-1">Use Manual, AI, or Image tab to add one</p>
            </Card>
          ) : (
            recipes.map((recipe) => (
              <Card key={recipe.id} padding={false} className="overflow-hidden">
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{recipe.name}</p>
                      {recipe.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{recipe.description}</p>}
                      {recipe.amount && recipe.unit && <p className="text-xs text-gray-400 mt-0.5">{recipe.amount} {recipe.unit}</p>}
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="font-bold text-gray-900">{Math.round(recipe.nutrients.calories)}</p>
                      <p className="text-xs text-gray-400">kcal</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-blue-600">P: {Math.round(recipe.nutrients.protein)}g</span>
                    <span className="text-xs text-amber-600">C: {Math.round(recipe.nutrients.carbs)}g</span>
                    <span className="text-xs text-orange-500">F: {Math.round(recipe.nutrients.fat)}g</span>
                    <div className="flex-1" />
                    {confirmDelete === recipe.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmDelete(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                        <button onClick={() => handleDelete(recipe.id)} className="text-xs text-red-500 font-medium hover:text-red-700">Confirm</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(recipe.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
          <button onClick={() => setTab('manual')} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors">+ Add new recipe</button>
        </div>
      )}

      {tab === 'manual' && <Card><h3 className="font-semibold text-gray-900 mb-4">Enter values manually</h3><ManualForm onSave={handleSave} /></Card>}
      {tab === 'ai' && <Card><h3 className="font-semibold text-gray-900 mb-4">Analyze with AI</h3><AIForm onSave={handleSave} /></Card>}
      {tab === 'image' && <Card><h3 className="font-semibold text-gray-900 mb-4">Analyze from image</h3><ImageForm onSave={handleSave} /></Card>}
    </main>
  );
}
