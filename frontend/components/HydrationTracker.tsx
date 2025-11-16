import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "../store/useUserStore";
import { apiFetch } from "../lib/api";
import Card from "./Card";
import Button from "./Button";

// ✅ Use local date (NOT UTC)
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const HydrationTracker: React.FC = () => {
  const { hydrationLog, setHydrationForDate } = useUserStore();
  const [today, setToday] = useState(getTodayDateString());

  // 🧠 Get today's hydration data from store
  const todaysLog = useMemo(
    () =>
      hydrationLog.find((h) => h.date === today) || {
        date: today,
        glassesConsumed: 0,
        goalGlasses: 8,
      },
    [hydrationLog, today]
  );

  const [localConsumed, setLocalConsumed] = useState(todaysLog.glassesConsumed);
  const [goal, setGoal] = useState(todaysLog.goalGlasses);
  const [loading, setLoading] = useState(false);

  // 🔁 Sync local state when store changes (e.g., when backend updates or refresh)
  useEffect(() => {
    setLocalConsumed(todaysLog.glassesConsumed);
    setGoal(todaysLog.goalGlasses);
  }, [todaysLog.glassesConsumed, todaysLog.goalGlasses]);

  // 🧩 Fetch today's hydration from backend on mount
  useEffect(() => {
    const fetchHydration = async () => {
      try {
        const data = await apiFetch(`/api/hydration/${today}`);
        if (data) {
          setHydrationForDate({
            date: getTodayDateString(),
            glassesConsumed: data.glassesConsumed || 0,
            goalGlasses: data.goalGlasses || 8,
          });
          setLocalConsumed(data.glassesConsumed || 0);
          setGoal(data.goalGlasses || 8);
        }
      } catch (err) {
        console.error("Failed to fetch hydration:", err);
      }
    };
    fetchHydration();
  }, [today, setHydrationForDate]);

  // ⏰ Auto-detect day rollover (refresh at midnight)
  useEffect(() => {
    const interval = setInterval(() => {
      const newToday = getTodayDateString();
      if (newToday !== today) {
        console.log("🌅 Date changed — resetting hydration tracker");
        setToday(newToday);
      }
    }, 60_000); // check every minute
    return () => clearInterval(interval);
  }, [today]);

  // 💧 Update hydration instantly + sync to backend
  const handleUpdate = async (newConsumed: number, newGoal: number) => {
    const sanitized = Math.max(0, newConsumed);
    setLocalConsumed(sanitized);
    setHydrationForDate({
      date: today,
      glassesConsumed: sanitized,
      goalGlasses: newGoal,
    });

    setLoading(true);
    try {
      const updated = await apiFetch("/api/hydration", {
        method: "POST",
        body: JSON.stringify({
          date: today,
          glassesConsumed: sanitized,
          goalGlasses: newGoal,
        }),
      });
      // ✅ Backend-confirmed update
      setHydrationForDate({
        date: today,
        glassesConsumed: updated.glassesConsumed,
        goalGlasses: updated.goalGlasses,
      });
    } catch (err) {
      console.error("Failed to update hydration:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGoal = parseInt(e.target.value, 10);
    if (!isNaN(newGoal) && newGoal > 0) {
      setGoal(newGoal);
      handleUpdate(localConsumed, newGoal);
    }
  };

  const progress = Math.min(localConsumed / goal, 1);

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-center">
          Today's Hydration
        </h2>

        <div className="relative flex justify-center items-center my-6">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              strokeWidth="16"
              className="stroke-current text-neutral-200 dark:text-neutral-700"
              fill="transparent"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              strokeWidth="16"
              className="stroke-current text-blue-500"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - progress)}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-5xl font-bold">{localConsumed}</p>
            <p className="text-neutral-500">of {goal} glasses</p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="secondary"
            disabled={loading || localConsumed <= 0}
            onClick={() => handleUpdate(localConsumed - 1, goal)}
          >
            -1
          </Button>
          <Button
            disabled={loading}
            onClick={() => handleUpdate(localConsumed + 1, goal)}
          >
            +1 Glass
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Set Goal</h2>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="4"
            max="20"
            value={goal}
            onChange={handleGoalChange}
            className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="font-semibold">{goal} glasses</span>
        </div>
      </Card>
    </div>
  );
};

export default HydrationTracker;
