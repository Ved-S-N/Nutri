import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Droplet, Star, AlertCircle } from "lucide-react";

export default function CalendarGrid({ month, days, onSelectDay }) {
  const [columns, setColumns] = useState(7);

  // ---- AUTO-COMPACT MODE ----
  useEffect(() => {
    const handle = () => {
      const w = window.innerWidth;

      if (w < 330) setColumns(2); // Tiny phones
      else if (w < 390) setColumns(3); // Small phones
      else setColumns(7); // Normal
    };

    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const [year, mon] = month.split("-").map(Number);
  const first = new Date(year, mon - 1, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();

  // At compact mode we DO NOT align to weekdays.
  const actualDays = Array.from({ length: daysInMonth }).map((_, i) => {
    const dayNum = i + 1;
    const iso = new Date(year, mon - 1, dayNum).toISOString();

    return {
      iso,
      row: days.find(
        (d) => new Date(d.date).toDateString() === new Date(iso).toDateString()
      ),
      dayNum,
    };
  });

  const calorieColor = (row) =>
    row?.calorieIntensity === "low"
      ? "bg-emerald-500/70"
      : row?.calorieIntensity === "ok"
      ? "bg-amber-400/80"
      : "bg-rose-500/80";

  return (
    <div className="px-2">
      <div className="flex justify-between mb-2 text-slate-300">
        <h3 className="font-medium">{month}</h3>
        <span className="text-xs text-slate-500">Tap a day</span>
      </div>

      {/* Responsive grid */}
      <div
        className={`grid gap-[6px]`}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {actualDays.map(({ iso, row, dayNum }) => {
          const isEmpty =
            !row ||
            (row.calories === 0 &&
              row.protein === 0 &&
              row.hydrationGlasses === 0);

          return (
            <motion.button
              key={iso}
              whileTap={{ scale: 0.95 }}
              onClick={() => row && onSelectDay?.(row)}
              className={`rounded-xl p-2 flex flex-col border
                ${
                  row?.isBestDay
                    ? "border-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.16)]"
                    : "border-slate-700/40"
                }
                ${isEmpty ? "bg-slate-800/40" : "bg-slate-900/70"}
              `}
            >
              {/* Day number + icons */}
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-white ">{dayNum}</p>

                <div className="flex gap-1">
                  {row?.isBestDay && (
                    <Star size={12} className="text-emerald-300" />
                  )}
                  {row?.isWorstDay && (
                    <AlertCircle size={12} className="text-rose-300" />
                  )}
                </div>
              </div>

              {/* Calories */}
              <div
                className={`h-[22px] mt-1 rounded-md flex items-center ${
                  isEmpty ? "bg-slate-800" : calorieColor(row)
                }`}
              >
                <span className="text-[10px] px-1 font-medium truncate">
                  {isEmpty ? "—" : `${row.calories} kcal`}
                </span>
              </div>

              {/* Protein + Fat */}
              <div className="flex justify-between mt-1 text-[10px]">
                <span className="text-emerald-300">{row?.protein ?? 0}g</span>
                <span className="text-yellow-300">{row?.fat ?? 0}g</span>
              </div>

              {/* hydration + workouts */}
              <div className="flex justify-between mt-1">
                <div className="flex flex-col items-center text-[9px] text-slate-400">
                  <Droplet
                    size={12}
                    className={
                      row?.hydrationGlasses > 0
                        ? "text-emerald-300"
                        : "text-slate-600"
                    }
                  />
                  {row?.hydrationGlasses ?? 0}
                </div>

                <div className="flex flex-col items-center text-[9px] text-slate-400">
                  <Activity
                    size={12}
                    className={
                      row?.workouts > 0 ? "text-emerald-300" : "text-slate-600"
                    }
                  />
                  {row?.workouts ?? 0}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
