const statusConfig = {
  generated: {
    label: 'Generated',
    className: 'bg-[#EBF2FE] text-[#2F6FD6] dark:bg-[#1a2e50] dark:text-[#60a5fa]',
  },
  draft: {
    label: 'Draft',
    className: 'bg-[#FFF9E0] text-[#E6BD19] dark:bg-[#3e341a] dark:text-[#fcd34d]',
  },
  reviewed: {
    label: 'Reviewed',
    className: 'bg-[#E7F6EC] text-[#3BAA63] dark:bg-[#1a3e26] dark:text-[#4ade80]',
  },
  ai: {
    label: 'AI',
    className: 'bg-[#F4F0FF] text-[#8D6BE8] dark:bg-[#2c2640] dark:text-[#9b7df0]',
  },
  template: {
    label: 'Template',
    className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  },
};
export function StatusBadge({ status, className = '' }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border-[2px] border-black dark:border-white shadow-[1px_1px_0px_#000] dark:shadow-[1px_1px_0px_#fff] ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
export function SourceBadge({ source, className = '' }) {
  return <StatusBadge status={source === 'gemini' ? 'ai' : 'template'} className={className} />;
}
