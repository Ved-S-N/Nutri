import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FoodLogEntry, MealType } from "../types";
import { useUserStore } from "../store/useUserStore";
import { PlusIcon, ChevronDownIcon, TrashIcon } from "./icons/HeroIcons";
import AddFoodModal from "./AddFoodModal";

interface MealSectionProps {
  icon: string;
  title: string;
  mealType: MealType;
  entries: FoodLogEntry[];
  date: string;
}

const MealSection: React.FC<MealSectionProps> = ({
  icon,
  title,
  mealType,
  entries,
  date,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { removeFoodLogEntry } = useUserStore();

  // ✅ Calculate meal totals
  const totals = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        acc.calories += entry.calories || 0;
        acc.protein += entry.protein || 0;
        acc.carbs += entry.carbs || 0;
        acc.fat += entry.fat || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [entries]);

  return (
    <>
      <motion.div
        layout
        className="bg-white/10 dark:bg-black/10 backdrop-blur-lg rounded-xl border border-white/20 dark:border-black/20 overflow-hidden"
      >
        {/* Header */}
        <motion.header
          initial={false}
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">{icon}</span>
            <div>
              <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-200">
                {title}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {Math.round(totals.calories)} kcal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="w-8 h-8 flex items-center justify-center bg-accent/20 hover:bg-accent/40 rounded-full text-accent transition-colors"
              aria-label={`Add food to ${title}`}
            >
              <PlusIcon className="w-5 h-5" />
            </motion.button>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              className="transition-transform"
            >
              <ChevronDownIcon className="w-5 h-5 text-neutral-500" />
            </motion.div>
          </div>
        </motion.header>

        {/* Expandable Section */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.section
              key="content"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
            >
              <div className="border-t border-white/10 dark:border-black/20 px-4 pt-2 pb-4 space-y-3">
                {entries.length > 0 ? (
                  entries.map((entry) => {
                    const entryId =
                      entry.id ||
                      entry._id ||
                      `${entry.foodName}-${entry.date}`;
                    return (
                      <motion.div
                        key={entryId}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{entry.foodName}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {entry.quantity}g • {Math.round(entry.calories)}{" "}
                            kcal
                          </p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            removeFoodLogEntry(entry.id || entry._id)
                          }
                          className="p-2 text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-full hover:bg-rose-500/10 transition-colors"
                          aria-label={`Remove ${entry.foodName}`}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </motion.button>
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="text-center text-neutral-500 py-4">
                    No food logged for this meal.
                  </p>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add Food Modal */}
      <AddFoodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={date}
        mealType={mealType}
      />
    </>
  );
};

export default MealSection;
