"use client";

import React, { useState } from "react";
import { Filter, XCircle } from "lucide-react";

type Props = {
  filterIT: string;
  setFilterIT: (v: string) => void;
  filterDateFrom: string;
  setFilterDateFrom: (v: string) => void;
  filterDateTo: string;
  setFilterDateTo: (v: string) => void;
  searchKeyword: string;
  setSearchKeyword: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
};

export default function FilterBar({
  filterIT,
  setFilterIT,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  searchKeyword,
  setSearchKeyword,
  filterStatus,
  setFilterStatus,
}: Props) {
  const [showFilters, setShowFilters] = useState(false);

  const resetFilters = () => {
    setFilterIT("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSearchKeyword("");
    setFilterStatus("");
  };

  return (
    <div className="mb-4 space-y-2">
      {/* Toggle button */}
      <button
        onClick={() => setShowFilters((prev) => !prev)}
        className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
      >
        <Filter size={16} />
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 md:gap-4 items-end">
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

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input max-w-[160px]"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="On Progress">On Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="🔍 Search..."
            className="input w-full sm:w-[200px]"
          />

          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            title="Reset Filters"
          >
            <XCircle size={16} />
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
