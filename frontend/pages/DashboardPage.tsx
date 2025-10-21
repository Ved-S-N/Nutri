import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "../store/useUserStore";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import DonutChart from "../components/DonutChart";
import AddFoodModal from "../components/AddFoodModal";
import { PlusIcon } from "../components/icons/HeroIcons";
import { apiFetch } from "../lib/api";
import { FoodLogEntry } from "../types";

const getTodayDateString = () => new Date().toISOString().split("T")[0];

const DashboardPage: React.FC = () => {
  // 1. Get the new `setFoodLog` function from your store
  const { user, goals, foodLog, setFoodLog } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Start in loading state
  const today = getTodayDateString();

  // 2. This useEffect is now corrected to fetch and set data properly
  useEffect(() => {
    const fetchFoodLogs = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }
      try {
        // setLoading(true) is already set, no need to set it again
        const data = await apiFetch(`/api/food-log/daily?date=${today}`);

        // --- FIX ---
        // Your backend returns an object like { logs: [...] }.
        // We check for that object and the array inside it.
        if (data && Array.isArray(data.logs)) {
          // We use `setFoodLog` to REPLACE the store's state with the fresh data.
          setFoodLog(data.logs);
        }
      } catch (err) {
        console.error("Error fetching food logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodLogs();

    // This dependency array prevents re-fetching every time a food is added.
    // It will only run on initial load or if the user/date changes.
  }, [user?.token, today, setFoodLog]);

  // 🍱 Filter today’s entries (This code is now correct)
  const todaysLog = useMemo(
    () => foodLog.filter((entry) => entry.date.startsWith(today)),
    [foodLog, today]
  );

  // 🧮 Calculate totals (This code is correct)
  const totals = useMemo(() => {
    return todaysLog.reduce(
      (acc, entry) => {
        acc.calories += entry.calories;
        acc.protein += entry.protein;
        acc.carbs += entry.carbs;
        acc.fat += entry.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todaysLog]);

  const macroChartData = [
    { name: "Protein", value: totals.protein },
    { name: "Carbs", value: totals.carbs },
    { name: "Fat", value: totals.fat },
  ];

  // 🍽️ Handle new food added (This code is now correct)
  const handleFoodAdded = (_food: FoodLogEntry) => {
    // The modal handles saving. This function is just a callback.
    console.log("Food added from modal, dashboard updated via store.");
  };

  // The rest of your JSX remains the same...
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {user ? `Hello, ${user.name}!` : "Welcome!"}
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400">
        Here’s your progress for today.
      </p>

      {/* Calories */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Calories</h2>
        {loading ? (
          <p className="text-neutral-400 text-sm">Loading daily log...</p>
        ) : (
          <ProgressBar
            label="Intake"
            value={totals.calories}
            max={goals.calories}
          />
        )}
      </Card>

      {/* Macros */}
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

      {/* Donut Chart */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Macro Breakdown</h2>
        {todaysLog.length > 0 ? (
          <DonutChart data={macroChartData} />
        ) : (
          <div className="text-center text-neutral-500 py-10">
            <p>No food logged for today.</p>
          </div>
        )}
      </Card>

      {/* Floating Add Button */}
      <motion.div
        className="fixed bottom-24 right-6"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-accent text-white rounded-full p-4 shadow-lg shadow-accent/40"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      </motion.div>

      {/* Add Food Modal */}
      <AddFoodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={today}
        onFoodAdded={handleFoodAdded}
      />
    </div>
  );
};

export default DashboardPage;
