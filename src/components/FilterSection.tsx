'use client';

import { Filter } from 'lucide-react';

type Props = {
  filterIT: string;
  setFilterIT: (val: string) => void;
  filterDateFrom: string;
  setFilterDateFrom: (val: string) => void;
  filterDateTo: string;
  setFilterDateTo: (val: string) => void;
};

export default function FilterSection({
  filterIT,
  setFilterIT,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
}: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1 text-gray-700">
        <Filter size={18} />
        <span className="text-sm font-medium">Filter</span>
      </div>
      <input
        type="date"
        value={filterDateFrom}
        onChange={(e) => setFilterDateFrom(e.target.value)}
        className="input max-w-[160px]"
      />
      <input
        type="date"
        value={filterDateTo}
        onChange={(e) => setFilterDateTo(e.target.value)}
        className="input max-w-[160px]"
      />
      <select
        value={filterIT}
        onChange={(e) => setFilterIT(e.target.value)}
        className="input max-w-[160px]"
      >
        <option value="">All IT</option>
        <option value="Bendry">Bendry</option>
        <option value="Rudi">Rudi</option>
      </select>
    </div>
  );
}
