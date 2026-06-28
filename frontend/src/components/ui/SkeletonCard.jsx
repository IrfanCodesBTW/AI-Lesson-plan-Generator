export function SkeletonCard({ count = 1, height = 'h-60' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} w-full rounded-[20px] p-6 space-y-4 border-[4px] border-black dark:border-white bg-card shadow-card relative overflow-hidden`}
        >
          <div className="skeleton h-4 w-1/3 rounded-lg" />
          <div className="skeleton h-8 w-1/2 rounded-lg" />
          <div className="skeleton h-3 w-2/3 rounded-lg" />
          <div className="flex gap-2 mt-4">
            <div className="skeleton h-8 w-20 rounded-lg" />
            <div className="skeleton h-8 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </>
  );
}
