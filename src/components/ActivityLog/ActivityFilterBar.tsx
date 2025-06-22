'use client';

type Props = {
  filterDateFrom: string;
  setFilterDateFrom: (val: string) => void;
  filterDateTo: string;
  setFilterDateTo: (val: string) => void;
  filterIT: string;
  setFilterIT: (val: string) => void;
  searchKeyword: string;
  setSearchKeyword: (val: string) => void;
};

export default function ActivityFilterBar({
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  filterIT,
  setFilterIT,
  searchKeyword,
  setSearchKeyword,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2 md:gap-4 mb-4 items-center">
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
      <input
        type="text"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        placeholder="🔍 Search..."
        className="input w-full sm:w-[200px]"
      />
    </div>
  );
}
