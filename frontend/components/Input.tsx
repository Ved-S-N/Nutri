
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
        {label}
      </label>
      <input
        id={id}
        className="w-full bg-white/10 dark:bg-black/20 border border-white/20 dark:border-black/20 rounded-lg px-4 py-3 text-neutral-800 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
        {...props}
      />
    </div>
  );
};

export default Input;
