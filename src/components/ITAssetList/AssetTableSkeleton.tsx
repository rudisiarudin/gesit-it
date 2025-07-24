export default function AssetTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full text-sm border-collapse table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left font-semibold">Item</th>
            <th className="p-3 text-left font-semibold">Brand</th>
            <th className="p-3 text-left font-semibold">Category</th>
            <th className="p-3 text-left font-semibold">Status</th>
            <th className="p-3 text-left font-semibold">User</th>
            <th className="p-3 text-left font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="animate-pulse border-b">
              <td className="p-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
              <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/2" /></td>
              <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/3" /></td>
              <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/4" /></td>
              <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/3" /></td>
              <td className="p-3">
                <div className="flex gap-2">
                  <div className="h-6 w-8 bg-gray-200 rounded" />
                  <div className="h-6 w-8 bg-gray-200 rounded" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
