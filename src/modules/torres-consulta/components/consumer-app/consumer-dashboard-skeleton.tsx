export function ConsumerDashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-36 rounded-[1.75rem] bg-white/70" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-20 rounded-2xl bg-white/70" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-36 rounded-[1.35rem] bg-white/70" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-28 rounded-[1.25rem] bg-white/70" />
        <div className="h-28 rounded-[1.25rem] bg-white/70" />
      </div>
    </div>
  );
}
