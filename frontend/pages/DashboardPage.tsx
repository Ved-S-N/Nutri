
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import DonutChart from '../components/DonutChart';
import AddFoodModal from '../components/AddFoodModal';
import Button from '../components/Button';
import { PlusIcon } from '../components/icons/HeroIcons';

const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

const DashboardPage: React.FC = () => {
  const { user, goals, foodLog } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = getTodayDateString();

  const todaysLog = useMemo(() => {
    return foodLog.filter(entry => entry.date === today);
  }, [foodLog, today]);

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
    { name: 'Protein', value: totals.protein },
    { name: 'Carbs', value: totals.carbs },
    { name: 'Fat', value: totals.fat },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Hello, {user?.name}!</h1>
      <p className="text-neutral-500 dark:text-neutral-400">Here's your progress for today.</p>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Calories</h2>
        <ProgressBar label="Intake" value={totals.calories} max={goals.calories} />
      </Card>
      
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

      <Card>
          <h2 className="text-xl font-semibold mb-4">Macro Breakdown</h2>
          <DonutChart data={macroChartData} />
      </Card>

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

      <AddFoodModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} date={today} />
    </div>
  );
};

export default DashboardPage;
