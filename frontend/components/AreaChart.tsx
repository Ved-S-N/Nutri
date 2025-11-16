// import React from 'react';
// import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// interface AreaChartProps {
//     data: any[];
//     dataKey: string;
//     xAxisKey: string;
// }

// const CustomTooltip = ({ active, payload, label }: any) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md p-2 rounded-lg border border-white/30 dark:border-black/30">
//         <p className="label font-semibold text-neutral-800 dark:text-neutral-200">{`${label}`}</p>
//         <p className="intro text-accent">{`Calories : ${payload[0].value}`}</p>
//       </div>
//     );
//   }

//   return null;
// };

// const AreaChart: React.FC<AreaChartProps> = ({ data, dataKey, xAxisKey }) => {
//   return (
//     <ResponsiveContainer width="100%" height={300}>
//       <RechartsAreaChart data={data}>
//         <defs>
//           <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
//             <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
//           </linearGradient>
//         </defs>
//         <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
//         <XAxis dataKey={xAxisKey} tick={{ fill: 'currentColor', fontSize: 12 }} />
//         <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
//         <Tooltip content={<CustomTooltip />} />
//         <Area type="monotone" dataKey={dataKey} stroke="#16a34a" fillOpacity={1} fill="url(#colorUv)" />
//       </RechartsAreaChart>
//     </ResponsiveContainer>
//   );
// };

// export default AreaChart;

import React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface AreaChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  unit: string;
  goal?: number;
  strokeColor?: string;
  fillColor?: string;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md p-2 rounded-lg border border-white/30 dark:border-black/30">
        <p className="label font-semibold text-neutral-800 dark:text-neutral-200">{`${label}`}</p>
        <p className="intro" style={{ color: payload[0].stroke }}>
          {`${payload[0].name} : ${
            payload[0].value !== undefined ? payload[0].value.toFixed(0) : "0"
          } ${unit}`}
        </p>
      </div>
    );
  }
  return null;
};

const AreaChart: React.FC<AreaChartProps> = ({
  data,
  dataKey,
  xAxisKey,
  unit,
  goal,
  strokeColor = "#16a34a",
  fillColor = "#16a34a",
}) => {
  const gradientId = `colorFill_${dataKey}`;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fillColor} stopOpacity={0.8} />
            <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(128, 128, 128, 0.2)"
        />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: "currentColor", fontSize: 12 }}
        />
        <YAxis
          tick={{ fill: "currentColor", fontSize: 12 }}
          domain={["dataMin - 20", "dataMax + 20"]}
        />
        <Tooltip content={<CustomTooltip unit={unit} />} />

        {/* --- THE GOAL LINE --- */}
        {goal && (
          <ReferenceLine
            y={goal}
            label={{
              value: `Goal: ${goal}`,
              position: "insideTopRight",
              fill: "rgba(128, 128, 128, 0.9)",
            }}
            stroke="rgba(128, 128, 128, 0.8)"
            strokeDasharray="4 4"
          />
        )}

        <Area
          type="monotone"
          dataKey={dataKey}
          name={dataKey.charAt(0).toUpperCase() + dataKey.slice(1)} // Capitalizes 'calories' -> 'Calories'
          stroke={strokeColor}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChart;
