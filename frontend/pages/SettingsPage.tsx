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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* PROFILE CARD */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <p>
          <strong>Name:</strong> {user?.name}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
      </Card>

      {/* GOALS CARD */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Goals</h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
              Weight Goal
            </label>
            <GoalModeSelector
              value={currentGoals.weightGoalMode}
              onChange={handleModeChange}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4 pt-2">
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

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSaveGoals}
            className="relative"
            disabled={saving}
          >
            {saving ? "Saving..." : isSaved ? "Saved!" : "Save Goals"}
          </Button>
        </div>
      </Card>

      {/* THEME TOGGLE CARD */}
      <Card>
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
      </Card>

      {/* LOGOUT */}
      <div className="pt-4">
        <Button variant="secondary" onClick={logout} className="w-full">
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
