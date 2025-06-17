"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect ke halaman dengan query param atau kirim ke context
    console.log("Cari:", searchTerm);
  };

  return (
    <nav className="bg-white shadow-md p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-xl font-bold text-gray-800">
        <Link href="/">Gesit IT Log</Link>
      </div>

      <form onSubmit={handleSearch} className="w-full md:w-1/3">
        <input
          type="text"
          placeholder="Cari aktivitas..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>
    </nav>
  );
}
