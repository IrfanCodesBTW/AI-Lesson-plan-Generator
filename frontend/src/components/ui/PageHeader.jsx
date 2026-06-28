export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
      <div className="space-y-1">
        <h1
          className="text-h2 font-bold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
