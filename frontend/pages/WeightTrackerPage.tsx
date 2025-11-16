import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "../store/useUserStore";
import Card from "../components/Card";
import LineChart from "../components/LineChart";
import Input from "../components/Input";
import Button from "../components/Button";
import { WeightGoalMode } from "../types";
import { apiFetch } from "../lib/api"; // 👈 we'll add this helper below

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const goalModes: { value: WeightGoalMode; label: string }[] = [
  { value: "cutting", label: "Cutting" },
  { value: "maintenance", label: "Maintenance" },
  { value: "bulking", label: "Bulking" },
];

const getModeStyles = (mode: WeightGoalMode) => {
  switch (mode) {
    case "cutting":
      return {
        color: "#ef4444",
        motivational: "🔥 Keep trimming, you’re on the right track!",
      };
    case "bulking":
      return {
        color: "#38bdf8",
        motivational: "💪 Gains incoming — steady progress!",
      };
    case "maintenance":
      return {
        color: "#16a34a",
        motivational: "🌿 Balanced and consistent — perfect zone!",
      };
    default:
      return {
        color: "#16a34a",
        motivational: "🌿 Balanced and consistent — perfect zone!",
      };
  }
};

const WeightTrackerPage: React.FC = () => {
  const { user, goals, weightLog, addWeightLogEntry, setWeightLog, setGoals } =
    useUserStore();
  const today = getTodayDateString();

  const todayLog = weightLog.find((entry) => entry.date === today);
  const [weight, setWeight] = useState<string>(
    todayLog?.weight.toString() || ""
  );
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔄 Load previous weight logs from backend
  useEffect(() => {
    const fetchWeights = async () => {
      if (!user?.token) return;
      try {
        setLoading(true);
        const data = await apiFetch("/api/user/weight-log", { method: "GET" });
        if (Array.isArray(data)) {
          setWeightLog(data);
        }
      } catch (err) {
        console.error("Error loading weights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeights();
  }, [user?.token, setWeightLog]);

  useEffect(() => {
    console.log("💾 Weight Log Data:", weightLog);
  }, [weightLog]);

  // 💾 Save today’s weight (local + backend)
  const handleSaveWeight = async () => {
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) return;

    try {
      addWeightLogEntry({
        id: new Date().toISOString(),
        date: today,
        weight: weightValue,
      });

      if (user?.token) {
        await apiFetch("/api/user/weight-log", {
          method: "POST",
          body: JSON.stringify({ weight: weightValue }),
        });
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error("Error saving weight:", err);
    }
  };

  const handleModeChange = (mode: WeightGoalMode) => {
    setGoals({ ...goals, weightGoalMode: mode });
  };

  const weightChartData = useMemo(
    () =>
      weightLog.map((entry) => ({
        date: new Date(entry.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        weight: entry.weight,
      })),
    [weightLog]
  );

  const weightHistory = useMemo(() => {
    return [...weightLog]
      .reverse()
      .map((entry, index, arr) => {
        const prev = arr[index + 1];
        const change = prev ? entry.weight - prev.weight : 0;
        return { ...entry, change };
      })
      .slice(0, 7);
  }, [weightLog]);

  const { bmi, bmiCategory, bmiColor, progressText, modeStyles } =
    useMemo(() => {
      const latestWeight =
        weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : null;

      // BMI calculation
      let bmiValue = null,
        category = "N/A",
        bmiBg = "bg-neutral-500";
      if (latestWeight && goals.height > 0) {
        const heightInMeters = goals.height / 100;
        bmiValue = latestWeight / (heightInMeters * heightInMeters);
        if (bmiValue < 18.5) {
          category = "Underweight";
          bmiBg = "bg-blue-500";
        } else if (bmiValue < 25) {
          category = "Normal";
          bmiBg = "bg-accent";
        } else if (bmiValue < 30) {
          category = "Overweight";
          bmiBg = "bg-orange-500";
        } else {
          category = "Obese";
          bmiBg = "bg-red-500";
        }
      }

      // Progress logic
      const styles = getModeStyles(goals.weightGoalMode);
      let progText = "Log weight to see progress.";
      if (latestWeight !== null) {
        switch (goals.weightGoalMode) {
          case "cutting":
            const toLose = latestWeight - goals.weight;
            progText =
              toLose > 0 ? `${toLose.toFixed(1)} kg to lose` : `Goal reached!`;
            break;
          case "bulking":
            const toGain = goals.weight - latestWeight;
            progText =
              toGain > 0 ? `${toGain.toFixed(1)} kg to gain` : `Goal reached!`;
            break;
          case "maintenance":
            const diff = Math.abs(latestWeight - goals.weight);
            progText =
              diff <= 1
                ? `Within 1kg of target`
                : `${diff.toFixed(1)} kg from target`;
            break;
        }
      }

      return {
        bmi: bmiValue,
        bmiCategory: category,
        bmiColor: bmiBg,
        progressText: progText,
        modeStyles: styles,
      };
    }, [weightLog, goals]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <h1 className="text-3xl font-bold">Weight</h1>

      {/* FIRST ROW (Mobile friendly) */}
      <div className="space-y-6">
        {/* INPUT CARD */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Today's Weight</h2>

          <div className="flex flex-col gap-4">
            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g., 75.5"
            />

            <Button onClick={handleSaveWeight} disabled={!weight || loading}>
              {isSaved ? "Saved!" : loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </Card>

        {/* STATS CARD */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Vital Stats</h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-sm text-neutral-500">BMI</p>
              <p className="font-bold text-2xl">{bmi ? bmi.toFixed(1) : "-"}</p>
              <span
                className={`px-2 py-0.5 mt-1 inline-block text-xs text-white rounded-full ${bmiColor}`}
              >
                {bmiCategory}
              </span>
            </div>

            <div className="text-center">
              <p className="text-sm text-neutral-500">Progress</p>
              <p
                className="font-bold text-2xl"
                style={{ color: modeStyles.color }}
              >
                {progressText.split(" ")[0]}
              </p>
              <span className="text-xs text-neutral-500">
                {progressText.substring(progressText.indexOf(" ") + 1)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* TREND CARD */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Weight Trend</h2>

        {/* Mobile friendly tab selector */}
        <div className="flex w-full p-1 space-x-1 bg-neutral-200 dark:bg-neutral-700/50 rounded-lg overflow-x-auto scrollbar-none">
          {goalModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleModeChange(mode.value)}
              className={`relative flex-1 min-w-[100px] text-center px-4 py-2 text-sm rounded-md transition-colors ${
                goals.weightGoalMode === mode.value
                  ? "text-white"
                  : "text-neutral-700 dark:text-neutral-300"
              }`}
            >
              {goals.weightGoalMode === mode.value && (
                <motion.div
                  layoutId="weightModeIndicator"
                  className="absolute inset-0 rounded-md"
                  style={{ backgroundColor: modeStyles.color }}
                />
              )}
              <span className="relative z-10">{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Chart */}
        {weightChartData.length > 1 ? (
          <div className="mt-4">
            <LineChart
              data={weightChartData}
              dataKey="weight"
              xAxisKey="date"
              unit="kg"
              strokeColor={modeStyles.color}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-neutral-500">
              Log a few entries to see the chart.
            </p>
            <p className="text-xs text-neutral-500 mt-2">
              {modeStyles.motivational}
            </p>
          </div>
        )}
      </Card>

      {/* HISTORY CARD */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">History</h2>

        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2 scrollbar-none">
          {weightHistory.length > 0 ? (
            weightHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex justify-between items-center bg-white/5 dark:bg-black/20 p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-neutral-500">{entry.weight} kg</p>
                </div>
                <p
                  className={`font-semibold ${
                    entry.change > 0
                      ? "text-red-500"
                      : entry.change < 0
                      ? "text-green-400"
                      : "text-neutral-500"
                  }`}
                >
                  {entry.change > 0 && "+"}
                  {entry.change.toFixed(1)} kg
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-neutral-500 py-4">No entries yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WeightTrackerPage;
