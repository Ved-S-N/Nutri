export interface User {
  name: string;
  email: string;
}

export type WeightGoalMode = 'cutting' | 'bulking' | 'maintenance';

export interface Goals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  weight: number; // Target weight in kg
  height: number; // in cm
  weightGoalMode: WeightGoalMode;
}

export interface Food {
  id: number;
  name: string;
  calories: number; // per 100g
  protein: number; // per 100g
  carbs: number; // per 100g
  fat: number; // per 100g
}

export interface FoodLogEntry {
  id: string;
  foodId: number;
  foodName: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string; // YYYY-MM-DD
}

export interface WeightLogEntry {
    id: string;
    date: string; // YYYY-MM-DD
    weight: number; // in kg
}

export type Page = 'dashboard' | 'analytics' | 'weight' | 'settings';

export type Theme = 'light' | 'dark';