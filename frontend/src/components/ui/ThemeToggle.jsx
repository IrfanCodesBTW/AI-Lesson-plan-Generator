import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-black dark:border-white bg-card shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] transition-all duration-150 cursor-pointer active:translate-y-[1px] active:shadow-sm"
    >
      <div className="relative h-5 w-5">
        <Sun
          className="absolute inset-0 h-5 w-5 stroke-[2.5] text-text-primary transition-all duration-150"
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? 'rotate(90deg) scale(0)' : 'rotate(0) scale(1)',
          }}
        />
        <Moon
          className="absolute inset-0 h-5 w-5 stroke-[2.5] text-text-primary transition-all duration-150"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? 'rotate(0) scale(1)' : 'rotate(-90deg) scale(0)',
          }}
        />
      </div>
    </button>
  );
}
