'use client';

type Props = {
  filterDateFrom: string;
  setFilterDateFrom: (val: string) => void;
  filterDateTo: string;
  setFilterDateTo: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
};

export default function FilterBar({
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  statusFilter,
  setStatusFilter,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 border p-3 rounded-md bg-gray-50">
      <div className="flex flex-col text-sm">
        <label className="mb-1 text-xs text-gray-600">From</label>
        <input
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        />
      </div>

      <div className="flex flex-col text-sm">
        <label className="mb-1 text-xs text-gray-600">To</label>
        <input
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        />
      </div>

      <div className="flex flex-col text-sm">
        <label className="mb-1 text-xs text-gray-600">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="On Progress">On Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>
  );
}
