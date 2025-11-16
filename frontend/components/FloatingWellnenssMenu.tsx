import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  FireIcon,
  DropletIcon,
  SparklesIcon,
  ScaleIcon,
} from "./icons/HeroIcons";

export type WellnessTab = "weight" | "workouts" | "hydration" | "wellbeing";

interface FloatingWellbeingMenuProps {
  onSelect: (section: WellnessTab) => void;
}

const FloatingWellbeingMenu: React.FC<FloatingWellbeingMenuProps> = ({
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const buttons = [
    { id: "weight", label: "Weight", icon: <ScaleIcon className="w-5 h-5" /> },
    {
      id: "workouts",
      label: "Workouts",
      icon: <FireIcon className="w-5 h-5" />,
    },
    {
      id: "hydration",
      label: "Hydration",
      icon: <DropletIcon className="w-5 h-5" />,
    },
    {
      id: "wellbeing",
      label: "Well-being",
      icon: <SparklesIcon className="w-5 h-5" />,
    },
  ] as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.04,
        duration: 0.25,
        ease: [0.25, 1, 0.5, 1],
      },
    }),
    exit: {
      opacity: 0,
      y: 8,
      scale: 0.98,
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
    },
  };

  return (
    <div className="sticky bottom-24 ml-auto right-2 w-fit pb-4 flex flex-col items-center space-y-3 z-50 aimation-float">
      <AnimatePresence>
        {isOpen &&
          buttons.map((btn, i) => (
            <motion.button
              key={btn.id}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 18px rgba(34,197,94,0.5)",
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                onSelect(btn.id);
                setIsOpen(false);
              }}
              className="flex items-center justify-center w-12 h-12 rounded-full 
                         bg-green-500 hover:bg-green-400 text-white 
                         shadow-[0_4px_12px_rgba(34,197,94,0.4)]
                         transition-all backdrop-blur-md"
            >
              {btn.icon}
            </motion.button>
          ))}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{
          duration: 0.25,
          ease: [0.4, 0, 0.85, 1],
        }}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 0 24px rgba(34,197,94,0.6)",
        }}
        whileTap={{ scale: 0.97 }}
        className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 
                   text-white flex items-center justify-center 
                   shadow-[0_0_20px_#22c55e70] transition-all"
      >
        <ChevronDown size={28} />
      </motion.button>
    </div>
  );
};

export default FloatingWellbeingMenu;
