import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Goals, FoodLogEntry, WeightLogEntry, Theme } from '../types';

interface UserState {
  isAuthenticated: boolean;
  user: User | null;
  goals: Goals;
  foodLog: FoodLogEntry[];
  weightLog: WeightLogEntry[];
  theme: Theme;
  login: (user: User) => void;
  logout: () => void;
  setGoals: (goals: Goals) => void;
  addFoodLogEntry: (entry: FoodLogEntry) => void;
  removeFoodLogEntry: (id: string) => void;
  addWeightLogEntry: (entry: WeightLogEntry) => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};


export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      goals: { calories: 2000, protein: 150, carbs: 200, fat: 60, weight: 75, height: 180, weightGoalMode: 'cutting' },
      foodLog: [],
      weightLog: [],
      theme: getInitialTheme(),
      login: (user) => set({ isAuthenticated: true, user }),
      logout: () => set({ isAuthenticated: false, user: null }),
      setGoals: (goals) => set({ goals }),
      addFoodLogEntry: (entry) => set((state) => ({ foodLog: [...state.foodLog, entry] })),
      removeFoodLogEntry: (id) => set((state) => ({ foodLog: state.foodLog.filter(entry => entry.id !== id) })),
      addWeightLogEntry: (entry) => set((state) => {
        const existingEntryIndex = state.weightLog.findIndex(log => log.date === entry.date);
        const newWeightLog = [...state.weightLog];
        if (existingEntryIndex > -1) {
          newWeightLog[existingEntryIndex] = { ...newWeightLog[existingEntryIndex], ...entry };
        } else {
          newWeightLog.push(entry);
        }
        newWeightLog.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return { weightLog: newWeightLog };
      }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'nutritrack-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);