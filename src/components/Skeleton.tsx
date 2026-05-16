export function GameCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border bg-white p-5 shadow-sm">
      <div className="h-4 w-32 rounded bg-gray-200" />
      <div className="mt-2 h-6 w-48 rounded bg-gray-200" />
      <div className="mt-1 h-4 w-40 rounded bg-gray-200" />
      <div className="mt-4 h-4 w-20 rounded bg-gray-200" />
      <div className="mt-4 flex gap-2">
        <div className="h-8 w-20 rounded-md bg-gray-200" />
        <div className="h-8 w-28 rounded-md bg-gray-200" />
        <div className="h-8 w-32 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="flex flex-col gap-4">
        <GameCardSkeleton />
        <GameCardSkeleton />
        <GameCardSkeleton />
      </div>
    </div>
  );
}
