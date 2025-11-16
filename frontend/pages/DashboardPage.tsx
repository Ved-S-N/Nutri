import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "../store/useUserStore";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import DonutChart from "../components/DonutChart";
import AddFoodModal from "../components/AddFoodModal";
import { PlusIcon } from "../components/icons/HeroIcons";
import { apiFetch } from "../lib/api";
import Button from "../components/Button";
import AIInputBox from "../components/AIInputBox";
import MacroSummaryBar from "../components/MacroSummaryBar";
import {
  FoodLogEntry,
  WorkoutLogEntry,
  HydrationLogEntry,
  WellnessLogEntry,
} from "../types";

// --- Animated Menu Variants ---
const menuVariants = {
  closed: {
    scale: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
  open: {
    scale: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
};

const itemVariants = {
  closed: { y: 20, opacity: 0 },
  open: { y: 0, opacity: 1 },
};

// Meal options for menu
const mealOptions = [
  { label: "Breakfast", value: "breakfast", emoji: "🥣" },
  { label: "Lunch", value: "lunch", emoji: "🍛" },
  { label: "Dinner", value: "dinner", emoji: "🌮" },
  { label: "Snack", value: "snack", emoji: "🍎" },
];

// Helper to format date
const formatDateToLocalYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const getTodayDateString = () => formatDateToLocalYYYYMMDD(new Date());

const moodMap: Record<number, { label: string; emoji: string }> = {
  1: { label: "Terrible", emoji: "😞" },
  2: { label: "Bad", emoji: "😕" },
  3: { label: "Okay", emoji: "😐" },
  4: { label: "Good", emoji: "😊" },
  5: { label: "Great", emoji: "😁" },
};

const DashboardPage: React.FC = () => {
  const {
    user,
    goals,
    foodLog,
    setFoodLog,
    workoutLog,
    setWorkoutLog,
    hydrationLog,
    setHydrationLog,
    wellnessLog,
    setWellnessLog,
  } = useUserStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const today = getTodayDateString();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealType | undefined>(
    undefined
  );

  // 🧠 Fetch all dashboard data
  useEffect(() => {
    const fetchAll = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [foodData, workoutData, hydrationData, wellnessData] =
          await Promise.all([
            apiFetch(`/api/food-log/daily?date=${today}`),
            apiFetch(`/api/workouts/${today}`),
            apiFetch(`/api/hydration/${today}`),
            apiFetch(`/api/wellness/${today}`),
          ]);

        console.log("Fetched Data:", {
          foodData,
          workoutData,
          hydrationData,
          wellnessData,
        });

        // Food log
        if (foodData?.logs && Array.isArray(foodData.logs)) {
          setFoodLog(
            foodData.logs.map((log: any) => ({
              ...log,
              id: log._id || log.id,
              date: log.date
                ? formatDateToLocalYYYYMMDD(new Date(log.date))
                : today,
            }))
          );
        } else setFoodLog([]);

        // Workout
        if (Array.isArray(workoutData)) {
          setWorkoutLog(
            workoutData.map((w: any) => ({
              ...w,
              id: w._id || w.id,
              date: w.date
                ? formatDateToLocalYYYYMMDD(new Date(w.date))
                : today,
            }))
          );
        } else setWorkoutLog([]);

        // Hydration
        if (hydrationData && typeof hydrationData === "object") {
          const formattedDate = hydrationData.date
            ? formatDateToLocalYYYYMMDD(new Date(hydrationData.date))
            : today;
          setHydrationLog([
            {
              ...hydrationData,
              id: hydrationData._id || hydrationData.id,
              date: formattedDate,
            },
          ]);
        } else setHydrationLog([]);

        // Wellness
        if (wellnessData && typeof wellnessData === "object") {
          const formattedDate = wellnessData.date
            ? formatDateToLocalYYYYMMDD(new Date(wellnessData.date))
            : today;
          setWellnessLog([
            {
              ...wellnessData,
              id: wellnessData._id || wellnessData.id,
              date: formattedDate,
            },
          ]);
        } else setWellnessLog([]);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setFoodLog([]);
        setWorkoutLog([]);
        setHydrationLog([]);
        setWellnessLog([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [
    user?.token,
    today,
    setFoodLog,
    setWorkoutLog,
    setHydrationLog,
    setWellnessLog,
  ]);

  // 🍱 Filter today's data
  const todaysFoodLog = useMemo(
    () => foodLog.filter((entry) => entry.date === today),
    [foodLog, today]
  );
  const todaysWorkoutLog = workoutLog.filter((w) => w.date === today);
  const todaysHydrationLog = hydrationLog.find((h) => h.date === today);
  const todaysWellnessLog = wellnessLog.find((w) => w.date === today);

  // 🧮 Calculate totals
  const totals = useMemo(() => {
    const foodTotals = todaysFoodLog.reduce(
      (acc, entry) => {
        acc.calories += entry.calories || 0;
        acc.protein += entry.protein || 0;
        acc.carbs += entry.carbs || 0;
        acc.fat += entry.fat || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const caloriesBurned = todaysWorkoutLog.reduce(
      (acc, entry) => acc + (entry.caloriesBurned || 0),
      0
    );

    const netCalories = foodTotals.calories - caloriesBurned;
    return { ...foodTotals, caloriesBurned, netCalories };
  }, [todaysFoodLog, todaysWorkoutLog]);

  const macroChartData = [
    { name: "Protein", value: totals.protein },
    { name: "Carbs", value: totals.carbs },
    { name: "Fat", value: totals.fat },
  ];

  const handleFoodAdded = (_food: FoodLogEntry) => {
    console.log("Food added from modal — refresh triggered.");
  };

  const refreshAIFoods = async () => {
    try {
      const aiEntries = await apiFetch("/api/ai-food/today");
      if (Array.isArray(aiEntries)) {
        setFoodLog((prev) => [
          ...prev,
          ...aiEntries.map((f: any) => ({
            ...f,
            id: f._id,
            date: formatDateToLocalYYYYMMDD(new Date(f.date)),
          })),
        ]);
      }
    } catch (err) {
      console.error("Failed to load AI entries:", err);
    }
  };

  return (
    <div className="space-y-6 pb-2">
      <h1 className="text-3xl font-bold">
        {user ? `Hello, ${user.name}!` : "Welcome!"}
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400">
        Here’s your progress for today.
      </p>

      {/* CALORIES */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Calories</h2>
        {loading ? (
          <p className="text-neutral-400 text-sm">Loading data...</p>
        ) : (
          <>
            <ProgressBar
              label="Net Intake"
              value={totals.netCalories}
              max={goals.calories}
            />
            <div className="mt-4 grid grid-cols-3 text-center divide-x divide-neutral-200 dark:divide-neutral-700">
              <div>
                <p className="text-sm text-neutral-500">Intake</p>
                <p className="font-bold text-lg">
                  {totals.calories.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Burned</p>
                <p className="font-bold text-lg text-rose-500">
                  {totals.caloriesBurned.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Net</p>
                <p className="font-bold text-lg text-accent">
                  {totals.netCalories.toFixed(0)}
                </p>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* MACROS */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Protein</h2>
          <ProgressBar label="g" value={totals.protein} max={goals.protein} />
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Carbs</h2>
          <ProgressBar label="g" value={totals.carbs} max={goals.carbs} />
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Fat</h2>
          <ProgressBar label="g" value={totals.fat} max={goals.fat} />
        </Card>
      </div>

      {/* MACRO BREAKDOWN */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Macro Breakdown</h2>
        {!loading && todaysFoodLog.length === 0 ? (
          <div className="text-center text-neutral-500 py-10">
            <p>No food logged for today.</p>
          </div>
        ) : !loading ? (
          <DonutChart data={macroChartData} />
        ) : (
          <div className="flex justify-center items-center h-48">
            <p className="text-neutral-400 text-sm">Loading chart...</p>
          </div>
        )}
      </Card>

      {/* HYDRATION + WELLNESS */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-2">Hydration</h3>
          {loading ? (
            <p className="text-neutral-400 text-sm">Loading...</p>
          ) : (
            <>
              <p className="text-2xl font-bold">
                {todaysHydrationLog
                  ? `${todaysHydrationLog.glassesConsumed} / ${todaysHydrationLog.goalGlasses}`
                  : "0 / 8"}{" "}
                <span className="text-base font-normal text-neutral-500">
                  glasses
                </span>
              </p>
              {todaysHydrationLog && todaysHydrationLog.goalGlasses > 0 && (
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (todaysHydrationLog.glassesConsumed /
                          todaysHydrationLog.goalGlasses) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
              )}
            </>
          )}
        </Card>

        <Card>
          {loading ? (
            <p className="text-neutral-400 text-sm">Loading...</p>
          ) : (
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">Sleep</h3>
                <p className="text-2xl font-bold">
                  {todaysWellnessLog
                    ? `${todaysWellnessLog.sleepHours.toFixed(1)}`
                    : "-"}{" "}
                  <span className="text-base font-normal text-neutral-500">
                    hours
                  </span>
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Mood</h3>
                <p className="text-3xl">
                  {todaysWellnessLog &&
                  todaysWellnessLog.moodRating >= 1 &&
                  todaysWellnessLog.moodRating <= 5
                    ? moodMap[todaysWellnessLog.moodRating]?.emoji
                    : "🤔"}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {todaysWellnessLog &&
                  todaysWellnessLog.moodRating >= 1 &&
                  todaysWellnessLog.moodRating <= 5
                    ? moodMap[todaysWellnessLog.moodRating]?.label
                    : "Not Logged"}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 🧠 AI INPUT BOX */}
      {/* <AIInputBox onAIEntryAdded={refreshAIFoods} /> */}

      {/* ➕ Floating Add Button with Animated Menu */}
      <motion.div
        className="sticky bottom-24 ml-auto right-0 pb-3 z-50 w-fit animate-float"
        whileHover={{ scale: 1.02 }}
      >
        {/* Meal Add Menu */}
        <div className="relative flex flex-col items-end">
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="flex flex-col items-end space-y-3 mb-3"
              >
                {mealOptions.map(({ label, value, emoji }) => (
                  <motion.button
                    key={value}
                    variants={itemVariants}
                    onClick={() => {
                      setSelectedMeal(value);
                      setIsMenuOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-white/10 hover:bg-accent/20 text-neutral-200 px-4 py-2 rounded-full shadow-md backdrop-blur-md transition"
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Floating Button */}
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-full w-16 h-16 shadow-lg !p-0 flex items-center justify-center mt-4 bg-accent text-white"
          >
            <motion.div animate={{ rotate: isMenuOpen ? 45 : 0 }}>
              <PlusIcon className="w-8 h-8" />
            </motion.div>
          </Button>
        </div>
      </motion.div>

      {/* ADD FOOD MODAL */}
      {/* <AddFoodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={today}
        onFoodAdded={handleFoodAdded}
      /> */}

      <AddFoodModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMeal(undefined);
        }}
        date={today}
        onFoodAdded={handleFoodAdded}
        mealType={selectedMeal}
      />

      {/* 🧾 MACRO SUMMARY BAR */}
      {/* <MacroSummaryBar
        calories={totals.calories}
        protein={totals.protein}
        carbs={totals.carbs}
        fat={totals.fat}
      /> */}
    </div>
  );
};

export default DashboardPage;
