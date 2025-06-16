'use client';

import { useState } from "react";
import { Funnel } from "lucide-react";

type Props = {
  onFilter: (filters: { startDate?: string | null; endDate?: string | null; it?: string | null }) => void;
};

export default function ActivityFilter({ onFilter }: Props) {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [it, setIT] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    onFilter({
      startDate: startDate?.trim() || null,
      endDate: endDate?.trim() || null,
      it: it?.trim() || null,
    });
    setOpen(false);
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setIT(null);
    onFilter({});
    setOpen(false);
  };

  return (
    <div className="mb-4">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Funnel size={16} />
          Filter
        </button>
      )}

      {open && (
        <div className="mt-4 bg-white border shadow-md rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={startDate || ""}
              onChange={(e) => setStartDate(e.target.value || null)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">End Date</label>
            <input
              type="date"
              value={endDate || ""}
              onChange={(e) => setEndDate(e.target.value || null)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">IT</label>
            <select
              value={it || ""}
              onChange={(e) => setIT(e.target.value || null)}
              className="input"
            >
              <option value="">All</option>
              <option value="Bendry">Bendry</option>
              <option value="Rudi">Rudi</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleApply}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Apply
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Reset
            </button>
            <button
              onClick={() => setOpen(false)}
              className="bg-red-200 px-4 py-2 rounded-lg hover:bg-red-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
