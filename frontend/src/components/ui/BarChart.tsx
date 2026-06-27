import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
  YAxis,
} from 'recharts';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  maxValue?: number;
  height?: number;
  showLabels?: boolean;
}

const defaultBarColors = [
  '#2F6FD6', // Sun - Blue
  '#F04D3A', // Mon - Red
  '#FFD633', // Tue - Yellow
  '#2F6FD6', // Wed - Blue
  '#3BAA63', // Thu - Green
  '#F04D3A', // Fri - Red
  '#FFD633', // Sat - Yellow
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-800 border-[3px] border-black dark:border-white rounded-lg p-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,1)]">
        <p className="font-black text-sm text-black dark:text-white uppercase tracking-wider">
          {payload[0].payload.label}
        </p>
        <p className="font-bold text-lg text-black dark:text-white">
          {payload[0].value} <span className="text-sm font-semibold">hrs</span>
        </p>
      </div>
    );
  }
  return null;
};

export function BarChart({ data, height = 180, showLabels = true }: BarChartProps) {
  // We need to map data to ensure they always have a small visual representation even if value is 0.
  const chartData = data.map((d) => ({
    ...d,
    // Slightly increase 0 so it shows a tiny block, but keep the real value for tooltip
    displayValue: d.value === 0 ? 0.1 : d.value,
    realValue: d.value,
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          barSize={40}
        >
          {showLabels && (
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fontWeight: 900,
                fill: 'currentColor',
                className: 'text-text-secondary uppercase tracking-wider',
              }}
              dy={10}
            />
          )}
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Bar
            dataKey="displayValue"
            radius={[8, 8, 0, 0]}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => {
              const fillColor = entry.color || defaultBarColors[index % defaultBarColors.length];
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={fillColor}
                  stroke="currentColor"
                  strokeWidth={3}
                  className="text-black dark:text-white"
                />
              );
            })}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
