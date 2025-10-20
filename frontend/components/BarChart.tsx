
import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
    data: any[];
    xAxisKey: string;
    bars: { dataKey: string; fill: string }[];
}


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md p-3 rounded-lg border border-white/30 dark:border-black/30">
        <p className="label font-semibold text-neutral-800 dark:text-neutral-200">{`${label}`}</p>
        {payload.map((pld: any) => (
          <p key={pld.dataKey} style={{ color: pld.fill }}>
            {`${pld.name}: ${pld.value.toFixed(1)}g`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BarChart: React.FC<BarChartProps> = ({ data, xAxisKey, bars }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
        <XAxis dataKey={xAxisKey} tick={{ fill: 'currentColor', fontSize: 12 }} />
        <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" />
        {bars.map(bar => (
          <Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.fill} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
