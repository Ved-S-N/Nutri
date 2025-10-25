import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "../store/useUserStore";
import { FoodLogEntry, MealType } from "../types";
import MealSection from "../components/MealSection";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import { CalendarDaysIcon } from "../components/icons/HeroIcons";
import { apiFetch } from "../lib/api"; // <-- make sure this helper attaches JWT token!

const getTodayDateString = () => new Date().toISOString().split("T")[0];

const CalendarPage: React.FC = () => {
  const { foodLog, goals, setFoodLog, user } = useUserStore();
  const [selectedDate, setSelectedDate] = useState<string>(
    getTodayDateString()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // 🔁 Fetch logs from backend whenever selectedDate changes
  useEffect(() => {
    const fetchDailyLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiFetch(`/api/food-log/daily?date=${selectedDate}`);
        // Response: { logs: [{ _id, food: {_id, name}, quantity, calories, protein, carbs, fat, date, mealType }], totals: {...} }

        if (data?.logs && Array.isArray(data.logs)) {
          const mappedLogs = data.logs.map((log: any) => ({
            id: log._id,
            foodId: log.food._id,
            foodName: log.food.name,
            quantity: log.quantity,
            calories: log.calories,
            protein: log.protein,
            carbs: log.carbs,
            fat: log.fat,
            date: new Date(log.date).toISOString().split("T")[0],
            mealType: log.mealType,
          }));
          setFoodLog(mappedLogs); // ✅ store in Zustand
        } else {
          setFoodLog([]); // no data for this date
        }
      } catch (err) {
        console.error("Error fetching daily logs:", err);
        setError("Could not load food logs for this date");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDailyLogs();
  }, [selectedDate, user, setFoodLog]);

  // 🗓️ Date range (last 7 days)
  const dateRange = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    return dates;
  }, []);

  // 🔍 Filter logs by selected date
  const logsForSelectedDate = useMemo(() => {
    return foodLog.filter((entry) => entry.date === selectedDate);
  }, [foodLog, selectedDate]);

  // 🍽️ Split into meals
  const meals = useMemo(() => {
    const mealData: Record<MealType, FoodLogEntry[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
    logsForSelectedDate.forEach((entry) => {
      if (entry.mealType && mealData[entry.mealType]) {
        mealData[entry.mealType].push(entry);
      }
    });
    return mealData;
  }, [logsForSelectedDate]);

  // 📊 Totals
  const dailyTotals = useMemo(() => {
    return logsForSelectedDate.reduce(
      (acc, entry) => {
        acc.calories += entry.calories;
        acc.protein += entry.protein;
        acc.carbs += entry.carbs;
        acc.fat += entry.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [logsForSelectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nutrition Calendar</h1>

      <Card>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-2 px-2">
          {dateRange.map((date) => {
            const dateString = date.toISOString().split("T")[0];
            const isSelected = dateString === selectedDate;
            return (
              <motion.button
                key={dateString}
                onClick={() => setSelectedDate(dateString)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 p-3 rounded-lg w-16 text-center transition-colors ${
                  isSelected
                    ? "bg-accent text-white shadow-md"
                    : "bg-neutral-200/50 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                <p className="font-semibold text-sm">
                  {date.toLocaleString("en-US", { weekday: "short" })}
                </p>
                <p className="font-bold text-xl">{date.getDate()}</p>
              </motion.button>
            );
          })}
          <motion.button
            onClick={() => dateInputRef.current?.showPicker()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex-shrink-0 p-3 rounded-lg w-16 h-[76px] text-center transition-colors bg-neutral-200/50 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <CalendarDaysIcon className="w-8 h-8 mx-auto text-neutral-500" />
            <p className="text-xs mt-1 text-neutral-500">More</p>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </motion.button>
        </div>
      </Card>

      {loading && (
        <p className="text-center text-neutral-400">Loading daily logs...</p>
      )}
      {error && <p className="text-center text-red-400 text-sm">{error}</p>}

      <motion.div layout className="space-y-4">
        <MealSection
          icon="🥣"
          title="Breakfast"
          mealType="breakfast"
          entries={meals.breakfast}
          date={selectedDate}
        />
        <MealSection
          icon="🍛"
          title="Lunch"
          mealType="lunch"
          entries={meals.lunch}
          date={selectedDate}
        />
        <MealSection
          icon="🌮"
          title="Dinner"
          mealType="dinner"
          entries={meals.dinner}
          date={selectedDate}
        />
        <MealSection
          icon="🍎"
          title="Snacks"
          mealType="snack"
          entries={meals.snack}
          date={selectedDate}
        />
      </motion.div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Daily Summary</h2>
        {logsForSelectedDate.length > 0 ? (
          <div className="space-y-4">
            <ProgressBar
              label="Calories"
              value={dailyTotals.calories}
              max={goals.calories}
            />
            <ProgressBar
              label="Protein"
              value={dailyTotals.protein}
              max={goals.protein}
            />
            <ProgressBar
              label="Carbs"
              value={dailyTotals.carbs}
              max={goals.carbs}
            />
            <ProgressBar label="Fat" value={dailyTotals.fat} max={goals.fat} />
          </div>
        ) : (
          <p className="text-center text-neutral-500 py-6">
            No food logged for this day yet.
          </p>
        )}
      </Card>
    </div>
  );
};

export default CalendarPage;
