import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

// Fix: Extended HTMLMotionProps<'button'> to resolve type conflicts with Framer Motion.
// React.ButtonHTMLAttributes has an incompatible signature for animation event handlers
// like onAnimationStart, which caused the type error when spreading props.
interface ButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseClasses =
    "px-6 py-3 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900";

  const variants = {
    primary:
      "bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/30 hover:shadow-accent/40",
    secondary:
      "bg-neutral-500/20 hover:bg-neutral-500/30 text-neutral-800 dark:text-neutral-200",
    ghost: "bg-transparent text-white hover:bg-white/10 border border-white/10",
  };

  return (
    <motion.button
      whileHover={{
        scale: 1.05,
        transition: { type: "spring", stiffness: 300 },
      }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
