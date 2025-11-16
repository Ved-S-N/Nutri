import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "../store/useUserStore";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { Goals, WeightGoalMode } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const goalModes: { value: WeightGoalMode; label: string }[] = [
  { value: "cutting", label: "Cutting" },
  { value: "maintenance", label: "Maintenance" },
  { value: "bulking", label: "Bulking" },
];

const GoalModeSelector: React.FC<{
  value: WeightGoalMode;
  onChange: (value: WeightGoalMode) => void;
}> = ({ value, onChange }) => (
  <div className="flex w-full p-1 space-x-1 bg-neutral-200 dark:bg-neutral-700 rounded-lg">
    {goalModes.map((mode) => (
      <button
        key={mode.value}
        onClick={() => onChange(mode.value)}
        className={`relative w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          value === mode.value
            ? "text-white"
            : "text-neutral-600 dark:text-neutral-300 hover:bg-white/10"
        }`}
      >
        {value === mode.value && (
          <motion.div
            layoutId="goalModeIndicator"
            className="absolute inset-0 bg-accent rounded-md z-0"
          />
        )}
        <span className="relative z-10">{mode.label}</span>
      </button>
    ))}
  </div>
);

const SettingsPage: React.FC = () => {
  const { user, goals, setGoals, logout, theme, toggleTheme, updateUser } =
    useUserStore();
  const [currentGoals, setCurrentGoals] = useState<Goals>(goals);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentGoals(goals);
  }, [goals]);

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentGoals({
      ...currentGoals,
      [e.target.name]: Number(e.target.value),
    });
  };

  const handleModeChange = (mode: WeightGoalMode) => {
    setCurrentGoals({
      ...currentGoals,
      weightGoalMode: mode,
    });
  };

  const handleSaveGoals = async () => {
    if (!user?.token) return;
    setSaving(true);
    setError(null);

    try {
      // ✅ Update backend goal weight + mode
      const res = await fetch(`${API_URL}/api/user/update-goal`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          goalWeight: currentGoals.weight,
          goalMode: currentGoals.weightGoalMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update goals");

      // ✅ update local state with new goals
      setGoals(currentGoals);
      updateUser({
        ...user,
        goalWeight: currentGoals.weight,
        goalMode: currentGoals.weightGoalMode,
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error saving goals");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-28 relative px-4">
      {/* Gradient Background Glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-xl" />

      <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
      <p className="text-neutral-400 mt-1 text-md">
        Manage your goals & preferences.
      </p>

      {/* PROFILE CARD */}
      <Card
        className="
  rounded-3xl bg-white/5 dark:bg-black/10 
  backdrop-blur-xl border border-white/10
  shadow-[0_6px_25px_-10px_rgba(0,0,0,0.5)]
  p-5 space-y-4
"
      >
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <div className="space-y-1 text-neutral-300">
          <p>
            <span className="text-neutral-500">Name:</span> {user?.name}
          </p>
          <p>
            <span className="text-neutral-500">Email:</span> {user?.email}
          </p>
        </div>
      </Card>

      {/* GOALS CARD */}
      <Card
        className="
  rounded-3xl bg-white/5 dark:bg-black/10 
  backdrop-blur-xl border border-white/10
  shadow-[0_6px_25px_-10px_rgba(0,0,0,0.5)]
  p-5 space-y-4
"
      >
        <h2 className="text-xl font-semibold mb-4">Goals</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Weight (kg)"
              id="weight"
              name="weight"
              type="number"
              value={currentGoals.weight}
              onChange={handleGoalChange}
            />
            <Input
              label="Height (cm)"
              id="height"
              name="height"
              type="number"
              value={currentGoals.height}
              onChange={handleGoalChange}
            />
          </div>
          <label className="block text-md font-medium text-white-600 dark:text-white-400 mb-2">
            Weight Goal
          </label>
          <div className="flex w-full p-1 overflow-x-auto space-x-1 bg-neutral-200 dark:bg-neutral-700 rounded-2xl">
            <GoalModeSelector
              value={currentGoals.weightGoalMode}
              onChange={handleModeChange}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Calories (kcal)"
              id="calories"
              name="calories"
              type="number"
              value={currentGoals.calories}
              onChange={handleGoalChange}
            />
            <Input
              label="Protein (g)"
              id="protein"
              name="protein"
              type="number"
              value={currentGoals.protein}
              onChange={handleGoalChange}
            />
            <Input
              label="Carbs (g)"
              id="carbs"
              name="carbs"
              type="number"
              value={currentGoals.carbs}
              onChange={handleGoalChange}
            />
            <Input
              label="Fat (g)"
              id="fat"
              name="fat"
              type="number"
              value={currentGoals.fat}
              onChange={handleGoalChange}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mt-4">{error}</p>
        )}

        <div className="mt-6 flex ">
          <Button
            onClick={handleSaveGoals}
            disabled={saving}
            className="w-full py-3 text-lg font-semibold"
          >
            {saving ? "Saving..." : isSaved ? "Saved!" : "Save Goals"}
          </Button>
        </div>
      </Card>

      {/* THEME TOGGLE CARD */}
      {/* <Card>
        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <span>Theme</span>
          <button
            onClick={toggleTheme}
            className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-neutral-200 dark:bg-neutral-600"
          >
            <span
              className={`${
                theme === "dark" ? "translate-x-6" : "translate-x-1"
              } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
          </button>
        </div>
      </Card> */}

      {/* LOGOUT */}
      <div className="pt-2">
        <Button
          variant="secondary"
          onClick={logout}
          className="w-full py-3 rounded-2xl text-lg"
        >
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
