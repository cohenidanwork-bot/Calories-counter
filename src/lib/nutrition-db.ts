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
  unitName: string;
}

interface UsdaFood {
  description: string;
  foodNutrients: UsdaFoodNutrient[];
}

interface UsdaSearchResponse {
  foods?: UsdaFood[];
}

function nutrientValue(food: UsdaFood, id: number): number {
  return food.foodNutrients.find((n) => n.nutrientId === id)?.value ?? 0;
}

function scaleFood(food: UsdaFood, amountGrams: number): Nutrients {
  const ratio = amountGrams / 100;
  return {
    calories: Math.round(nutrientValue(food, NID.calories) * ratio),
    protein:  Math.round(nutrientValue(food, NID.protein)  * ratio * 10) / 10,
    carbs:    Math.round(nutrientValue(food, NID.carbs)    * ratio * 10) / 10,
    fat:      Math.round(nutrientValue(food, NID.fat)      * ratio * 10) / 10,
    fiber:    Math.round(nutrientValue(food, NID.fiber)    * ratio * 10) / 10,
    sugar:    Math.round(nutrientValue(food, NID.sugar)    * ratio * 10) / 10,
    sodium:   Math.round(nutrientValue(food, NID.sodium)   * ratio),
  };
}

function hasCoreMacros(food: UsdaFood): boolean {
  const ids = new Set(food.foodNutrients.map((n) => n.nutrientId));
  return ids.has(NID.calories) && ids.has(NID.protein) && ids.has(NID.carbs) && ids.has(NID.fat);
}

export async function lookupNutrients(
  searchName: string,
  amountGrams: number
): Promise<{ nutrients: Nutrients; foodLabel: string } | null> {
  try {
    const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
    const url =
      `https://api.nal.usda.gov/fdc/v1/foods/search` +
      `?query=${encodeURIComponent(searchName)}` +
      `&dataType=Foundation,SR%20Legacy` +
      `&pageSize=5` +
      `&api_key=${apiKey}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;

    const data: UsdaSearchResponse = await res.json();
    const match = (data.foods ?? []).find(hasCoreMacros);
    if (!match) return null;

    return {
      nutrients: scaleFood(match, amountGrams),
      foodLabel: match.description,
    };
  } catch {
    return null;
  }
}
