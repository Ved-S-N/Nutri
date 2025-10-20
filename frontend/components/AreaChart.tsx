
import React from 'react';
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AreaChartProps {
    data: any[];
    dataKey: string;
    xAxisKey: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md p-2 rounded-lg border border-white/30 dark:border-black/30">
        <p className="label font-semibold text-neutral-800 dark:text-neutral-200">{`${label}`}</p>
        <p className="intro text-accent">{`Calories : ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const AreaChart: React.FC<AreaChartProps> = ({ data, dataKey, xAxisKey }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsAreaChart data={data}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
        <XAxis dataKey={xAxisKey} tick={{ fill: 'currentColor', fontSize: 12 }} />
        <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey={dataKey} stroke="#16a34a" fillOpacity={1} fill="url(#colorUv)" />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChart;
