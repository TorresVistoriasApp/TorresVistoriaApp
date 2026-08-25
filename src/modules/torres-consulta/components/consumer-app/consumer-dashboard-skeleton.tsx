export function ConsumerDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-lg space-y-6 md:max-w-none md:space-y-8">
      <div className="ui-panel h-52 bg-muted" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="ui-panel h-[9.5rem] bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="ui-panel h-44 bg-muted" />
        ))}
      </div>
      <div className="ui-panel h-36 bg-muted" />
    </div>
  );
}
