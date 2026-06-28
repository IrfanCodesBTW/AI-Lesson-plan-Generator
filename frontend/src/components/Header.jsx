import { Search, Command, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ui/ThemeToggle';
export function Header() {
  const { user } = useAuth();
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const formatDate = (d) =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const dateRange = `${formatDate(monthStart)} - ${formatDate(monthEnd)}`;
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 py-4 mb-6">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 stroke-[3.5] text-text-muted" />
        <input
          type="search"
          placeholder="Search or type a command"
          className="w-full pl-11 pr-16 py-3 rounded-[16px] border-[4px] border-black dark:border-white bg-card text-text-primary text-sm transition-all duration-150 focus:outline-none focus:bg-hover focus:shadow-md focus:-translate-y-[2px]"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-black border-[2px] border-black bg-[#f7f4ea] text-black rounded-lg px-2 py-1">
          <Command className="h-3 w-3 stroke-[3]" />F
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Date Range Badge */}
        <div className="hidden lg:flex items-center gap-2 rounded-[14px] px-3.5 py-2 text-xs font-black border-[3px] border-black dark:border-white bg-card shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-text-secondary">
          <Calendar className="h-4 w-4 stroke-[2.5]" />
          {dateRange}
        </div>

        {/* Page Context Label */}
        <span className="hidden xl:inline text-base font-black font-heading text-text-primary">
          Neo-Brutalist Playground
        </span>

        <ThemeToggle />

        {/* User Avatar */}
        {user && (
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="h-10 w-10 rounded-full border-[3px] border-black dark:border-white bg-[#ffd633] text-black flex items-center justify-center text-sm font-black shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <span className="text-sm font-black text-text-primary hidden xl:block">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
