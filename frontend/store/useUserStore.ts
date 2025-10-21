import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  User,
  Goals,
  FoodLogEntry,
  WeightLogEntry,
  Theme,
  WeightGoalMode,
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
  foodLog: FoodLogEntry[];
  weightLog: WeightLogEntry[];
  theme: Theme;

  // AUTH
  login: (user: User & { token?: string }) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;

  // GOALS
  setGoals: (goals: Goals) => void;

  // FOOD + WEIGHT LOGS
  addFoodLogEntry: (entry: FoodLogEntry) => void;
  removeFoodLogEntry: (id: string) => void;
  addWeightLogEntry: (entry: WeightLogEntry) => void;
  setWeightLog: (log: WeightLogEntry[]) => void;
  setFoodLog: (log: FoodLogEntry[]) => void;

  // THEME
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// 👇 Default setup for new users
const getInitialTheme = (): Theme => {
  if (
    typeof window !== "undefined" &&
    window.matchMedia &&
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

      // ✅ Login with backend user + JWT
      login: (user) => {
        set({ isAuthenticated: true, user });
      },

      // ✅ Logout — clears everything (keeps theme)
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

      // ✅ Update user info (goalWeight, goalMode, etc.)
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : state.user,
        })),

      // ✅ Update goals
      setGoals: (goals) => set({ goals }),

      // ✅ Food logs (frontend local only for now)
      addFoodLogEntry: (entry) =>
        set((state) => ({ foodLog: [...state.foodLog, entry] })),

      removeFoodLogEntry: (id) =>
        set((state) => ({
          foodLog: state.foodLog.filter((entry) => entry.id !== id),
        })),

      // ✅ Weight logs (local + optional sync with backend)
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

      setFoodLog: (log) => set({ foodLog: log }),

      // ✅ THEME CONTROL
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
