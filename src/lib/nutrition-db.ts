import { Nutrients } from '@/types/food';

// ─── USDA ────────────────────────────────────────────────────────────────────

const NID = {
  calories: 1008,
  protein:  1003,
  carbs:    1005,
  fat:      1004,
  fiber:    1079,
  sugar:    2000,
  sodium:   1093,
} as const;

interface UsdaFoodNutrient { nutrientId: number; value: number }
interface UsdaFood { description: string; dataType: string; foodNutrients: UsdaFoodNutrient[] }
interface UsdaSearchResponse { foods?: UsdaFood[] }

function usdaNv(food: UsdaFood, id: number): number {
  return food.foodNutrients.find((n) => n.nutrientId === id)?.value ?? 0;
}

function usdaHasMacros(food: UsdaFood): boolean {
  const ids = new Set(food.foodNutrients.map((n) => n.nutrientId));
  return ids.has(NID.calories) && ids.has(NID.protein) && ids.has(NID.carbs) && ids.has(NID.fat);
}

/** Score how closely a USDA food description matches the search query (higher = better). */
function usdaRelevanceScore(food: UsdaFood, query: string): number {
  const desc = food.description.toLowerCase();
  const q = query.toLowerCase();
  // Exact match wins
  if (desc === q) return 100;
  // Description starts with query
  if (desc.startsWith(q)) return 80;
  // All query words present in description
  const words = q.split(/\s+/);
  const allWordsMatch = words.every((w) => desc.includes(w));
  if (allWordsMatch) return 60;
  // At least half the words match
  const matchCount = words.filter((w) => desc.includes(w)).length;
  return (matchCount / words.length) * 40;
}

function usdaScale(food: UsdaFood, grams: number): Nutrients {
  const r = grams / 100;
  return {
    calories: Math.round(usdaNv(food, NID.calories) * r),
    protein:  Math.round(usdaNv(food, NID.protein)  * r * 10) / 10,
    carbs:    Math.round(usdaNv(food, NID.carbs)    * r * 10) / 10,
    fat:      Math.round(usdaNv(food, NID.fat)      * r * 10) / 10,
    fiber:    Math.round(usdaNv(food, NID.fiber)    * r * 10) / 10,
    sugar:    Math.round(usdaNv(food, NID.sugar)    * r * 10) / 10,
    sodium:   Math.round(usdaNv(food, NID.sodium)   * r),
  };
}

async function queryUsda(
  query: string,
  dataType: string,
  apiKey: string
): Promise<{ nutrients: Nutrients; foodLabel: string } | null> {
  const url =
    `https://api.nal.usda.gov/fdc/v1/foods/search` +
    `?query=${encodeURIComponent(query)}` +
    `&dataType=${dataType}` +
    `&pageSize=10` +
    `&api_key=${apiKey}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) return null;

  const data: UsdaSearchResponse = await res.json();
  const candidates = (data.foods ?? []).filter(usdaHasMacros);
  if (candidates.length === 0) return null;

  // Pick the most relevant result rather than just the first one.
  const food = candidates.reduce((best, current) =>
    usdaRelevanceScore(current, query) > usdaRelevanceScore(best, query) ? current : best
  );

  return { nutrients: usdaScale(food, 100), foodLabel: food.description };
}

// ─── Open Food Facts ─────────────────────────────────────────────────────────

interface OFFNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?:      number;
  carbohydrates_100g?: number;
  fat_100g?:           number;
  fiber_100g?:         number;
  sugars_100g?:        number;
  sodium_100g?:        number;  // grams — multiply × 1000 for mg
}

interface OFFProduct {
  product_name?: string;
  nutriments?: OFFNutriments;
}

interface OFFSearchResponse {
  products?: OFFProduct[];
}

function offHasMacros(n: OFFNutriments): boolean {
  return (
    n['energy-kcal_100g'] !== undefined &&
    n.proteins_100g       !== undefined &&
    n.carbohydrates_100g  !== undefined &&
    n.fat_100g            !== undefined
  );
}

async function fetchOpenFoodFacts(
  host: string,
  query: string,
): Promise<{ nutrients: Nutrients; foodLabel: string } | null> {
  const url =
    `https://${host}/cgi/search.pl` +
    `?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1&action=process&json=1&page_size=5&lc=en`;

  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) return null;

  const data: OFFSearchResponse = await res.json();
  const product = (data.products ?? []).find(
    (p) => p.nutriments && offHasMacros(p.nutriments)
  );
  if (!product?.nutriments) return null;

  const n = product.nutriments;
  return {
    foodLabel: product.product_name ?? query,
    nutrients: {
      calories: Math.round(n['energy-kcal_100g'] ?? 0),
      protein:  Math.round((n.proteins_100g      ?? 0) * 10) / 10,
      carbs:    Math.round((n.carbohydrates_100g  ?? 0) * 10) / 10,
      fat:      Math.round((n.fat_100g            ?? 0) * 10) / 10,
      fiber:    Math.round((n.fiber_100g          ?? 0) * 10) / 10,
      sugar:    Math.round((n.sugars_100g         ?? 0) * 10) / 10,
      sodium:   Math.round((n.sodium_100g         ?? 0) * 1000),
    },
  };
}

async function queryOpenFoodFacts(
  query: string
): Promise<{ nutrients: Nutrients; foodLabel: string } | null> {
  // Try global instance first for the widest coverage, then Israeli store as fallback.
  return (
    (await fetchOpenFoodFacts('world.openfoodfacts.org', query)) ??
    (await fetchOpenFoodFacts('il.openfoodfacts.org', query))
  );
}

// ─── Scale helper ─────────────────────────────────────────────────────────────

function scaleNutrients(base: Nutrients, grams: number): Nutrients {
  const r = grams / 100;
  return {
    calories: Math.round(base.calories * r),
    protein:  Math.round(base.protein  * r * 10) / 10,
    carbs:    Math.round(base.carbs    * r * 10) / 10,
    fat:      Math.round(base.fat      * r * 10) / 10,
    fiber:    Math.round(base.fiber    * r * 10) / 10,
    sugar:    Math.round(base.sugar    * r * 10) / 10,
    sodium:   Math.round(base.sodium   * r),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Lookup order:
 *   1. USDA Foundation  (lab-tested reference foods — best for raw ingredients)
 *   2. USDA SR Legacy   (broader generic foods)
 *   3. Open Food Facts  (Israeli & international packaged foods, local brands)
 *   4. null             (caller falls back to AI estimate)
 */
export async function lookupNutrients(
  searchName: string,
  amountGrams: number
): Promise<{ nutrients: Nutrients; foodLabel: string } | null> {
  try {
    const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';

    const base =
      (await queryUsda(searchName, 'Foundation', apiKey)) ??
      (await queryUsda(searchName, 'SR%20Legacy', apiKey)) ??
      (await queryOpenFoodFacts(searchName));

    if (!base) return null;

    return {
      nutrients: scaleNutrients(base.nutrients, amountGrams),
      foodLabel: base.foodLabel,
    };
  } catch {
    return null;
  }
}
