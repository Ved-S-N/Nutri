import React from "react";

interface Props {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

const MacroSummaryBar: React.FC<Props> = ({
  calories = 0,
  protein = 0,
  carbs = 0,
  fat = 0,
}) => {
  // Defensive check
  if (
    typeof calories !== "number" ||
    typeof protein !== "number" ||
    typeof carbs !== "number" ||
    typeof fat !== "number"
  ) {
    console.warn("⚠️ Invalid macro values:", { calories, protein, carbs, fat });
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/90 border-t border-neutral-200 dark:border-neutral-700 p-4 backdrop-blur-md shadow-md z-40">
      <div className="flex justify-between items-center text-center text-sm md:text-base">
        <div>
          <p className="text-neutral-500">Calories</p>
          <p className="font-bold">{calories.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-neutral-500">Protein</p>
          <p className="font-bold text-blue-500">{protein.toFixed(0)}g</p>
        </div>
        <div>
          <p className="text-neutral-500">Carbs</p>
          <p className="font-bold text-amber-500">{carbs.toFixed(0)}g</p>
        </div>
        <div>
          <p className="text-neutral-500">Fat</p>
          <p className="font-bold text-rose-500">{fat.toFixed(0)}g</p>
        </div>
      </div>
    </div>
  );
};

export default MacroSummaryBar;
