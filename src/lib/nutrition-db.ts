import { Nutrients } from '@/types/food';

interface OFFProduct {
  nutriments?: {
    'energy-kcal_100g'?: number;
    'energy_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    sodium_100g?: number;
  };
  product_name?: string;
}

interface OFFSearchResponse {
  products?: OFFProduct[];
}

function hasCompleteData(p: OFFProduct): boolean {
  const n = p.nutriments;
  if (!n) return false;
  const kcal = n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : undefined);
  return (
    kcal !== undefined &&
    n.proteins_100g !== undefined &&
    n.carbohydrates_100g !== undefined &&
    n.fat_100g !== undefined
  );
}

function scaleNutrients(p: OFFProduct, amountGrams: number): Nutrients {
  const n = p.nutriments!;
  const ratio = amountGrams / 100;
  const kcalPer100 =
    n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : 0);

  return {
    calories: Math.round(kcalPer100 * ratio),
    protein: Math.round((n.proteins_100g ?? 0) * ratio * 10) / 10,
    carbs: Math.round((n.carbohydrates_100g ?? 0) * ratio * 10) / 10,
    fat: Math.round((n.fat_100g ?? 0) * ratio * 10) / 10,
    fiber: Math.round((n.fiber_100g ?? 0) * ratio * 10) / 10,
    sugar: Math.round((n.sugars_100g ?? 0) * ratio * 10) / 10,
    sodium: Math.round((n.sodium_100g ?? 0) * ratio * 1000), // kg→mg
  };
}

export async function lookupNutrients(
  searchName: string,
  amountGrams: number
): Promise<{ nutrients: Nutrients; foodLabel: string } | null> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchName)}&json=1&page_size=10&fields=product_name,nutriments`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CaloriesCounter/1.0 (educational project)' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data: OFFSearchResponse = await res.json();
    const products = data.products ?? [];

    const match = products.find(hasCompleteData);
    if (!match) return null;

    return {
      nutrients: scaleNutrients(match, amountGrams),
      foodLabel: match.product_name || searchName,
    };
  } catch {
    return null;
  }
}
