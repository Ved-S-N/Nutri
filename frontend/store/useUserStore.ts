import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  User,
  Goals,
  FoodLogEntry,
  WeightLogEntry,
  Theme,
  WeightGoalMode,
  MealType,
} from "../types";

interface UserState {
  isAuthenticated: boolean;
  user:
    | (User & {
        token?: string;
        goalWeight?: number;
        goalMode?: WeightGoalMode;
      })
    | null;
  goals: Goals;
  foodLog: FoodLogEntry[]; // Now includes mealType + date
  weightLog: WeightLogEntry[];
  theme: Theme;

  // AUTH
  login: (user: User & { token?: string }) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;

  // GOALS
  setGoals: (goals: Goals) => void;

  // FOOD LOGS
  addFoodLogEntry: (entry: FoodLogEntry) => void;
  removeFoodLogEntry: (id: string) => void;
  updateFoodLogEntry: (id: string, data: Partial<FoodLogEntry>) => void;
  getFoodLogByDate: (date: string) => FoodLogEntry[];
  getFoodLogByDateAndMeal: (date: string, meal: MealType) => FoodLogEntry[];
  setFoodLog: (log: FoodLogEntry[]) => void;

  // WEIGHT LOGS
  addWeightLogEntry: (entry: WeightLogEntry) => void;
  setWeightLog: (log: WeightLogEntry[]) => void;

  // THEME
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const getInitialTheme = (): Theme => {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
};

const defaultGoals: Goals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 60,
  weight: 75,
  height: 180,
  weightGoalMode: "maintenance",
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      goals: defaultGoals,
      foodLog: [],
      weightLog: [],
      theme: getInitialTheme(),

      // ✅ AUTH
      login: (user) => set({ isAuthenticated: true, user }),
      logout: () => {
        const theme = get().theme;
        set({
          isAuthenticated: false,
          user: null,
          goals: defaultGoals,
          foodLog: [],
          weightLog: [],
          theme,
        });
        localStorage.removeItem("nutritrack-storage");
      },
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : state.user,
        })),

      // ✅ GOALS
      setGoals: (goals) => set({ goals }),

      // ✅ FOOD LOGS
      addFoodLogEntry: (entry) =>
        set((state) => ({
          foodLog: [
            ...state.foodLog,
            {
              ...entry,
              id: entry.id || `${Date.now()}-${Math.random()}`,
              date: entry.date || new Date().toISOString().split("T")[0],
              mealType: entry.mealType || "lunch",
            },
          ],
        })),

      removeFoodLogEntry: (id) =>
        set((state) => ({
          foodLog: state.foodLog.filter((entry) => entry.id !== id),
        })),

      updateFoodLogEntry: (id, data) =>
        set((state) => ({
          foodLog: state.foodLog.map((entry) =>
            entry.id === id ? { ...entry, ...data } : entry
          ),
        })),

      getFoodLogByDate: (date) =>
        get().foodLog.filter((entry) => entry.date === date),

      getFoodLogByDateAndMeal: (date, meal) =>
        get().foodLog.filter(
          (entry) => entry.date === date && entry.mealType === meal
        ),

      setFoodLog: (log) => set({ foodLog: log }),

      // ✅ WEIGHT LOGS
      addWeightLogEntry: (entry) =>
        set((state) => {
          const existingIndex = state.weightLog.findIndex(
            (log) => log.date === entry.date
          );
          const updated = [...state.weightLog];
          if (existingIndex > -1) {
            updated[existingIndex] = { ...updated[existingIndex], ...entry };
          } else {
            updated.push(entry);
          }
          updated.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          return { weightLog: updated };
        }),
      setWeightLog: (log) => set({ weightLog: log }),

      // ✅ THEME
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "nutritrack-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        goals: state.goals,
        theme: state.theme,
      }),
    }
  )
);
