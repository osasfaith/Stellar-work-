type JobCardSkeletonProps = {
  compact?: boolean;
};

export default function JobCardSkeleton({ compact = false }: JobCardSkeletonProps) {
  if (compact) {
    return (
      <div
        className="interactive-card h-full animate-pulse rounded-lg border border-slate-200 bg-white p-4"
        aria-hidden="true"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="h-5 w-28 rounded bg-slate-200" />
          <div className="h-6 w-16 rounded-full bg-slate-200" />
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-4/5 rounded bg-slate-200" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="h-9 w-24 rounded-md bg-slate-200" />
          <div className="h-9 w-28 rounded-md bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="interactive-card h-full animate-pulse rounded-lg border border-slate-200 bg-white p-4"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="h-5 w-24 rounded bg-slate-200" />
        <div className="h-6 w-20 rounded-full bg-slate-200" />
      </div>
      <div className="mt-4 space-y-3">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-5/6 rounded bg-slate-200" />
        <div className="h-3 w-32 rounded bg-slate-200" />
        <div className="h-3 w-40 rounded bg-slate-200" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="h-9 w-28 rounded-md bg-slate-200" />
        <div className="h-9 w-24 rounded-md bg-slate-200" />
        <div className="h-9 w-24 rounded-md bg-slate-200" />
      </div>
    </div>
  );
}
