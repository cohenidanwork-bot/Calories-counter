export interface Nutrients {
  calories: number; // kcal
  protein: number;  // g
  carbs: number;    // g
  fat: number;      // g
  fiber: number;    // g
  sugar: number;    // g
  sodium: number;   // mg
}

export type InputMethod = 'image' | 'text' | 'voice' | 'recipe' | 'manual';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type AmountUnit = 'g' | 'kg' | 'ml' | 'l' | 'oz' | 'cup' | 'tbsp' | 'tsp' | 'piece' | 'serving';

export interface FoodEntry {
  id: string;
  date: string;           // YYYY-MM-DD
  timestamp: number;
  name: string;
  description: string;
  inputMethod: InputMethod;
  mealType: MealType;
  amount?: number;
  unit?: AmountUnit;
  nutrients: Nutrients;
  confidence: 'high' | 'medium' | 'low';
  source?: 'database' | 'ai';
  amountGrams?: number;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

// Calories derived via net-carb Atwater: protein×4 + (carbs−fiber)×4 + fat×9
// 50×4 + (275−28)×4 + 78×9 = 200 + 988 + 702 = 1890 kcal
export const DEFAULT_GOALS: DailyGoals = {
  calories: 1890,
  protein: 50,
  carbs: 275,
  fat: 78,
  fiber: 28,
  sugar: 50,
  sodium: 2300,
};

export interface Recipe {
  id: string;
  name: string;
  description: string;
  nutrients: Nutrients;
  amount?: number;
  unit?: AmountUnit;
  createdAt: number;
}

export interface AnalyzeRequest {
  method: InputMethod;
  text?: string;
  imageBase64?: string;
  imageMime?: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
}

export interface AnalyzeResponse {
  success: boolean;
  entry?: Omit<FoodEntry, 'id' | 'date' | 'timestamp' | 'mealType'>;
  error?: string;
}

export const MEAL_TYPES: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '☀️' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙' },
  { value: 'snack', label: 'Snack', emoji: '🍎' },
];

export const AMOUNT_UNITS: AmountUnit[] = ['g', 'kg', 'ml', 'l', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'serving'];
