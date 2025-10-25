export interface User {
  name: string;
  email: string;
  token: string;
}

export type WeightGoalMode = "cutting" | "bulking" | "maintenance";

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

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodLogEntry {
  _id?: string; //from mongodb
  id?: string; //for frontend/fallback use
  foodId: number;
  foodName: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string; // YYYY-MM-DD
  mealType: MealType;
}

export interface WeightLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // in kg
}

export type Page =
  | "dashboard"
  | "analytics"
  | "calendar"
  | "weight"
  | "settings";

export type Theme = "light" | "dark";
