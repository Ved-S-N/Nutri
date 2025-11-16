// import React from 'react';
// import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// interface LineChartProps {
//     data: any[];
//     dataKey: string;
//     xAxisKey: string;
//     strokeColor?: string;
// }

// const CustomTooltip = ({ active, payload, label, strokeColor }: any) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md p-2 rounded-lg border border-white/30 dark:border-black/30">
//         <p className="label font-semibold text-neutral-800 dark:text-neutral-200">{`${label}`}</p>
//         <p className="intro" style={{ color: strokeColor }}>{`Weight : ${payload[0].value.toFixed(1)} kg`}</p>
//       </div>
//     );
//   }

//   return null;
// };

// const LineChart: React.FC<LineChartProps> = ({ data, dataKey, xAxisKey, strokeColor = '#16a34a' }) => {
//   return (
//     <ResponsiveContainer width="100%" height={300}>
//       <RechartsLineChart data={data}>
//         <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
//         <XAxis dataKey={xAxisKey} tick={{ fill: 'currentColor', fontSize: 12 }} />
//         <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: 'currentColor', fontSize: 12 }} />
//         <Tooltip content={<CustomTooltip strokeColor={strokeColor} />} />
//         <Line type="monotone" dataKey={dataKey} stroke={strokeColor} strokeWidth={2} dot={{ r: 4, fill: strokeColor }} activeDot={{ r: 8 }} />
//       </RechartsLineChart>
//     </ResponsiveContainer>
//   );
// };

// export default LineChart;

import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface LineChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  unit: string;
  strokeColor?: string;
  goal?: number;
  trendDataKey?: string;
  trendStrokeColor?: string;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md p-2 rounded-lg border border-white/30 dark:border-black/30">
        <p className="label font-semibold text-neutral-800 dark:text-neutral-200">{`${label}`}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="intro" style={{ color: p.stroke }}>
            {`${p.name} : ${p.value.toFixed(1)} ${unit}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const LineChart: React.FC<LineChartProps> = ({
  data,
  dataKey,
  xAxisKey,
  unit,
  strokeColor = "#16a34a",
  goal,
  trendDataKey,
  trendStrokeColor = "#fb923c", // A nice contrasting orange
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(128, 128, 128, 0.2)"
        />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: "currentColor", fontSize: 12 }}
        />
        <YAxis
          domain={["dataMin - 2", "dataMax + 2"]}
          tick={{ fill: "currentColor", fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip unit={unit} />} />

        {/* --- GOAL WEIGHT LINE --- */}
        {goal && (
          <ReferenceLine
            y={goal}
            label={{
              value: `Goal: ${goal}${unit}`,
              position: "insideTopRight",
              fill: "rgba(128, 128, 128, 0.9)",
            }}
            stroke="rgba(128, 128, 128, 0.8)"
            strokeDasharray="4 4"
          />
        )}

        {/* --- DAILY WEIGHT LINE (Slightly faded) --- */}
        <Line
          type="monotone"
          dataKey={dataKey}
          name="Daily"
          stroke={strokeColor}
          strokeOpacity={0.5} // Fade it out so trend is clear
          strokeWidth={2}
          dot={{ r: 3, fill: strokeColor, fillOpacity: 0.5 }}
          activeDot={{ r: 6 }}
        />

        {/* --- THE MOVING AVERAGE TREND LINE --- */}
        {trendDataKey && (
          <Line
            type="monotone"
            dataKey={trendDataKey}
            name="7-Day Avg"
            stroke={trendStrokeColor}
            strokeWidth={3} // Thicker to show importance
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 8, stroke: trendStrokeColor }}
          />
        )}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;
