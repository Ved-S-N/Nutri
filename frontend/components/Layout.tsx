import React from "react";
import { motion } from "framer-motion";
import { Page } from "../types";
import {
  HomeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ScaleIcon,
  CalendarDaysIcon,
} from "./icons/HeroIcons";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const navItems = [
  { page: "dashboard" as Page, icon: HomeIcon, label: "Dashboard" },
  { page: "analytics" as Page, icon: ChartBarIcon, label: "Analytics" },
  { page: "calendar" as Page, icon: CalendarDaysIcon, label: "Calendar" },
  { page: "weight" as Page, icon: ScaleIcon, label: "Weight" },
  { page: "settings" as Page, icon: Cog6ToothIcon, label: "Settings" },
];

const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  setCurrentPage,
}) => {
  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 min-h-screen flex flex-col font-sans transition-colors duration-300">
      <div className="flex-grow p-4 sm:p-6 pb-24">{children}</div>
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/30 dark:bg-black/30 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 flex justify-around items-center">
        {navItems.map(({ page, icon: Icon, label }) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className="relative flex flex-col items-center justify-center w-20 h-full text-neutral-600 dark:text-neutral-400 hover:text-accent dark:hover:text-accent transition-colors duration-200"
          >
            <Icon className="h-7 w-7" />
            <span className="text-xs mt-1">{label}</span>
            {currentPage === page && (
              <motion.div
                layoutId="active-nav-indicator"
                className="absolute bottom-1 w-8 h-1 bg-accent rounded-full"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
