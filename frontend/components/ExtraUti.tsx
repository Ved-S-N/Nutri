import React from "react";
import { motion } from "framer-motion";
import { Page } from "../types";
import { Cog6ToothIcon, CameraIcon } from "./icons/HeroIcons";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const navItems = [
  { page: "scan" as Page, icon: CameraIcon },
  { page: "settings" as Page, icon: Cog6ToothIcon },
];

const ExtraUti: React.FC<LayoutProps> = ({
  children,
  currentPage,
  setCurrentPage,
}) => {
  return (
    <div className="bg-neutral-100  dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 min-h-screen flex flex-col font-sans transition-colors duration-300">
      {/* --- Minimal Floating Icon Bar --- */}
      <nav
        className="
          fixed top-0 right-0
          flex items-center gap-2
          p-1.5
          bg-white/60 dark:bg-neutral-900/60
          backdrop-blur-xl
          border border-neutral-200 dark:border-neutral-800
          rounded-full
          shadow-sm
          z-50
        "
      >
        {navItems.map(({ page, icon: Icon }) => (
          <motion.button
            key={page}
            onClick={() => setCurrentPage(page)}
            whileTap={{ scale: 0.9 }}
            className={`flex items-center justify-center h-8 w-8 rounded-full 
              ${
                currentPage === page
                  ? "bg-neutral-200 dark:bg-neutral-800 text-accent"
                  : "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/70"
              }
              transition-all duration-200`}
          >
            <Icon className="h-5 w-5" />
          </motion.button>
        ))}
      </nav>

      {/* --- Page Content --- */}
      <main className="flex-grow p-4 sm:p-6 pt-20">{children}</main>
    </div>
  );
};

export default ExtraUti;
