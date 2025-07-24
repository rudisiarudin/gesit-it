export default function AssetSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white p-4 rounded-xl shadow-sm border space-y-2"
        >
          <div className="h-4 bg-gray-300 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="flex gap-2 mt-2">
            <div className="h-6 w-12 bg-gray-200 rounded" />
            <div className="h-6 w-12 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
