// // src/components/DayDetailSheet.tsx
// import React, { useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { X, Flame, Droplet, Activity, BarChart2 } from "lucide-react";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   Tooltip,
//   XAxis,
//   YAxis,
//   Bar,
//   BarChart,
//   CartesianGrid,
// } from "recharts";

// type DayRow = {
//   date: string;
//   calories: number;
//   protein: number;
//   workouts: number;
//   hydrationGlasses: number;
//   hydrationPercent?: number;
//   score?: number;
//   calorieIntensity?: "low" | "ok" | "high";
//   proteinQuality?: "low" | "ok" | "high";
// };

// interface Props {
//   day: DayRow | null;
//   onClose: () => void;
//   onNavigateToDay?: (iso: string) => void;
// }

// /**
//  * DayDetailSheet
//  * - shows a compact summary card
//  * - mini energy balance + meal impact (simulated breakdown derived from totals)
//  * - hydration + workouts
//  * - Accepts `day` prop (must match backend fields)
//  */
// const DayDetailSheet: React.FC<Props> = ({ day, onClose, onNavigateToDay }) => {
//   // create meaningful derived data for the charts (we don't fetch meals here)
//   const mealBreakdown = useMemo(() => {
//     if (!day) return [];
//     // heuristics: split calories across meals by typical ratios
//     const ratios = { breakfast: 0.22, lunch: 0.3, dinner: 0.36, snack: 0.12 };
//     return Object.entries(ratios).map(([meal, r]) => ({
//       meal,
//       calories: Math.round(day.calories * r),
//     }));
//   }, [day]);

//   const energyTrend = useMemo(() => {
//     if (!day) return [];
//     // produce a tiny time-series for the day (morning -> night)
//     const times = ["6am", "10am", "2pm", "6pm", "10pm"];
//     // distribute calories across times via mealBreakdown weights
//     const vals = [0, 0, 0, 0, 0];
//     mealBreakdown.forEach((m) => {
//       const idx =
//         m.meal === "breakfast"
//           ? 0
//           : m.meal === "lunch"
//           ? 2
//           : m.meal === "dinner"
//           ? 3
//           : 1;
//       vals[idx] += m.calories;
//     });
//     // assume calories burned constant-ish (simulate)
//     const burned = vals.map((v) => Math.round(v * 0.25 + Math.random() * 25));
//     return times.map((t, i) => ({
//       time: t,
//       intake: vals[i],
//       burned: burned[i],
//       net: vals[i] - burned[i],
//     }));
//   }, [day, mealBreakdown]);

//   if (!day) return null;

//   const dateLabel = new Date(day.date).toLocaleDateString("en-US", {
//     weekday: "long",
//     month: "short",
//     day: "numeric",
//   });

//   const proteinShort = `${day.protein} g`;
//   const hydrationShort = `${day.hydrationGlasses} cups`;

//   return (
//     <AnimatePresence>
//       <motion.section
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: 10 }}
//         className="mt-4"
//         aria-live="polite"
//       >
//         <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
//           <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
//             <div>
//               <div className="text-sm text-slate-400">{dateLabel}</div>
//               <div className="text-lg font-semibold text-white">
//                 Daily Summary
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => onNavigateToDay && onNavigateToDay(day.date)}
//                 className="text-xs px-3 py-1 rounded bg-white/3 text-white"
//               >
//                 Open Day
//               </button>

//               <button
//                 onClick={onClose}
//                 aria-label="Close"
//                 className="text-slate-400 hover:text-white p-2 rounded"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </div>

//           <div className="px-4 py-4 space-y-4">
//             {/* Top metrics */}
//             <div className="grid grid-cols-2 gap-3">
//               <div className="p-3 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700">
//                 <div className="text-xs text-slate-400">Calories</div>
//                 <div className="mt-1 text-2xl font-bold text-white">
//                   {day.calories} kcal
//                 </div>
//                 <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
//                   <Flame size={14} /> {day.calorieIntensity ?? "—"}
//                 </div>
//               </div>

//               <div className="p-3 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700">
//                 <div className="text-xs text-slate-400">Protein</div>
//                 <div className="mt-1 text-2xl font-bold text-white">
//                   {proteinShort}
//                 </div>
//                 <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
//                   <BarChart2 size={14} /> {day.proteinQuality ?? "—"}
//                 </div>
//               </div>

//               <div className="p-3 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700">
//                 <div className="text-xs text-slate-400">Hydration</div>
//                 <div className="mt-1 text-2xl font-bold text-white">
//                   {hydrationShort}
//                 </div>
//                 <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
//                   <Droplet size={14} /> {Math.round(day.hydrationPercent ?? 0)}%
//                   of goal
//                 </div>
//               </div>

//               <div className="p-3 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700">
//                 <div className="text-xs text-slate-400">Workouts</div>
//                 <div className="mt-1 text-2xl font-bold text-white">
//                   {day.workouts}
//                 </div>
//                 <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
//                   <Activity size={14} /> {day.workouts > 0 ? "Active" : "Rest"}
//                 </div>
//               </div>
//             </div>

//             {/* Energy Balance mini-chart */}
//             <div>
//               <div className="flex items-center justify-between mb-2">
//                 <div className="text-sm font-semibold text-white">
//                   Energy balance (intake vs burned)
//                 </div>
//                 <div className="text-xs text-slate-400">
//                   Net shown per time-slice
//                 </div>
//               </div>

//               <div className="h-48">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={energyTrend}>
//                     <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
//                     <XAxis
//                       dataKey="time"
//                       tick={{ fill: "#94a3b8", fontSize: 12 }}
//                     />
//                     <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
//                     <Tooltip wrapperStyle={{ color: "#000" }} />
//                     <Line
//                       type="monotone"
//                       dataKey="intake"
//                       stroke="#10b981"
//                       strokeWidth={2}
//                       dot={false}
//                     />
//                     <Line
//                       type="monotone"
//                       dataKey="burned"
//                       stroke="#60a5fa"
//                       strokeWidth={2}
//                       dot={false}
//                     />
//                     <Line
//                       type="monotone"
//                       dataKey="net"
//                       stroke="#f97316"
//                       strokeWidth={2}
//                       dot={false}
//                       strokeDasharray="5 5"
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             {/* Meal impact stacked-style bar (visual) */}
//             <div>
//               <div className="flex items-center justify-between mb-2">
//                 <div className="text-sm font-semibold text-white">
//                   Meal impact
//                 </div>
//                 <div className="text-xs text-slate-400">
//                   Which meal pushes calories
//                 </div>
//               </div>

//               <div className="h-36">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={mealBreakdown as any}>
//                     <CartesianGrid stroke="#1f2937" vertical={false} />
//                     <XAxis
//                       dataKey="meal"
//                       tick={{ fill: "#94a3b8", fontSize: 12 }}
//                     />
//                     <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
//                     <Tooltip />
//                     <Bar
//                       dataKey="calories"
//                       fill="#f97316"
//                       radius={[6, 6, 0, 0]}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             {/* footer quick actions */}
//             <div className="flex items-center justify-between gap-3">
//               <button
//                 onClick={() => onNavigateToDay && onNavigateToDay(day.date)}
//                 className="px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white text-sm"
//               >
//                 View full day
//               </button>

//               <div className="text-xs text-slate-400">
//                 Score:{" "}
//                 <span className="font-semibold text-white ml-1">
//                   {day.score ?? "-"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.section>
//     </AnimatePresence>
//   );
// };

// export default DayDetailSheet;
// src/components/DayDetailSheet.tsx
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, Droplet, Activity, BarChart2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  CartesianGrid,
} from "recharts";

type DayRow = {
  date: string;
  calories: number;
  protein: number;
  fat?: number;
  workouts: number;
  hydrationGlasses: number;
  hydrationPercent?: number;
  score?: number;
  calorieIntensity?: "low" | "ok" | "high";
  proteinQuality?: "low" | "ok" | "high";
};

interface Props {
  day: DayRow | null;
  onClose: () => void;
  onNavigateToDay?: (iso: string) => void;
}

const DayDetailSheet: React.FC<Props> = ({ day, onClose, onNavigateToDay }) => {
  if (!day) return null;

  // Meal breakdown simulation
  const mealBreakdown = useMemo(() => {
    const ratios = { breakfast: 0.22, lunch: 0.3, dinner: 0.36, snack: 0.12 };
    return Object.entries(ratios).map(([meal, r]) => ({
      meal,
      calories: Math.round(day.calories * r),
    }));
  }, [day]);

  // Energy mini chart
  const energyTrend = useMemo(() => {
    const times = ["6am", "10am", "2pm", "6pm", "10pm"];
    const vals = [0, 0, 0, 0, 0];

    mealBreakdown.forEach((m) => {
      const idx =
        m.meal === "breakfast"
          ? 0
          : m.meal === "lunch"
          ? 2
          : m.meal === "dinner"
          ? 3
          : 1;
      vals[idx] += m.calories;
    });

    const burned = vals.map((v) => Math.round(v * 0.25 + Math.random() * 25));

    return times.map((t, i) => ({
      time: t,
      intake: vals[i],
      burned: burned[i],
      net: vals[i] - burned[i],
    }));
  }, [day, mealBreakdown]);

  const dateLabel = new Date(day.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 220, damping: 25 }}
        className="
          fixed bottom-0 left-0 right-0 z-[9999]
          max-h-[85vh]
          bg-slate-900/95 backdrop-blur-xl
          border-t border-white/10
          rounded-t-2xl
          shadow-xl
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="text-sm text-slate-400">{dateLabel}</div>
            <div className="text-lg font-semibold text-white">
              Daily Summary
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateToDay?.(day.date)}
              className="text-xs px-3 py-1 rounded bg-white/10 text-white"
            >
              Open Day
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div
          className="
            overflow-y-auto 
            px-4 py-4 
            space-y-5
            max-h-[calc(80vh-60px)]
          "
        >
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3">
            {/* Calories */}
            <div className="p-3 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700">
              <div className="text-xs text-slate-400">Calories</div>
              <div className="mt-1 text-2xl font-bold text-white">
                {day.calories} kcal
              </div>
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                <Flame size={14} /> {day.calorieIntensity ?? "—"}
              </div>
            </div>

            {/* Protein */}
            <div className="p-3 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700">
              <div className="text-xs text-slate-400">Protein</div>
              <div className="mt-1 text-2xl font-bold text-white">
                {day.protein} g
              </div>
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                <BarChart2 size={14} /> {day.proteinQuality ?? "—"}
              </div>
            </div>

            {/* Hydration */}
            <div className="p-3 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700">
              <div className="text-xs text-slate-400">Hydration</div>
              <div className="mt-1 text-2xl font-bold text-white">
                {day.hydrationGlasses} cups
              </div>
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                <Droplet size={14} /> {Math.round(day.hydrationPercent ?? 0)}%
                of goal
              </div>
            </div>

            {/* Workouts */}
            <div className="p-3 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700">
              <div className="text-xs text-slate-400">Workouts</div>
              <div className="mt-1 text-2xl font-bold text-white">
                {day.workouts}
              </div>
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                <Activity size={14} /> {day.workouts > 0 ? "Active" : "Rest"}
              </div>
            </div>
          </div>

          {/* Energy Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-white">
                Energy balance (intake vs burned)
              </div>
              <div className="text-xs text-slate-400">
                Net shown per time-slice
              </div>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energyTrend}>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip wrapperStyle={{ color: "#000" }} />
                  <Line
                    type="monotone"
                    dataKey="intake"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="burned"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Meals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-white">
                Meal impact
              </div>
              <div className="text-xs text-slate-400">
                Which meal pushes calories
              </div>
            </div>

            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mealBreakdown as any}>
                  <CartesianGrid stroke="#1f2937" vertical={false} />
                  <XAxis
                    dataKey="meal"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="calories"
                    fill="#f97316"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigateToDay?.(day.date)}
              className="px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white text-sm"
            >
              View full day
            </button>

            <div className="text-xs text-slate-400">
              Score:{" "}
              <span className="font-semibold text-white ml-1">
                {day.score ?? "-"}
              </span>
            </div>
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
};

export default DayDetailSheet;
