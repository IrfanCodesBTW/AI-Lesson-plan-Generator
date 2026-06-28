import { FileX, Search } from 'lucide-react';
export function EmptyState({
  title = 'No data found',
  description = 'There are no items to display at this time.',
  icon = 'empty',
  action,
}) {
  const Icon = icon === 'search' ? Search : FileX;
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-[4px] border-black dark:border-white rounded-[20px] bg-card shadow-card">
      <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4 border-[3px] border-black dark:border-white bg-[#F4F0FF] text-[#8D6BE8] dark:bg-zinc-800">
        <Icon className="h-8 w-8 stroke-[2.5]" />
      </div>
      <h3 className="text-xl font-black mb-1 text-text-primary">{title}</h3>
      <p className="text-sm font-semibold max-w-sm mb-6 text-text-secondary">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
