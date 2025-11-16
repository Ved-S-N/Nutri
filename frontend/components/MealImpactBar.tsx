import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";

interface MealDataRow {
  dateLabel: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  snack: number;
  caloriesGoal?: number;
}

interface MealImpactBarProps {
  data: MealDataRow[];
  // highlight day where a meal pushes user over daily goal
  goal?: number;
}

const mealColors = {
  breakfast: "#60a5fa",
  lunch: "#34d399",
  dinner: "#f97316",
  snack: "#f472b6",
};

const MealImpactBar: React.FC<MealImpactBarProps> = ({ data, goal }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    const total = payload.reduce((s: number, p: any) => s + p.value, 0);
    return (
      <div className="bg-neutral-900 text-white p-2 rounded shadow">
        <div className="text-xs text-neutral-300">{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} className="text-sm">
            <span className="font-medium">{p.name}:</span> {Math.round(p.value)}{" "}
            kcal
          </div>
        ))}
        <div className="text-sm mt-1">
          <span className="font-medium">Total:</span> {Math.round(total)} kcal
        </div>
      </div>
    );
  };

  // Identify problem meal (per row)
  const enriched = data.map((r) => {
    const total = r.breakfast + r.lunch + r.dinner + r.snack;
    const problem =
      goal && total > goal
        ? ["breakfast", "lunch", "dinner", "snack"].reduce(
            (acc: any, meal: any) => {
              const candidate = r[meal as keyof typeof r] ?? 0;
              return candidate > (r[acc as keyof typeof r] ?? 0) ? meal : acc;
            },
            "breakfast"
          )
        : null;
    return { ...r, total, problem };
  });

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3">Meal Impact (stacked)</h3>
      <div className="bg-white/3 p-3 rounded">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={enriched}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: "#cbd5e1" }} />
            <Bar
              dataKey="breakfast"
              stackId="a"
              name="Breakfast"
              fill={mealColors.breakfast}
            />
            <Bar
              dataKey="lunch"
              stackId="a"
              name="Lunch"
              fill={mealColors.lunch}
            />
            <Bar
              dataKey="dinner"
              stackId="a"
              name="Dinner"
              fill={mealColors.dinner}
            />
            <Bar
              dataKey="snack"
              stackId="a"
              name="Snacks"
              fill={mealColors.snack}
            >
              {enriched.map((row, idx) => (
                <Cell
                  key={idx}
                  stroke={row.problem ? "rgba(0,0,0,0.7)" : undefined}
                  strokeWidth={row.problem ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 text-sm text-neutral-400">
          Stacked bars per day. If total calories exceed goal the meal that
          contributed most is highlighted.
        </div>
      </div>
    </div>
  );
};

export default MealImpactBar;
