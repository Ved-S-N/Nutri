import React from "react";

type MacroKey = "protein" | "carbs" | "fat";

interface HeatmapConsistencyProps {
  // days: array of date strings (7 or 30 length)
  days: string[];
  // values: [{ day: "Mon", proteinPct: 0.8, carbsPct: 1.2, fatPct: 0.95 }, ...]
  values: Array<{
    dayLabel: string;
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
  }>;
  // goal thresholds used to color
  breakpoints?: { good: number; warn: number };
}

const macroOrder: MacroKey[] = ["protein", "carbs", "fat"];
const macroLabels: Record<MacroKey, string> = {
  protein: "Protein",
  carbs: "Carbs",
  fat: "Fat",
};

const pctToColor = (pct: number, breakpoints = { good: 0.9, warn: 1.1 }) => {
  // pct is ratio to goal (1.0 = 100%)
  if (pct >= breakpoints.good && pct <= breakpoints.warn)
    return "bg-emerald-400/90";
  if (pct < breakpoints.good) return "bg-yellow-400/80";
  return "bg-rose-400/80";
};

const HeatmapConsistency: React.FC<HeatmapConsistencyProps> = ({
  days,
  values,
  breakpoints,
}) => {
  const bp = breakpoints ?? { good: 0.9, warn: 1.1 };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3">Weekly Macro Consistency</h3>
      <div className="flex flex-col gap-3">
        {/* header row with day labels */}
        <div className="hidden sm:grid sm:grid-cols-[90px_repeat(7,1fr)] gap-2 items-center mb-1">
          <div className="text-sm text-neutral-400 px-2">Macro \ Day</div>
          {values.map((v, i) => (
            <div key={i} className="text-center text-xs text-neutral-400">
              {v.dayLabel}
            </div>
          ))}
        </div>

        {/* mobile stacked (macros per day) */}
        <div className="sm:hidden grid gap-2">
          {values.map((v, i) => (
            <div key={i} className="bg-white/3 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">{v.dayLabel}</div>
                <div className="text-xs text-neutral-400">Goal %</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div
                    className={`w-full h-10 rounded ${pctToColor(
                      v.proteinPct,
                      bp
                    )}`}
                  />
                  <div className="mt-1 text-xs">Protein</div>
                  <div className="text-xs text-neutral-300">
                    {Math.round(v.proteinPct * 100)}%
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`w-full h-10 rounded ${pctToColor(
                      v.carbsPct,
                      bp
                    )}`}
                  />
                  <div className="mt-1 text-xs">Carbs</div>
                  <div className="text-xs text-neutral-300">
                    {Math.round(v.carbsPct * 100)}%
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`w-full h-10 rounded ${pctToColor(
                      v.fatPct,
                      bp
                    )}`}
                  />
                  <div className="mt-1 text-xs">Fat</div>
                  <div className="text-xs text-neutral-300">
                    {Math.round(v.fatPct * 100)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* desktop grid */}
        <div className="hidden sm:block bg-white/3 rounded-lg p-3">
          <div className="grid grid-cols-[90px_repeat(7,1fr)] gap-2 items-center">
            <div className="text-sm text-neutral-400 px-2"></div>
            {values.map((v, i) => (
              <div key={i} className="text-center text-xs text-neutral-400">
                {v.dayLabel}
              </div>
            ))}

            {(["Protein", "Carbs", "Fat"] as string[]).map((label, r) => (
              <React.Fragment key={r}>
                <div className="text-sm font-medium px-2">{label}</div>
                {values.map((v, i) => {
                  const pct =
                    r === 0 ? v.proteinPct : r === 1 ? v.carbsPct : v.fatPct;
                  const color = pctToColor(pct, bp);
                  return (
                    <div key={i} className="p-2">
                      <div className={`w-full h-8 rounded ${color}`} />
                      <div className="text-xs text-neutral-300 mt-1 text-center">
                        {Math.round(pct * 100)}%
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs text-neutral-400">
        Cells show percent of daily macro goal.{" "}
        <span className="font-medium">Green</span> = in-range,{" "}
        <span className="font-medium">Yellow</span> = under,{" "}
        <span className="font-medium">Red</span> = over.
      </div>
    </div>
  );
};

export default HeatmapConsistency;
