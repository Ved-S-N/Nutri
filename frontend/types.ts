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

export type WorkoutIntensity = "low" | "medium" | "high";

export interface WorkoutLogEntry {
  _id: string;
  id?: string;
  date: string; // YYYY-MM-DD
  type: string;
  durationMinutes: number;
  intensity: WorkoutIntensity;
  caloriesBurned: number;
}

export interface HydrationLogEntry {
  _id?: string;
  date: string; // YYYY-MM-DD, used as ID
  glassesConsumed: number;
  goalGlasses: number;
}

export interface WellnessLogEntry {
  _id?: string;
  date: string; // YYYY-MM-DD, used as ID
  sleepHours: number;
  moodRating: number; // 1 to 5
  notes?: string;
}

export type Page =
  | "dashboard"
  | "analytics"
  | "calendar"
  | "weight"
  | "wellness"
  | "scan"
  | "settings"
  | "insights";

export type Theme = "light" | "dark";
