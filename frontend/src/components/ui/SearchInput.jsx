import { Search, X } from 'lucide-react';
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  onSearch,
  onClear,
  className = '',
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };
  return (
    <div className={`relative ${className}`}>
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
        style={{ color: 'var(--color-text-muted)' }}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="input pl-10 pr-10 py-3"
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
