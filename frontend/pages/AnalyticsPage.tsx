import React, { useMemo, useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import AreaChart from '../components/AreaChart';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';
import { WeightGoalMode } from '../types';

type Tab = 'calories' | 'macros' | 'weight';

const getModeStyles = (mode: WeightGoalMode) => {
    switch (mode) {
        case 'cutting': return { color: '#ef4444', text: 'Cutting', badge: 'bg-rose-500/20 text-rose-500' };
        case 'bulking': return { color: '#38bdf8', text: 'Bulking', badge: 'bg-sky-500/20 text-sky-500' };
        case 'maintenance': return { color: '#16a34a', text: 'Maintenance', badge: 'bg-emerald-500/20 text-emerald-500' };
        default: return { color: '#16a34a', text: 'Maintenance', badge: 'bg-emerald-500/20 text-emerald-500' };
    }
};

const AnalyticsPage: React.FC = () => {
  const { foodLog, weightLog, goals } = useUserStore();
  const [activeTab, setActiveTab] = useState<Tab>('calories');

  const weeklyData = useMemo(() => {
    const dataByDay: { [key: string]: { day: string; calories: number; protein: number; carbs: number; fat: number } } = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const day = date.toLocaleString('en-US', { weekday: 'short' });
      
      dataByDay[dateString] = { day, calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    
    foodLog.forEach(entry => {
      if (dataByDay[entry.date]) {
        dataByDay[entry.date].calories += entry.calories;
        dataByDay[entry.date].protein += entry.protein;
        dataByDay[entry.date].carbs += entry.carbs;
        dataByDay[entry.date].fat += entry.fat;
      }
    });

    return Object.values(dataByDay);
  }, [foodLog]);

  const weightChartData = useMemo(() => {
    return weightLog.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: entry.weight,
    }));
  }, [weightLog]);

  const latestWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : null;

  const { progressText, modeStyles } = useMemo(() => {
    const styles = getModeStyles(goals.weightGoalMode);
    if (latestWeight === null) {
        return { progressText: 'No weight logged yet.', modeStyles: styles };
    }
    
    let text = '';
    switch (goals.weightGoalMode) {
        case 'cutting':
            const toLose = latestWeight - goals.weight;
            text = toLose > 0 ? `${toLose.toFixed(1)}kg to lose` : `Goal reached!`;
            break;
        case 'bulking':
            const toGain = goals.weight - latestWeight;
            text = toGain > 0 ? `${toGain.toFixed(1)}kg to gain` : `Goal reached!`;
            break;
        case 'maintenance':
            const diff = Math.abs(latestWeight - goals.weight);
            text = diff <= 1 ? `Maintaining within goal range` : `${diff.toFixed(1)}kg from target`;
            break;
    }
    return { progressText: text, modeStyles: styles };
  }, [latestWeight, goals]);
  
  const macroBars = [
      { dataKey: 'protein', fill: '#16a34a' },
      { dataKey: 'carbs', fill: '#3b82f6' },
      { dataKey: 'fat', fill: '#f97316' },
  ];

  const tabs: {id: Tab, label: string}[] = [
    {id: 'calories', label: 'Calories'},
    {id: 'macros', label: 'Macros'},
    {id: 'weight', label: 'Weight'},
  ]

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  } as const;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <p className="text-neutral-500 dark:text-neutral-400">Your weekly nutrition trends.</p>

      <div className="flex space-x-2 border-b-2 border-neutral-200 dark:border-neutral-700">
          {tabs.map(tab => (
              <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-accent' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
              >
                  {tab.label}
                  {activeTab === tab.id && (
                      <motion.div
                          className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-accent"
                          layoutId="underline"
                      />
                  )}
              </button>
          ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {activeTab === 'calories' && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Weekly Calorie Intake</h2>
              <AreaChart data={weeklyData} dataKey="calories" xAxisKey="day" />
            </Card>
          )}
          {activeTab === 'macros' && (
             <Card>
              <h2 className="text-xl font-semibold mb-4">Weekly Macro Distribution</h2>
              <BarChart data={weeklyData} xAxisKey="day" bars={macroBars} />
            </Card>
          )}
          {activeTab === 'weight' && (
            <div className="space-y-6">
              <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Weight Trend</h2>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${modeStyles.badge}`}>{modeStyles.text}</span>
                </div>
                {weightChartData.length > 1 ? (
                  <LineChart data={weightChartData} dataKey="weight" xAxisKey="date" strokeColor={modeStyles.color} />
                ) : (
                  <p className="text-center text-neutral-500 py-10">Log at least two weight entries to see your trend.</p>
                )}
              </Card>
              <Card>
                <h2 className="text-xl font-semibold mb-4">Goal Progress</h2>
                <div className="text-center">
                    <p className="text-neutral-500">Current: <span className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{latestWeight ? `${latestWeight}kg` : '-'}</span></p>
                    <p className="text-neutral-500">Goal: <span className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{goals.weight}kg</span></p>
                    <p className="mt-2 text-lg font-semibold" style={{color: modeStyles.color}}>
                        {progressText}
                    </p>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
};

export default AnalyticsPage;