import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartProps {
    data: any[];
    dataKey: string;
    xAxisKey: string;
    strokeColor?: string;
}

const CustomTooltip = ({ active, payload, label, strokeColor }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md p-2 rounded-lg border border-white/30 dark:border-black/30">
        <p className="label font-semibold text-neutral-800 dark:text-neutral-200">{`${label}`}</p>
        <p className="intro" style={{ color: strokeColor }}>{`Weight : ${payload[0].value.toFixed(1)} kg`}</p>
      </div>
    );
  }

  return null;
};

const LineChart: React.FC<LineChartProps> = ({ data, dataKey, xAxisKey, strokeColor = '#16a34a' }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
        <XAxis dataKey={xAxisKey} tick={{ fill: 'currentColor', fontSize: 12 }} />
        <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: 'currentColor', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip strokeColor={strokeColor} />} />
        <Line type="monotone" dataKey={dataKey} stroke={strokeColor} strokeWidth={2} dot={{ r: 4, fill: strokeColor }} activeDot={{ r: 8 }} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;