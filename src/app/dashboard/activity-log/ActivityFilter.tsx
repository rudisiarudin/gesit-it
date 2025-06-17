'use client';

import { Filter } from 'lucide-react';
import { useState } from 'react';

type Props = {
  dateFilter: { from: string; to: string };
  setDateFilter: (value: { from: string; to: string }) => void;
};

export default function ActivityFilter({ dateFilter, setDateFilter }: Props) {
  const [open, setOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateFilter({ ...dateFilter, [name]: value });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="bg-gray-200 hover:bg-gray-300 p-2 rounded"
        title="Filter by Date"
      >
        <Filter size={18} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white shadow-md rounded-md border w-64 z-10">
          <div className="flex flex-col gap-2">
            <div>
              <label className="text-sm text-gray-700">From</label>
              <input
                type="date"
                name="from"
                value={dateFilter.from}
                onChange={handleChange}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">To</label>
              <input
                type="date"
                name="to"
                value={dateFilter.to}
                onChange={handleChange}
                className="input mt-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
