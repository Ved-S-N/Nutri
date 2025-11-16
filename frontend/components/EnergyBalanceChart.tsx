import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface EnergyRow {
  dateLabel: string;
  caloriesIn: number;
  caloriesBurned: number;
}

interface EnergyBalanceChartProps {
  data: EnergyRow[]; // ordered by date asc
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
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
        <span className="font-medium">Net:</span>{" "}
        {Math.round((payload[0]?.value ?? 0) - (payload[1]?.value ?? 0))} kcal
      </div>
    </div>
  );
};

const EnergyBalanceChart: React.FC<EnergyBalanceChartProps> = ({ data }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3">Daily Energy Balance</h3>
      <div className="bg-white/3 p-3 rounded">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(v) => `${v}`}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: "#cbd5e1" }} />
            <Line
              type="monotone"
              dataKey="caloriesIn"
              name="Calories In"
              stroke="#16a34a"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="caloriesBurned"
              name="Calories Burned"
              stroke="#ef4444"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey={(row: any) => row.caloriesIn - row.caloriesBurned}
              name="Net"
              stroke="#f59e0b"
              strokeDasharray="4 3"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-3 text-sm text-neutral-400">
          Net = calories in − calories burned. Positive net → surplus (weight
          gain tendency), negative → deficit.
        </div>
      </div>
    </div>
  );
};

export default EnergyBalanceChart;
