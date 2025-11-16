import React from "react";

interface SleepPoint {
  dateLabel: string;
  sleepHours: number;
  nextDayCalories?: number;
  nextDayCravingScore?: number; // 0..10
}

interface SleepCorrelationCardProps {
  data: SleepPoint[]; // sequential points
}

const pearson = (xs: number[], ys: number[]) => {
  const n = xs.length;
  if (n === 0) return 0;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0);
  const denX = Math.sqrt(xs.reduce((s, x) => s + (x - meanX) ** 2, 0));
  const denY = Math.sqrt(ys.reduce((s, y) => s + (y - meanY) ** 2, 0));
  const denom = denX * denY || 1;
  return num / denom;
};

const SleepCorrelationCard: React.FC<SleepCorrelationCardProps> = ({
  data,
}) => {
  const filtered = data.filter(
    (d) => d.nextDayCalories != null && d.nextDayCravingScore != null
  );
  const sleep = filtered.map((d) => d.sleepHours);
  const calories = filtered.map((d) => d.nextDayCalories ?? 0);
  const cravings = filtered.map((d) => d.nextDayCravingScore ?? 0);

  const corrCalories = pearson(sleep, calories);
  const corrCravings = pearson(sleep, cravings);

  const fmt = (v: number) => (isNaN(v) ? 0 : Math.round(v * 100) / 100);

  const emoji = (r: number) => {
    if (r > 0.3) return "🔺";
    if (r < -0.3) return "🔻";
    return "➡️";
  };

  const insightCal =
    corrCalories > 0.25
      ? "Less sleep → higher next-day calories."
      : corrCalories < -0.25
      ? "More sleep → lower next-day calories."
      : "No strong link between sleep and next-day calories.";

  const insightCrav =
    corrCravings > 0.25
      ? "Lower sleep = more cravings next day."
      : corrCravings < -0.25
      ? "Better sleep = fewer cravings."
      : "Cravings don't strongly follow sleep in this data.";

  return (
    <div className="bg-white/3 p-4 rounded">
      <h3 className="text-lg font-semibold mb-2">
        Sleep → Next Day: Calories & Cravings
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-neutral-900/40 rounded">
          <div className="text-xs text-neutral-300">Sleep ↔ Calories</div>
          <div className="text-2xl font-bold">{fmt(corrCalories)}</div>
          <div className="text-sm mt-1">
            {emoji(corrCalories)} {insightCal}
          </div>
        </div>
        <div className="p-3 bg-neutral-900/40 rounded">
          <div className="text-xs text-neutral-300">Sleep ↔ Cravings</div>
          <div className="text-2xl font-bold">{fmt(corrCravings)}</div>
          <div className="text-sm mt-1">
            {emoji(corrCravings)} {insightCrav}
          </div>
        </div>
        <div className="p-3 bg-neutral-900/40 rounded">
          <div className="text-xs text-neutral-300">Data points</div>
          <div className="text-2xl font-bold">{filtered.length}</div>
          <div className="text-sm mt-1">
            Correlation uses {filtered.length} valid entries.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepCorrelationCard;
