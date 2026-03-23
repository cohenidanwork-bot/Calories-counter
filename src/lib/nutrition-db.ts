import { Nutrients } from '@/types/food';

// USDA FoodData Central nutrient IDs
const NID = {
  calories: 1008,
  protein:  1003,
  carbs:    1005,
  fat:      1004,
  fiber:    1079,
  sugar:    2000,
  sodium:   1093,
} as const;

interface UsdaFoodNutrient {
  nutrientId: number;
  value: number;
}

interface UsdaFood {
  description: string;
  dataType: string;
  foodNutrients: UsdaFoodNutrient[];
}

interface UsdaSearchResponse {
  foods?: UsdaFood[];
}

function nv(food: UsdaFood, id: number): number {
  return food.foodNutrients.find((n) => n.nutrientId === id)?.value ?? 0;
}

function hasCoreMacros(food: UsdaFood): boolean {
  const ids = new Set(food.foodNutrients.map((n) => n.nutrientId));
  return ids.has(NID.calories) && ids.has(NID.protein) && ids.has(NID.carbs) && ids.has(NID.fat);
}

function scaleFood(food: UsdaFood, amountGrams: number): Nutrients {
  const r = amountGrams / 100;
  return {
    calories: Math.round(nv(food, NID.calories) * r),
    protein:  Math.round(nv(food, NID.protein)  * r * 10) / 10,
    carbs:    Math.round(nv(food, NID.carbs)    * r * 10) / 10,
    fat:      Math.round(nv(food, NID.fat)      * r * 10) / 10,
    fiber:    Math.round(nv(food, NID.fiber)    * r * 10) / 10,
    sugar:    Math.round(nv(food, NID.sugar)    * r * 10) / 10,
    sodium:   Math.round(nv(food, NID.sodium)   * r),
  };
}

async function queryUsda(
  query: string,
  dataType: string,
  apiKey: string
): Promise<UsdaFood | null> {
  const url =
    `https://api.nal.usda.gov/fdc/v1/foods/search` +
    `?query=${encodeURIComponent(query)}` +
    `&dataType=${dataType}` +
    `&pageSize=5` +
    `&api_key=${apiKey}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return null;

  const data: UsdaSearchResponse = await res.json();
  return (data.foods ?? []).find(hasCoreMacros) ?? null;
}

export async function lookupNutrients(
  searchName: string,
  amountGrams: number
): Promise<{ nutrients: Nutrients; foodLabel: string } | null> {
  try {
    const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';

    // Foundation = lab-tested reference foods (most accurate for plain ingredients)
    // SR Legacy  = USDA Standard Reference — broader coverage, still generic
    const match =
      (await queryUsda(searchName, 'Foundation', apiKey)) ??
      (await queryUsda(searchName, 'SR%20Legacy', apiKey));

    if (!match) return null;

    return {
      nutrients: scaleFood(match, amountGrams),
      foodLabel: match.description,
    };
  } catch {
    return null;
  }
}
