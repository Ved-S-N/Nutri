
import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white/10 dark:bg-black/10 backdrop-blur-lg rounded-xl border border-white/20 dark:border-black/20 shadow-lg p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
