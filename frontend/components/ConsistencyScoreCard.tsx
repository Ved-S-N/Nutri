// import React from "react";
// import { motion } from "framer-motion";

// interface ConsistencyScoreProps {
//   score: number; // 0..100
//   details?: { macros?: number; hydration?: number; workouts?: number }; // sub-scores 0..100
// }

// const pill = (v?: number) => (
//   <div className="text-xs text-neutral-300">
//     {v == null ? "-" : `${Math.round(v)}%`}
//   </div>
// );

// const ConsistencyScoreCard: React.FC<ConsistencyScoreProps> = ({
//   score,
//   details,
// }) => {
//   const clamped = Math.max(0, Math.min(100, score));
//   const color =
//     clamped >= 75
//       ? "bg-emerald-400"
//       : clamped >= 50
//       ? "bg-amber-400"
//       : "bg-rose-400";

//   console.log("Consistency details:", details);

//   return (
//     <div className="bg-white/3 p-4 rounded">
//       <div className="flex items-center justify-between">
//         <div>
//           <div className="text-sm text-neutral-300">Consistency Score</div>
//           <div className="text-2xl font-bold">How steady you've been</div>
//         </div>
//         <div className="flex items-center gap-4">
//           <div className="w-28">
//             <motion.div
//               initial={{ width: "0%" }}
//               animate={{ width: `${clamped}%` }}
//               transition={{ duration: 0.9, ease: "easeOut" }}
//               className={`h-6 rounded ${color} shadow`}
//             />
//             <div className="text-xs text-neutral-300 mt-1 text-right">
//               {clamped}%
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="mt-3 grid grid-cols-3 gap-3">
//         <div className="p-2 bg-neutral-900/40 rounded">
//           <div className="text-xs text-neutral-300">Macros</div>
//           <div className="text-sm font-medium">{pill(details?.macros)}</div>
//         </div>
//         <div className="p-2 bg-neutral-900/40 rounded">
//           <div className="text-xs text-neutral-300">Hydration</div>
//           <div className="text-sm font-medium">{pill(details?.hydration)}</div>
//         </div>
//         <div className="p-2 bg-neutral-900/40 rounded">
//           <div className="text-xs text-neutral-300">Workouts</div>
//           <div className="text-sm font-medium">{pill(details?.workouts)}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ConsistencyScoreCard;
import React from "react";
import { motion } from "framer-motion";

interface ConsistencyScoreProps {
  score: number; // 0..100
  details?: {
    macros?: number | null;
    hydration?: number | null;
    workouts?: number | null;
  }; // sub-scores 0..100
  compact?: boolean;
}

const pill = (v?: number | null) => (v == null ? "-" : `${Math.round(v)}%`);

const ConsistencyScoreCard: React.FC<ConsistencyScoreProps> = ({
  score,
  details,
  compact = false,
}) => {
  const safeScore = Number.isFinite(score) ? score : 0;
  const clamped = Math.max(0, Math.min(100, Math.round(safeScore)));
  const color =
    clamped >= 75
      ? "bg-emerald-400"
      : clamped >= 50
      ? "bg-amber-400"
      : "bg-rose-400";

  return (
    <div className={`bg-white/3 p-4 rounded ${compact ? "py-3 px-3" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-neutral-300">Consistency Score</div>
          <div className="text-2xl font-bold">How steady you've been</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-28">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${clamped}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className={`h-6 rounded ${color} shadow`}
            />
            <div className="text-xs text-neutral-300 mt-1 text-right">
              {clamped}%
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="p-2 bg-neutral-900/40 rounded">
          <div className="text-xs text-neutral-300">Macros</div>
          <div className="text-sm font-medium">
            {pill(details?.macros ?? null)}
          </div>
        </div>

        <div className="p-2 bg-neutral-900/40 rounded">
          <div className="text-xs text-neutral-300">Hydration</div>
          <div className="text-sm font-medium">
            {pill(details?.hydration ?? null)}
          </div>
        </div>

        <div className="p-2 bg-neutral-900/40 rounded">
          <div className="text-xs text-neutral-300">Workouts</div>
          <div className="text-sm font-medium">
            {pill(details?.workouts ?? null)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsistencyScoreCard;
