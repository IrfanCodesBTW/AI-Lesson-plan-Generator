import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
const WavyPercentBadge = () => (
  <div className="relative flex items-center justify-center flex-shrink-0">
    <svg
      className="w-11 h-11 text-current"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
    >
      <path
        d="M50 8 
           C53 14, 57 14, 60 8 
           C63 14, 67 14, 70 8 
           C73 14, 77 14, 80 8 
           C83 14, 87 18, 90 22 
           C87 25, 87 29, 90 32 
           C87 35, 87 39, 90 42 
           C87 45, 87 49, 90 52 
           C87 55, 87 59, 90 62 
           C87 65, 87 69, 90 72 
           C87 75, 87 79, 90 82 
           C87 85, 83 89, 80 92 
           C77 89, 73 89, 70 92 
           C67 89, 63 89, 60 92 
           C57 89, 53 89, 50 92 
           C47 89, 43 89, 40 92 
           C37 89, 33 89, 30 92 
           C27 89, 23 89, 20 92 
           C17 89, 13 85, 10 82 
           C13 79, 13 75, 10 72 
           C13 69, 13 65, 10 62 
           C13 59, 13 55, 10 52 
           C13 49, 13 45, 10 42 
           C13 39, 13 35, 10 32 
           C13 29, 13 25, 10 22 
           C13 18, 17 14, 20 8 
           C23 14, 27 14, 30 8 
           C33 14, 37 14, 40 8 
           C43 14, 47 14, 50 8 Z"
        fill="transparent"
      />
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontSize="32"
        fontWeight="900"
        fill="currentColor"
        fontFamily="Inter, sans-serif"
      >
        %
      </text>
    </svg>
  </div>
);
export function MetricCard({
  title,
  value,
  trend,
  trendDirection = 'up',
  subtitle = 'since last month',
  variant = 'neutral',
}) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    if (typeof value === 'number') {
      const duration = 800;
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value]);
  // Styling maps based on variants
  const variantStyles = {
    yellow: {
      bg: 'bg-[#FFD633]',
      text: 'text-[#111111]',
      textSecondary: 'text-[#333333]',
      textMuted: 'text-[#444444]',
      border: 'border-black dark:border-black',
      trendColor: 'text-[#1B5E20]',
    },
    red: {
      bg: 'bg-[#F04D3A]',
      text: 'text-white',
      textSecondary: 'text-white/90',
      textMuted: 'text-white/80',
      border: 'border-black dark:border-black',
      trendColor: 'text-[#C8E6C9]', // Light green for positive trend on red card
    },
    blue: {
      bg: 'bg-[#2F6FD6]',
      text: 'text-white',
      textSecondary: 'text-white/90',
      textMuted: 'text-white/80',
      border: 'border-black dark:border-black',
      trendColor: 'text-[#C8E6C9]',
    },
    neutral: {
      bg: 'bg-card',
      text: 'text-text-primary',
      textSecondary: 'text-text-secondary',
      textMuted: 'text-text-muted',
      border: 'border-black dark:border-white',
      trendColor:
        trendDirection === 'up'
          ? 'text-success-dark dark:text-success'
          : 'text-danger dark:text-danger-dark',
    },
  };
  const style = variantStyles[variant];
  return (
    <div
      className={`relative rounded-[20px] p-5 flex flex-col justify-between min-h-[140px] border-[4px] transition-all duration-200 shadow-card hover:translate-y-[-2px] hover:shadow-card-hover ${style.bg} ${style.border}`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-black uppercase tracking-wider ${style.textSecondary}`}>
          {title}
        </span>
        <div className={style.text}>
          <WavyPercentBadge />
        </div>
      </div>

      {/* Value block */}
      <div className="mt-3">
        <span className={`block text-4xl font-black font-heading leading-none ${style.text}`}>
          {displayValue}
        </span>

        {/* Trend + Subtitle */}
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-extrabold ${style.trendColor}`}
            >
              {trendDirection === 'up' ? (
                <TrendingUp className="h-3 w-3 stroke-[3]" />
              ) : (
                <TrendingDown className="h-3 w-3 stroke-[3]" />
              )}
              {trend}
            </span>
            <span className={`text-[11px] font-semibold ${style.textMuted}`}>{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
}
