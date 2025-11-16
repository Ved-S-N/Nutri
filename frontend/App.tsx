import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "./store/useUserStore";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import WeightTrackerPage from "./pages/WeightTrackerPage";
import Layout from "./components/Layout";
import { Page } from "./types";
import CalendarPage from "./pages/CalendarPage";
import WellnessPage from "./pages/WellnessPage";
import ScanPage from "./pages/ScanPage";
import ExtraUti from "./components/ExtraUti";
import { Toaster } from "react-hot-toast";
import DashboardInsightsPage from "./pages/DashBoardInsightsPage";

const App: React.FC = () => {
  const { isAuthenticated, theme } = useUserStore();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [direction, setDirection] = useState<number>(1);

  const pageOrder: Page[] = [
    "dashboard",
    "analytics",
    "calendar",
    "weight",
    "wellness",
    "scan",
    "settings",
    "insights",
  ];

  /** 🍎 Smooth iOS-style motion variants (no blur here) */
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 80 : -80,
      opacity: 0,
      scale: 0.97,
      transition: {
        duration: 0.35,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  };

  /** 🌗 Sync system theme */
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  /** 🧩 Render correct page */
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "calendar":
        return <CalendarPage />;
      case "weight":
        return <WeightTrackerPage />;
      case "wellness":
        return <WellnessPage />;
      case "scan":
        return <ScanPage />;
      case "settings":
        return <SettingsPage />;
      case "insights":
        return <DashboardInsightsPage />;
      default:
        return <DashboardPage />;
    }
  };

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Layout
      currentPage={currentPage}
      setCurrentPage={(nextPage) => {
        const fromIndex = pageOrder.indexOf(currentPage);
        const toIndex = pageOrder.indexOf(nextPage);
        if (fromIndex !== -1 && toIndex !== -1) {
          setDirection(toIndex > fromIndex ? 1 : -1);
        }
        setCurrentPage(nextPage);
      }}
    >
      <Toaster position="bottom-center" />
      {/* 🌫️ Backdrop blur applied to the parent container */}
      <div
        className="
          relative min-h-[calc(100vh-5rem)]
          overflow-y-auto
          [perspective:1200px]
          backdrop-blur-md
          bg-background/80
          transition-all
          duration-300 mt-2
        "
      >
        <ExtraUti
          currentPage={currentPage}
          setCurrentPage={(nextPage) => {
            const fromIndex = pageOrder.indexOf(currentPage);
            const toIndex = pageOrder.indexOf(nextPage);
            if (fromIndex !== -1 && toIndex !== -1) {
              setDirection(toIndex > fromIndex ? 1 : -1);
            }
            setCurrentPage(nextPage);
          }}
        >
          <AnimatePresence initial={false} custom={direction} mode="sync">
            <motion.div
              key={currentPage}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 28,
                mass: 0.9,
              }}
              className="
              absolute inset-0 w-full h-full
              will-change-transform transform-gpu
              [backface-visibility:hidden]
              rounded-2xl overflow-y-auto
            "
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </ExtraUti>
      </div>
    </Layout>
  );
};

export default App;
