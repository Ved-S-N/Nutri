import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";

import WorkoutTracker from "../components/WorkoutTracker";
import HydrationTracker from "../components/HydrationTracker";
import WellbeingTracker from "../components/WellbeingTracker";
import WeightTrackerPage from "./WeightTrackerPage";

import FloatingWellnessMenu from "../components/FloatingWellnenssMenu";

type Tab = "workouts" | "hydration" | "wellbeing" | "weight";

const TAB_TITLES: Record<Tab, string> = {
  workouts: "Workouts",
  hydration: "Hydration",
  wellbeing: "Well-being",
  weight: "Weight",
};

// Soft theme per section
const TAB_THEME: Record<Tab, string> = {
  workouts: "from-orange-400/20 via-red-500/10 to-transparent",
  hydration: "from-sky-400/20 via-cyan-500/10 to-transparent",
  wellbeing: "from-purple-400/20 via-fuchsia-500/10 to-transparent",
  weight: "from-emerald-400/20 via-green-500/10 to-transparent",
};

const WellnessPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("workouts");
  const containerRef = useRef<HTMLDivElement | null>(null);

  /* -----------------------------------------------------------
      ⭐ Parallax + subtle fade
  ------------------------------------------------------------ */
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 120], [1, 0.65]);
  const headerY = useTransform(scrollY, [0, 120], [0, -14]);

  /* -----------------------------------------------------------
      ⭐ Smooth scroll on tab change
  ------------------------------------------------------------ */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    window.scrollTo({
      top: container.offsetTop - 85,
      behavior: "smooth",
    });

    window.navigator?.vibrate?.(10);
  }, [activeTab]);

  /* -----------------------------------------------------------
      ✨ Section animation
  ------------------------------------------------------------ */
  const variants = {
    hidden: { opacity: 0, y: 25, scale: 0.97 },
    enter: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 130, damping: 18 },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.25 },
    },
  };

  const renderContent = () => {
    switch (activeTab) {
      case "workouts":
        return <WorkoutTracker />;
      case "hydration":
        return <HydrationTracker />;
      case "wellbeing":
        return <WellbeingTracker />;
      case "weight":
        return <WeightTrackerPage />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="pb-6 pt-6  ">
        {/* ---------------------------------------------------------------- */}
        {/* 🍏 Sticky Header with Premium Blur */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          style={{ opacity: headerOpacity, y: headerY }}
          className="
          sticky top-0 z-30 px-4 py-4
          backdrop-blur-2xl bg-black/40
          border-b border-white/10
          shadow-[0_4px_20px_-8px_rgba(0,0,0,0.5)]
        "
        >
          <motion.h1
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-3xl font-extrabold tracking-tight"
          >
            {TAB_TITLES[activeTab]}
          </motion.h1>

          <p className="text-neutral-400 mt-1 text-sm">
            Track your daily wellness routines.
          </p>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Background Section Glow (animated per tab) */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          key={activeTab + "-bg"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`
          absolute inset-0 -z-10 
          bg-gradient-to-b ${TAB_THEME[activeTab]}
          blur-xl
        `}
        />

        {/* ---------------------------------------------------------------- */}
        {/* CONTENT */}
        {/* ---------------------------------------------------------------- */}
        <div ref={containerRef} className="px-0 mt-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={variants}
              initial="hidden"
              animate="enter"
              exit="exit"
              className="
              relative rounded-3xl p-3
              bg-white/5 backdrop-blur-md 
              border border-white/10
              shadow-[0_0_25px_-6px_rgba(0,0,0,0.6)]
            "
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Floating Menu – polished */}
      {/* ---------------------------------------------------------------- */}

      <FloatingWellnessMenu
        onSelect={(tab) => {
          setActiveTab(tab);
          window.navigator?.vibrate?.(12);
        }}
      />
    </>
  );
};

export default WellnessPage;
