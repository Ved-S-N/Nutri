// import React from "react";

// interface SleepPoint {
//   dateLabel: string;
//   sleepHours: number | null;
//   nextDayCalories?: number | null;
//   nextDayCravingScore?: number | null; // 0..10
// }

// interface SleepCorrelationCardProps {
//   data: SleepPoint[]; // sequential points
//   debug?: boolean;
// }

// /**
//  * Pearson correlation (returns NaN when undefined)
//  */
// const pearson = (xs: number[], ys: number[]) => {
//   const n = xs.length;
//   if (n === 0) return NaN;
//   const meanX = xs.reduce((a, b) => a + b, 0) / n;
//   const meanY = ys.reduce((a, b) => a + b, 0) / n;
//   const num = xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0);
//   const ssX = xs.reduce((s, x) => s + (x - meanX) ** 2, 0);
//   const ssY = ys.reduce((s, y) => s + (y - meanY) ** 2, 0);
//   const denom = Math.sqrt(ssX * ssY);
//   if (denom === 0) return NaN; // zero variance -> undefined
//   return num / denom;
// };

// const fmt = (v: number) => {
//   if (!Number.isFinite(v) || isNaN(v)) return "—";
//   return v.toFixed(2);
// };

// const emoji = (r: number) => {
//   if (!Number.isFinite(r) || isNaN(r)) return "➡️";
//   if (r > 0.3) return "🔺";
//   if (r < -0.3) return "🔻";
//   return "➡️";
// };

// const SleepCorrelationCard: React.FC<SleepCorrelationCardProps> = ({
//   data,
//   debug = false,
// }) => {
//   // Separate valid rows for each metric (calories vs cravings)
//   const validCalories = data.filter(
//     (d) => d.sleepHours != null && d.nextDayCalories != null
//   );
//   const validCravings = data.filter(
//     (d) => d.sleepHours != null && d.nextDayCravingScore != null
//   );

//   const sleepForCalories = validCalories.map((d) => d.sleepHours as number);
//   const calories = validCalories.map((d) => d.nextDayCalories as number);

//   const sleepForCravings = validCravings.map((d) => d.sleepHours as number);
//   const cravings = validCravings.map((d) => d.nextDayCravingScore as number);

//   // optional debug logs
//   if (debug) {
//     // eslint-disable-next-line no-console
//     console.log("SleepCorrelation debug:", {
//       sleepForCalories,
//       calories,
//       sleepForCravings,
//       cravings,
//       validCaloriesCount: validCalories.length,
//       validCravingsCount: validCravings.length,
//       totalRows: data.length,
//     });
//   }

//   // compute Pearson correlations (NaN if undefined)
//   const corrCalories =
//     sleepForCalories.length && calories.length
//       ? pearson(sleepForCalories, calories)
//       : NaN;
//   const corrCravings =
//     sleepForCravings.length && cravings.length
//       ? pearson(sleepForCravings, cravings)
//       : NaN;

//   // helper: check variance (returns false if constant/no variance)
//   const hasVariance = (arr: number[]) => {
//     if (!arr.length) return false;
//     const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
//     const s = arr.reduce((acc, x) => acc + (x - mean) ** 2, 0);
//     return s > 1e-6;
//   };

//   // configuration: required minimum valid points to consider correlation reliable
//   const MIN_POINTS = 3; // set to 3 or 4 in production; use 1 for quick debugging

//   const caloriesHasVariance =
//     hasVariance(sleepForCalories) && hasVariance(calories);
//   const cravingsHasVariance =
//     hasVariance(sleepForCravings) && hasVariance(cravings);

//   const caloriesOk =
//     validCalories.length >= MIN_POINTS &&
//     Number.isFinite(corrCalories) &&
//     caloriesHasVariance;
//   const cravingsOk =
//     validCravings.length >= MIN_POINTS &&
//     Number.isFinite(corrCravings) &&
//     cravingsHasVariance;

//   const insightCal =
//     !caloriesHasVariance && validCalories.length > 0
//       ? "Not enough variance to compute a meaningful calories correlation."
//       : caloriesOk && corrCalories > 0.25
//       ? "Less sleep → higher next-day calories."
//       : caloriesOk && corrCalories < -0.25
//       ? "More sleep → lower next-day calories."
//       : validCalories.length < MIN_POINTS
//       ? "Not enough data for a reliable calories correlation."
//       : "No strong link between sleep and next-day calories.";

//   const insightCrav =
//     !cravingsHasVariance && validCravings.length > 0
//       ? "Not enough variance to compute a meaningful cravings correlation."
//       : cravingsOk && corrCravings > 0.25
//       ? "Lower sleep = more cravings next day."
//       : cravingsOk && corrCravings < -0.25
//       ? "Better sleep = fewer cravings."
//       : validCravings.length < MIN_POINTS
//       ? "Not enough data for a reliable cravings correlation."
//       : "Cravings don't strongly follow sleep in this data.";

//   return (
//     <div className="bg-white/3 p-4 rounded">
//       <h3 className="text-lg font-semibold mb-2">
//         Sleep → Next Day: Calories & Cravings
//       </h3>

//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//         {/* Calories block */}
//         <div className="p-3 bg-neutral-900/40 rounded">
//           <div className="text-xs text-neutral-300">Sleep ↔ Calories</div>
//           <div className="text-2xl font-bold">
//             {fmt(Number.isFinite(corrCalories) ? corrCalories : NaN)}
//           </div>
//           <div className="text-sm mt-1">
//             {emoji(Number.isFinite(corrCalories) ? corrCalories : NaN)}{" "}
//             {insightCal}
//           </div>
//           <div className="text-xs text-neutral-500 mt-2">
//             Data points: {validCalories.length}
//           </div>
//         </div>

//         {/* Cravings block */}
//         <div className="p-3 bg-neutral-900/40 rounded">
//           <div className="text-xs text-neutral-300">Sleep ↔ Cravings</div>
//           <div className="text-2xl font-bold">
//             {fmt(Number.isFinite(corrCravings) ? corrCravings : NaN)}
//           </div>
//           <div className="text-sm mt-1">
//             {emoji(Number.isFinite(corrCravings) ? corrCravings : NaN)}{" "}
//             {insightCrav}
//           </div>
//           <div className="text-xs text-neutral-500 mt-2">
//             Data points: {validCravings.length}
//           </div>
//         </div>

//         {/* Overall block */}
//         <div className="p-3 bg-neutral-900/40 rounded">
//           <div className="text-xs text-neutral-300">Overall</div>
//           <div className="text-2xl font-bold">{data.length}</div>
//           <div className="text-sm mt-1">Total rows: {data.length}</div>

//           {/* If any synthetic/proxy flags present in data, show a warning */}
//           {data.some((d: any) => (d as any)._cravingWasSynthesized) && (
//             <div className="text-xs text-yellow-300 mt-2">
//               ⚠️{" "}
//               {
//                 data.filter((d: any) => (d as any)._cravingWasSynthesized)
//                   .length
//               }{" "}
//               cravings were synthesized/proxied — these are not direct user
//               ratings.
//             </div>
//           )}

//           <div className="text-xs text-neutral-500 mt-2">
//             Note: correlations use only valid rows (calories/cravings shown
//             above). Small samples or zero variance produce unreliable results.
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SleepCorrelationCard;
import React, { useMemo } from "react";

interface SleepPoint {
  dateLabel: string;
  sleepHours: number | null;
  nextDayCalories?: number | null;
  nextDayCravingScore?: number | null; // 0..10
  _cravingDerivedFromMood?: boolean;
}

interface SleepCorrelationCardProps {
  data: SleepPoint[]; // sequential points
  smoothing?: boolean; // apply 3-day rolling smoothing (default true)
  debug?: boolean;
}

const pearson = (xs: number[], ys: number[]) => {
  const n = xs.length;
  if (n === 0) return NaN;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0);
  const ssX = xs.reduce((s, x) => s + (x - meanX) ** 2, 0);
  const ssY = ys.reduce((s, y) => s + (y - meanY) ** 2, 0);
  const denom = Math.sqrt(ssX * ssY);
  if (denom === 0) return NaN;
  return num / denom;
};

// Spearman: rank arrays then apply Pearson to ranks
const spearman = (xs: number[], ys: number[]) => {
  const rank = (arr: number[]) => {
    // return ranks (average rank for ties)
    const pairs = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const ranks = new Array(arr.length).fill(0);
    let i = 0;
    while (i < pairs.length) {
      let j = i;
      while (j + 1 < pairs.length && pairs[j + 1].v === pairs[i].v) j++;
      const avgRank = (i + j) / 2 + 1; // 1-based ranks
      for (let k = i; k <= j; k++) ranks[pairs[k].i] = avgRank;
      i = j + 1;
    }
    return ranks;
  };
  const rx = rank(xs);
  const ry = rank(ys);
  return pearson(rx, ry);
};

const rollingAverage = (arr: number[], window = 3) => {
  if (arr.length === 0) return [];
  const out: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    const start = Math.max(0, i - Math.floor((window - 1) / 2));
    const end = Math.min(arr.length - 1, i + Math.floor(window / 2));
    const slice = arr.slice(start, end + 1);
    out.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return out;
};

// bootstrap correlation CI (resample indices)
const bootstrapCI = (
  xs: number[],
  ys: number[],
  fn: (a: number[], b: number[]) => number,
  iters = 500,
  alpha = 0.05
) => {
  const n = xs.length;
  if (n === 0) return { lower: NaN, upper: NaN, median: NaN };
  const vals: number[] = [];
  for (let t = 0; t < iters; t++) {
    const sx: number[] = [];
    const sy: number[] = [];
    for (let k = 0; k < n; k++) {
      const idx = Math.floor(Math.random() * n);
      sx.push(xs[idx]);
      sy.push(ys[idx]);
    }
    const v = fn(sx, sy);
    if (!Number.isNaN(v)) vals.push(v);
  }
  if (vals.length === 0) return { lower: NaN, upper: NaN, median: NaN };
  vals.sort((a, b) => a - b);
  const lower = vals[Math.floor((alpha / 2) * vals.length)] ?? vals[0];
  const upper =
    vals[Math.ceil((1 - alpha / 2) * vals.length) - 1] ?? vals[vals.length - 1];
  const median = vals[Math.floor(0.5 * vals.length)];
  return { lower, upper, median };
};

const fmt = (v: number) =>
  !Number.isFinite(v) || isNaN(v) ? "—" : v.toFixed(2);

const SleepCorrelationCard: React.FC<SleepCorrelationCardProps> = ({
  data,
  smoothing = true,
  debug = false,
}) => {
  // separate valid sets
  const validCalories = data.filter(
    (d) => d.sleepHours != null && d.nextDayCalories != null
  );
  const validCravings = data.filter(
    (d) => d.sleepHours != null && d.nextDayCravingScore != null
  );

  let sleepForCalories = validCalories.map((d) => d.sleepHours as number);
  let calories = validCalories.map((d) => d.nextDayCalories as number);

  let sleepForCravings = validCravings.map((d) => d.sleepHours as number);
  let cravings = validCravings.map((d) => d.nextDayCravingScore as number);

  // optional smoothing (rolling average) — helpful on noisy daily data
  if (smoothing) {
    sleepForCalories = rollingAverage(sleepForCalories, 3);
    calories = rollingAverage(calories, 3);
    sleepForCravings = rollingAverage(sleepForCravings, 3);
    cravings = rollingAverage(cravings, 3);
  }

  if (debug) {
    console.log("sleepForCalories:", sleepForCalories);
    console.log("calories:", calories);
    console.log("sleepForCravings:", sleepForCravings);
    console.log("cravings:", cravings);
  }

  // guards
  const nCal = sleepForCalories.length;
  const nCrav = sleepForCravings.length;
  const MIN_POINTS = 3;
  const hasVariance = (arr: number[]) => {
    if (!arr.length) return false;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const s = arr.reduce((acc, x) => acc + (x - mean) ** 2, 0);
    return s > 1e-6;
  };

  const pearCal = nCal >= 1 ? pearson(sleepForCalories, calories) : NaN;
  const pearCrav = nCrav >= 1 ? pearson(sleepForCravings, cravings) : NaN;
  const spearCal = nCal >= 1 ? spearman(sleepForCalories, calories) : NaN;
  const spearCrav = nCrav >= 1 ? spearman(sleepForCravings, cravings) : NaN;

  const calVarianceOk =
    nCal >= MIN_POINTS &&
    hasVariance(sleepForCalories) &&
    hasVariance(calories);
  const cravVarianceOk =
    nCrav >= MIN_POINTS &&
    hasVariance(sleepForCravings) &&
    hasVariance(cravings);

  // bootstrap CIs (only if sample reasonable)
  const ciCal = calVarianceOk
    ? bootstrapCI(sleepForCalories, calories, pearson, 500)
    : { lower: NaN, upper: NaN, median: NaN };
  const ciCrav = cravVarianceOk
    ? bootstrapCI(sleepForCravings, cravings, pearson, 500)
    : { lower: NaN, upper: NaN, median: NaN };

  const insightCal =
    !calVarianceOk && nCal > 0
      ? "Not enough variance or data to compute a reliable calories correlation."
      : calVarianceOk && Math.abs(pearCal) > 0.25
      ? pearCal > 0
        ? "Less sleep → higher next-day calories."
        : "More sleep → lower next-day calories."
      : nCal < MIN_POINTS
      ? "Not enough data for a reliable calories correlation."
      : "No strong link between sleep and next-day calories.";

  const insightCrav =
    !cravVarianceOk && nCrav > 0
      ? "Not enough variance or data to compute a reliable cravings correlation."
      : cravVarianceOk && Math.abs(pearCrav) > 0.25
      ? pearCrav > 0
        ? "Less sleep → more cravings next day."
        : "Better sleep = fewer cravings."
      : nCrav < MIN_POINTS
      ? "Not enough data for a reliable cravings correlation."
      : "Cravings don't strongly follow sleep in this data.";

  return (
    <div className="bg-white/3 p-4 rounded">
      <h3 className="text-lg font-semibold mb-2">
        Sleep → Next Day: Calories & Cravings
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Calories */}
        <div className="p-3 bg-neutral-900/40 rounded">
          <div className="text-xs text-neutral-300">Sleep ↔ Calories</div>
          <div className="text-2xl font-bold">{fmt(pearCal)}</div>
          <div className="text-sm mt-1">
            <div className="inline-block mr-2">
              {Math.abs(pearCal).toFixed(2) !== "NaN"
                ? Math.abs(pearCal) > 0.25
                  ? "🔺"
                  : "➡️"
                : "—"}
            </div>
            {insightCal}
          </div>

          <div className="text-xs text-neutral-500 mt-2">
            Pearson 95% CI:{" "}
            {Number.isFinite(ciCal.lower)
              ? `${ciCal.lower.toFixed(2)} — ${ciCal.upper.toFixed(2)}`
              : "—"}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Spearman: {fmt(spearCal)}
          </div>
          <div className="text-xs text-neutral-500 mt-2">
            Data points: {nCal}
          </div>
        </div>

        {/* Cravings */}
        <div className="p-3 bg-neutral-900/40 rounded">
          <div className="text-xs text-neutral-300">Sleep ↔ Cravings</div>
          <div className="text-2xl font-bold">{fmt(pearCrav)}</div>
          <div className="text-sm mt-1">
            <div className="inline-block mr-2">
              {Math.abs(pearCrav).toFixed(2) !== "NaN"
                ? Math.abs(pearCrav) > 0.25
                  ? pearCrav > 0
                    ? "🔺"
                    : "🔻"
                  : "➡️"
                : "—"}
            </div>
            {insightCrav}
          </div>

          <div className="text-xs text-neutral-500 mt-2">
            Pearson 95% CI:{" "}
            {Number.isFinite(ciCrav.lower)
              ? `${ciCrav.lower.toFixed(2)} — ${ciCrav.upper.toFixed(2)}`
              : "—"}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Spearman: {fmt(spearCrav)}
          </div>
          <div className="text-xs text-neutral-500 mt-2">
            Data points: {nCrav}
          </div>
        </div>

        {/* Overall */}
        <div className="p-3 bg-neutral-900/40 rounded">
          <div className="text-xs text-neutral-300">Overall</div>
          <div className="text-2xl font-bold">{data.length}</div>
          <div className="text-sm mt-1">Total rows: {data.length}</div>

          {data.some((d) => (d as any)._cravingDerivedFromMood) && (
            <div className="text-xs text-yellow-300 mt-2">
              ⚠️ Craving scores are derived from mood/notes/calorie & sleep
              signals — proxy values.
            </div>
          )}

          <div className="text-xs text-neutral-500 mt-2">
            Note: Pearson measures linear correlation; Spearman measures
            monotonic rank correlation. Small samples or zero variance produce
            unreliable results — use the CI and data counts above.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepCorrelationCard;
