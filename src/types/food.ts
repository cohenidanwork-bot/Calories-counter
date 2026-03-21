export interface Nutrients {
  calories: number; // kcal
  protein: number;  // g
  carbs: number;    // g
  fat: number;      // g
  fiber: number;    // g
  sugar: number;    // g
  sodium: number;   // mg
}

export type InputMethod = 'image' | 'text' | 'voice';

export interface FoodEntry {
  id: string;
  date: string;           // YYYY-MM-DD
  timestamp: number;
  name: string;
  description: string;
  inputMethod: InputMethod;
  nutrients: Nutrients;
  confidence: 'high' | 'medium' | 'low';
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

export const DEFAULT_GOALS: DailyGoals = {
  calories: 2000,
  protein: 50,
  carbs: 275,
  fat: 78,
  fiber: 28,
  sugar: 50,
  sodium: 2300,
};

export interface AnalyzeRequest {
  method: InputMethod;
  text?: string;
  imageBase64?: string;
  imageMime?: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
}

export interface AnalyzeResponse {
  success: boolean;
  entry?: Omit<FoodEntry, 'id' | 'date' | 'timestamp'>;
  error?: string;
}
