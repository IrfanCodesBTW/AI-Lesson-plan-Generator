export function InsightCard({
  title,
  description,
  icon: Icon,
  iconBg,
  iconColor,
  linkText = 'View Details',
  onLinkClick,
}) {
  return (
    <div className="rounded-[16px] p-4 space-y-3 border-[3px] border-black dark:border-white transition-all duration-150 bg-card hover:translate-y-[-2px] hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 border-[3px] border-black dark:border-white ${iconBg} ${iconColor}`}
        >
          <Icon className="h-5 w-5 stroke-[2.5]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-text-primary">{title}</h3>
          <p className="text-xs font-semibold leading-relaxed mt-1 text-text-secondary">
            {description}
          </p>
        </div>
      </div>
      <button
        onClick={onLinkClick}
        className="text-xs font-black uppercase tracking-wider cursor-pointer text-primary-500 hover:underline inline-flex items-center"
      >
        {linkText}
      </button>
    </div>
  );
}
