import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, label }) => {
  const rawPercentage = max > 0 ? (value / max) * 100 : 0;
  const percentage = Math.max(0, Math.min(100, rawPercentage));

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {label}
        </span>
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {Math.round(value)} / {max}
        </span>
      </div>
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
        <motion.div
          className="bg-accent h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
