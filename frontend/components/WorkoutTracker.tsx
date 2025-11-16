import React, { useState, useMemo, useEffect } from "react";
import { useUserStore } from "../store/useUserStore";
import { WorkoutIntensity } from "../types";
import Card from "./Card";
import Input from "./Input";
import Button from "./Button";
import { TrashIcon, FireIcon } from "./icons/HeroIcons";
import { apiFetch } from "../lib/api";

const getTodayDateString = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in LOCAL time

const intensityMultipliers: Record<WorkoutIntensity, number> = {
  low: 4,
  medium: 8,
  high: 12,
};

const workoutTypes = [
  "Running",
  "Cycling",
  "Weightlifting",
  "Yoga",
  "Swimming",
  "Walking",
  "Other",
];

const WorkoutTracker: React.FC = () => {
  const {
    workoutLog,
    addWorkoutLogEntry,
    removeWorkoutLogEntry,
    setWorkoutLog,
  } = useUserStore();
  const today = getTodayDateString();

  const [type, setType] = useState(workoutTypes[0]);
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState<WorkoutIntensity>("medium");

  const todaysWorkouts = useMemo(
    () => workoutLog.filter((w) => w.date === today),
    [workoutLog, today]
  );

  const totalCaloriesBurned = useMemo(
    () => todaysWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0),
    [todaysWorkouts]
  );

  // Fetch today's workouts once
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const data = await apiFetch(`/api/workouts/${today}`);

        const normalized = data.map((w: any) => ({
          id: w._id,
          date: w.date.split("T")[0],
          type: w.type,
          durationMinutes: w.durationMinutes,
          intensity: w.intensity,
          caloriesBurned: w.caloriesBurned,
        }));

        console.log("Fetched:", normalized);

        // 🔥 Replace today's workouts completely
        useUserStore.setState({ workoutLog: normalized });
      } catch (err) {
        console.error("Failed to fetch workouts:", err);
      }
    };

    fetchWorkouts();
  }, [today]); // <-- Only depend on TODAY

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    const durationMinutes = parseInt(duration, 10);
    if (isNaN(durationMinutes) || durationMinutes <= 0) return;

    const caloriesBurned = durationMinutes * intensityMultipliers[intensity];
    const newWorkout = {
      date: today,
      type,
      durationMinutes,
      intensity,
      caloriesBurned,
    };

    try {
      const saved = await apiFetch("/api/workouts", {
        method: "POST",
        body: JSON.stringify(newWorkout),
      });
      addWorkoutLogEntry({
        ...saved,
        id: saved._id,
        date: saved.date.split("T")[0],
      });
      setDuration("");
    } catch (err) {
      console.error("Failed to save workout:", err);
    }
  };

  const handleRemoveWorkout = async (id: string) => {
    try {
      await apiFetch(`/api/workouts/${id}`, { method: "DELETE" });
      removeWorkoutLogEntry(id);
    } catch (err) {
      console.error("Failed to delete workout:", err);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4">Log a Workout</h2>
        <form onSubmit={handleAddWorkout} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
              Workout Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-white/10 dark:bg-black/20 border border-black/20 dark:border-black/20 rounded-lg px-4 py-3 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {workoutTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Duration (minutes)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
              Intensity
            </label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as WorkoutIntensity[]).map(
                (level) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setIntensity(level)}
                    className={`flex-1 p-2 rounded-lg text-sm capitalize transition ${
                      intensity === level
                        ? "bg-accent text-white"
                        : "bg-neutral-200 dark:bg-neutral-700"
                    }`}
                  >
                    {level}
                  </button>
                )
              )}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Add Workout
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Today's Workouts</h2>
        <div className="flex items-center justify-center gap-2 text-rose-500 mb-4">
          <FireIcon className="w-6 h-6" />
          <p className="font-bold text-lg">
            Total Burned: {totalCaloriesBurned.toFixed(0)} kcal
          </p>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {todaysWorkouts.length > 0 ? (
            todaysWorkouts.map((w) => (
              <div
                key={w.id}
                className="flex justify-between items-center bg-white/5 dark:bg-black/10 p-3 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{w.type}</p>
                  <p className="text-sm text-neutral-500">
                    {w.durationMinutes} min • {w.intensity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-rose-500">
                    {w.caloriesBurned.toFixed(0)} kcal
                  </p>
                  <button
                    onClick={() => handleRemoveWorkout(w.id)}
                    className="text-neutral-400 hover:text-red-500"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-neutral-500 py-4">
              No workouts logged for today.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WorkoutTracker;
