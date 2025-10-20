import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';
import Card from '../components/Card';
import LineChart from '../components/LineChart';
import Input from '../components/Input';
import Button from '../components/Button';
import { WeightGoalMode } from '../types';

const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

const goalModes: { value: WeightGoalMode; label: string }[] = [
    { value: 'cutting', label: 'Cutting' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'bulking', label: 'Bulking' },
];

const getModeStyles = (mode: WeightGoalMode) => {
    switch (mode) {
        case 'cutting': return { color: '#ef4444', motivational: '🔥 Keep trimming, you’re on the right track!' };
        case 'bulking': return { color: '#38bdf8', motivational: '💪 Gains incoming — steady progress!' };
        case 'maintenance': return { color: '#16a34a', motivational: '🌿 Balanced and consistent — perfect zone!' };
        default: return { color: '#16a34a', motivational: '🌿 Balanced and consistent — perfect zone!' };
    }
};

const WeightTrackerPage: React.FC = () => {
  const { goals, weightLog, addWeightLogEntry, setGoals } = useUserStore();
  const today = getTodayDateString();

  const todayLog = weightLog.find(entry => entry.date === today);

  const [weight, setWeight] = useState<string>(todayLog?.weight.toString() || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveWeight = () => {
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) return;

    addWeightLogEntry({
        id: new Date().toISOString(),
        date: today,
        weight: weightValue
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };
  
  const handleModeChange = (mode: WeightGoalMode) => {
    setGoals({ ...goals, weightGoalMode: mode });
  };

  const weightChartData = useMemo(() => {
    return weightLog.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: entry.weight,
    }));
  }, [weightLog]);

  const weightHistory = useMemo(() => {
    return [...weightLog].reverse().map((entry, index, arr) => {
        const prevIndex = index + 1;
        const prevEntry = prevIndex < arr.length ? arr[prevIndex] : null;
        const change = prevEntry ? entry.weight - prevEntry.weight : 0;
        return { ...entry, change };
    }).slice(0, 7); // Show last 7 entries
  }, [weightLog]);
  
  const { bmi, bmiCategory, bmiColor, progressText, modeStyles } = useMemo(() => {
    const latestWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : null;
    
    // BMI calculation
    let bmiValue = null, category = 'N/A', bmiBg = 'bg-neutral-500';
    if (latestWeight && goals.height > 0) {
        const heightInMeters = goals.height / 100;
        bmiValue = latestWeight / (heightInMeters * heightInMeters);
        if (bmiValue < 18.5) { category = 'Underweight'; bmiBg = 'bg-blue-500'; }
        else if (bmiValue < 25) { category = 'Normal'; bmiBg = 'bg-accent'; }
        else if (bmiValue < 30) { category = 'Overweight'; bmiBg = 'bg-orange-500'; }
        else { category = 'Obese'; bmiBg = 'bg-red-500'; }
    }
    
    // Progress calculation
    const styles = getModeStyles(goals.weightGoalMode);
    let progText = 'Log weight to see progress.';
    if(latestWeight !== null) {
        switch(goals.weightGoalMode) {
            case 'cutting':
                const toLose = latestWeight - goals.weight;
                progText = toLose > 0 ? `${toLose.toFixed(1)} kg to lose` : `Goal reached!`;
                break;
            case 'bulking':
                const toGain = goals.weight - latestWeight;
                progText = toGain > 0 ? `${toGain.toFixed(1)} kg to gain` : `Goal reached!`;
                break;
            case 'maintenance':
                const diff = Math.abs(latestWeight - goals.weight);
                progText = diff <= 1 ? `Within 1kg of target` : `${diff.toFixed(1)} kg from target`;
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
      <h1 className="text-3xl font-bold">Weight Tracker</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <h2 className="text-xl font-semibold mb-4">Today's Weight</h2>
            <div className="flex items-end gap-4">
                <Input label="Weight (kg)" id="weight" name="weight" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g., 75.5" />
                <Button onClick={handleSaveWeight} disabled={!weight}>
                    {isSaved ? 'Saved!' : 'Save'}
                </Button>
            </div>
        </Card>
        <Card>
            <h2 className="text-xl font-semibold mb-4">Vital Stats</h2>
            <div className="flex justify-around items-center h-full">
                <div className="text-center">
                    <p className="text-sm text-neutral-500">BMI</p>
                    <p className="font-bold text-2xl">{bmi ? bmi.toFixed(1) : '-'}</p>
                    <span className={`px-2 py-0.5 text-xs font-semibold text-white rounded-full ${bmiColor}`}>{bmiCategory}</span>
                </div>
                <div className="text-center">
                    <p className="text-sm text-neutral-500">Progress</p>
                    <p className="font-bold text-2xl" style={{color: modeStyles.color}}>
                        {progressText.split(' ')[0]}
                    </p>
                    <span className="text-xs text-neutral-500">{progressText.substring(progressText.indexOf(' ')+1)}</span>
                </div>
            </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold">Weight Trend</h2>
            <div className="flex w-full sm:w-auto p-1 space-x-1 bg-neutral-200 dark:bg-neutral-700/50 rounded-lg">
                {goalModes.map(mode => (
                    <button
                        key={mode.value}
                        onClick={() => handleModeChange(mode.value)}
                        className={`relative w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            goals.weightGoalMode === mode.value ? 'text-white' : 'text-neutral-600 dark:text-neutral-300 hover:bg-white/10 dark:hover:bg-black/20'
                        }`}
                    >
                        {goals.weightGoalMode === mode.value && (
                            <motion.div
                                layoutId="weightModeIndicator"
                                className="absolute inset-0 rounded-md z-0"
                                style={{backgroundColor: modeStyles.color}}
                            />
                        )}
                        <span className="relative z-10">{mode.label}</span>
                    </button>
                ))}
            </div>
        </div>
        {weightChartData.length > 1 ? (
             <LineChart data={weightChartData} dataKey="weight" xAxisKey="date" strokeColor={modeStyles.color} />
        ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-neutral-500">Log your weight for a few days to see a chart.</p>
                <p className="text-xs text-neutral-500 mt-2">{modeStyles.motivational}</p>
            </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">History</h2>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {weightHistory.length > 0 ? weightHistory.map(entry => (
                <div key={entry.id} className="flex justify-between items-center bg-white/5 dark:bg-black/10 p-3 rounded-lg">
                    <div>
                        <p className="font-medium">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <p className="text-sm text-neutral-500">{entry.weight.toFixed(1)} kg</p>
                    </div>
                    <p className={`font-semibold text-sm ${entry.change > 0 ? 'text-rose-500' : entry.change < 0 ? 'text-sky-500' : 'text-neutral-500'}`}>
                        {entry.change > 0 && '+'}{entry.change.toFixed(1)} kg
                    </p>
                </div>
            )) : <p className="text-center text-neutral-500 py-4">No entries yet.</p>}
        </div>
      </Card>
    </div>
  );
};

export default WeightTrackerPage;