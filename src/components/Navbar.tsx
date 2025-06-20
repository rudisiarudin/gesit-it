"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4 flex items-center justify-between">
      <div className="text-xl font-bold text-gray-800">
        <Link href="/">Gesit IT Log</Link>
      </div>
    </nav>
  );
}
