"use client";
import React, { useMemo, useState, ChangeEvent } from "react";

// Type definitions
interface Extension {
  id: number;
  name: string;
  dept: string;
  ext: string;
  notes: string;
}

// Phone Extension Data (UPDATED TO LATEST DIRECTORY DATA)
const initialExtensions: Extension[] = [
  // BOARD OF COMMISSIONERS (Identical)
  { id: 1, name: "JSA", dept: "Board of Commissioners", ext: "100", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 2, name: "JSB", dept: "Board of Commissioners", ext: "101", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 3, name: "JSC", dept: "Board of Commissioners", ext: "102", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 4, name: "MSA", dept: "Board of Commissioners", ext: "103", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 5, name: "MSB", dept: "Board of Commissioners", ext: "104", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 6, name: "MSC", dept: "Board of Commissioners", ext: "105", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 7, name: "MSD", dept: "Board of Commissioners", ext: "106", notes: "BOARD OF COMMISSIONAIRE" },

  // PA & SECRETARY (Identical)
  { id: 8, name: "Asma", dept: "PR & Secretary", ext: "111", notes: "MSB" },
  { id: 9, name: "Intan", dept: "PR & Secretary", ext: "112", notes: "Chairman" },
  { id: 10, name: "Dinny", dept: "PR & Secretary", ext: "113", notes: "CEO" },
  { id: 11, name: "Artika", dept: "PR & Secretary", ext: "114", notes: "Jave" },
  { id: 12, name: "Sarah", dept: "PR & Secretary", ext: "115", notes: "Javier" },
  { id: 86, name: "Dwi", dept: "PR & Secretary", ext: "511", notes: "Jones" },

  // FINANCE & ACCOUNTING (Identical)
  { id: 13, name: "Yayan", dept: "Finance & Accounting", ext: "120", notes: "FINANCE & ACCOUNTING" },
  { id: 14, name: "Merly", dept: "Finance & Accounting", ext: "122", notes: "FINANCE & ACCOUNTING" },
  { id: 15, name: "Maradonna", dept: "Finance & Accounting", ext: "154", notes: "FINANCE & ACCOUNTING" },
  { id: 16, name: "Vanesha", dept: "Finance & Accounting", ext: "161", notes: "FINANCE & ACCOUNTING" },
  { id: 17, name: "Lisl", dept: "Finance & Accounting", ext: "163", notes: "FINANCE & ACCOUNTING" },
  { id: 18, name: "Stephanie", dept: "Finance & Accounting", ext: "167", notes: "FINANCE & ACCOUNTING" },
  { id: 19, name: "Evi", dept: "Finance & Accounting", ext: "168", notes: "FINANCE & ACCOUNTING" },
  { id: 20, name: "Milan", dept: "Finance & Accounting", ext: "169", notes: "FINANCE & ACCOUNTING" },
  { id: 21, name: "Winata", dept: "Finance & Accounting", ext: "170", notes: "FINANCE & ACCOUNTING" },
  { id: 22, name: "Novitasari", dept: "Finance & Accounting", ext: "171", notes: "FINANCE & ACCOUNTING" },
  { id: 23, name: "Rama", dept: "Finance & Accounting", ext: "172", notes: "FINANCE & ACCOUNTING" },
  { id: 24, name: "Winarti", dept: "Finance & Accounting", ext: "173", notes: "FINANCE & ACCOUNTING" },

  // CORPORATE AFFAIRS (Identical)
  { id: 25, name: "Peng Tjoan", dept: "Corporate Affairs", ext: "130", notes: "CORPORATE AFFAIR" },
  { id: 26, name: "Thomas", dept: "Corporate Affairs", ext: "131", notes: "CORPORATE AFFAIR" },
  { id: 27, name: "Yohan", dept: "Corporate Affairs", ext: "141", notes: "CORPORATE AFFAIR" },
  { id: 28, name: "Yudha", dept: "Corporate Affairs", ext: "181", notes: "CORPORATE AFFAIR" },
  { id: 29, name: "Ruby", dept: "Corporate Affairs", ext: "182", notes: "CORPORATE AFFAIR" },

  // CORPORATE SECRETARY & LEGAL (Felly 142 replaced by Sylvia 142)
  { id: 30, name: "Natalia", dept: "Corporate Secretary & Legal", ext: "140", notes: "CORPORATE SECRETARY & LEGAL" },
  { id: 31, name: "Sylvia", dept: "Corporate Secretary & Legal", ext: "142", notes: "CORPORATE SECRETARY & LEGAL" }, // Updated Name
  { id: 32, name: "Desi", dept: "Corporate Secretary & Legal", ext: "143", notes: "CORPORATE SECRETARY & LEGAL" },
  { id: 33, name: "Nancy", dept: "Corporate Secretary & Legal", ext: "152", notes: "CORPORATE SECRETARY & LEGAL" },

  // GENERAL AFFAIRS (Ext. 188/189 Conflict Resolved and Updated)
  { id: 34, name: "Susilo", dept: "General Affairs", ext: "162", notes: "GENERAL AFFAIR" },
  { id: 35, name: "Etty", dept: "General Affairs", ext: "188", notes: "GENERAL AFFAIR" },
  { id: 87, name: "Suryadi", dept: "General Affairs", ext: "189", notes: "GENERAL AFFAIR" }, // Updated Ext
  { id: 36, name: "Noni", dept: "General Affairs", ext: "191", notes: "GENERAL AFFAIR" },

  // HR & LOGISTICS (Rara's ext. updated to 198)
  { id: 37, name: "Javier", dept: "HR & Logistics", ext: "195", notes: "HR & LOGISTICS" },
  { id: 38, name: "Resti", dept: "HR & Logistics", ext: "185", notes: "HR & LOGISTICS" },
  { id: 39, name: "Nisa", dept: "HR & Logistics", ext: "187", notes: "HR & LOGISTICS" },
  { id: 40, name: "Rara", dept: "HR & Logistics", ext: "198", notes: "HR & LOGISTICS" }, // Updated Ext.

  // INFORMATION TECHNOLOGY (Identical)
  { id: 41, name: "Rudi", dept: "Information Technology", ext: "196", notes: "INFORMATION TECHNOLOGY" },
  { id: 42, name: "Bendry", dept: "Information Technology", ext: "197", notes: "INFORMATION TECHNOLOGY" },

  // GESIT FOUNDATION (Identical)
  { id: 43, name: "Yuni", dept: "Gesit Foundation", ext: "186", notes: "GESIT FOUNDATION" },
  { id: 44, name: "Kevin", dept: "Gesit Foundation", ext: "192", notes: "GESIT FOUNDATION" },

  // PROPERTY (Identical)
  { id: 45, name: "Jave", dept: "Property", ext: "301", notes: "PROPERTY (TRADING CONFLICT)" },
  { id: 46, name: "Donny Triatmoko", dept: "Property", ext: "202", notes: "PROPERTY" },
  { id: 47, name: "Stefanini", dept: "Property", ext: "203", notes: "PROPERTY" },
  { id: 48, name: "Eliaanti", dept: "Property", ext: "204", notes: "PROPERTY" },
  { id: 49, name: "Petrus", dept: "Property", ext: "206", notes: "PROPERTY" },
  { id: 50, name: "Neysa", dept: "Property", ext: "207", notes: "PROPERTY" },
  { id: 51, name: "Katherine", dept: "Property", ext: "208", notes: "PROPERTY" },
  { id: 52, name: "Corrina", dept: "Property", ext: "302", notes: "PROPERTY" },

  // TRADING (Identical)
  { id: 53, name: "Suryadi Hertanto", dept: "Trading", ext: "301", notes: "TRADING (PROPERTY CONFLICT)" },
  { id: 54, name: "Hilal", dept: "Trading", ext: "303", notes: "TRADING" },
  { id: 55, name: "Harvey", dept: "Trading", ext: "304", notes: "TRADING" },
  { id: 56, name: "Ayu", dept: "Trading", ext: "306", notes: "TRADING" },

  // FINANCIAL INVESTMENT (Identical)
  { id: 57, name: "Ita Permatasari", dept: "Financial Investment", ext: "305", notes: "FINANCIAL INVESTMENT" },

  // DINAMIKA SEJAHTERA MANDIRI (COMPLETELY OVERHAULED based on new image)
  // DSM 26 - Extensions 210-238
  { id: 90, name: "Budhi Rahmadhi", dept: "Dinamika Sejahtera Mandiri", ext: "210", notes: "DSM 26" },
  { id: 91, name: "Fendra", dept: "Dinamika Sejahtera Mandiri", ext: "211", notes: "DSM 26" },
  { id: 92, name: "Husni", dept: "Dinamika Sejahtera Mandiri", ext: "212", notes: "DSM 26" },
  { id: 93, name: "Dwi", dept: "Dinamika Sejahtera Mandiri", ext: "213", notes: "DSM 26" },
  { id: 94, name: "Tunggul", dept: "Dinamika Sejahtera Mandiri", ext: "215", notes: "DSM 26 (Shared Line)" },
  { id: 95, name: "Titis", dept: "Dinamika Sejahtera Mandiri", ext: "215", notes: "DSM 26 (Shared Line)" },
  { id: 96, name: "Ryandhi", dept: "Dinamika Sejahtera Mandiri", ext: "215", notes: "DSM 26 (Shared Line)" },
  { id: 97, name: "Aldri", dept: "Dinamika Sejahtera Mandiri", ext: "220", notes: "DSM 26 (Shared Line)" },
  { id: 98, name: "Rayvi", dept: "Dinamika Sejahtera Mandiri", ext: "220", notes: "DSM 26 (Shared Line)" },
  { id: 99, name: "Yusup", dept: "Dinamika Sejahtera Mandiri", ext: "223", notes: "DSM 26 (Shared Line)" },
  { id: 100, name: "Hadly", dept: "Dinamika Sejahtera Mandiri", ext: "223", notes: "DSM 26 (Shared Line)" },
  { id: 101, name: "Andrias", dept: "Dinamika Sejahtera Mandiri", ext: "225", notes: "DSM 26" },
  { id: 102, name: "Pipin", dept: "Dinamika Sejahtera Mandiri", ext: "226", notes: "DSM 26 (Shared Line)" },
  { id: 103, name: "Said", dept: "Dinamika Sejahtera Mandiri", ext: "226", notes: "DSM 26 (Shared Line)" },
  { id: 104, name: "Afif", dept: "Dinamika Sejahtera Mandiri", ext: "228", notes: "DSM 26 (Shared Line)" },
  { id: 105, name: "Hansidi", dept: "Dinamika Sejahtera Mandiri", ext: "228", notes: "DSM 26 (Shared Line)" },
  { id: 106, name: "Aditya", dept: "Dinamika Sejahtera Mandiri", ext: "230", notes: "DSM 26 (Shared Line)" },
  { id: 107, name: "Annisa Ayu", dept: "Dinamika Sejahtera Mandiri", ext: "230", notes: "DSM 26 (Shared Line)" },
  { id: 108, name: "Irsan", dept: "Dinamika Sejahtera Mandiri", ext: "232", notes: "DSM 26 (Shared Line)" },
  { id: 109, name: "Juni", dept: "Dinamika Sejahtera Mandiri", ext: "232", notes: "DSM 26 (Shared Line)" },
  { id: 110, name: "Rahmat", dept: "Dinamika Sejahtera Mandiri", ext: "236", notes: "DSM 26 (Shared Line)" },
  { id: 111, name: "Firly", dept: "Dinamika Sejahtera Mandiri", ext: "236", notes: "DSM 26 (Shared Line)" },
  { id: 112, name: "Diana", dept: "Dinamika Sejahtera Mandiri", ext: "238", notes: "DSM 26" },

  // DSM 27 - Extensions 502, 504
  { id: 113, name: "Jones", dept: "Dinamika Sejahtera Mandiri", ext: "502", notes: "DSM 27" },
  { id: 114, name: "Nike", dept: "Dinamika Sejahtera Mandiri", ext: "504", notes: "DSM 27" },

  // Common Extensions / Operational (UPDATED)
  { id: 115, name: "Pantry", dept: "Common Facilities", ext: "241", notes: "Common Area (27th Floor)" },
  { id: 116, name: "Operator 1", dept: "Common Facilities", ext: "300", notes: "Common Area (27th Floor)" },
  { id: 117, name: "Operator 2", dept: "Common Facilities", ext: "200", notes: "Common Area (27th Floor)" },
  // Removed previous 800-series meeting room extensions
];

function ExtensionCard({ item }: { item: Extension }) {
  const initial = item.name.charAt(0).toUpperCase();
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border-b-4 border-indigo-500 transition duration-300 transform hover:shadow-2xl h-36">
      {/* Top Section: Avatar, Name, and Extension Badge */}
      <div className="flex items-start justify-between">
        <div className="flex items-center w-full max-w-[70%]">
          {/* Avatar (Circle with Initial) */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg mr-4 border-2 border-indigo-300">
            {initial}
          </div>
          {/* Name and Department */}
          <div className="overflow-hidden">
            <h2 className="text-xl font-bold text-gray-800 leading-snug truncate" title={item.name}>
              {item.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1 truncate" title={item.dept}>
              {item.dept}
            </p>
          </div>
        </div>

        {/* Static Extension Display */}
        <span
          title="Extension Number"
          className="flex-shrink-0 px-3 py-2 bg-yellow-100 text-yellow-700 font-extrabold text-2xl rounded-xl shadow-inner border border-yellow-200 self-center flex items-center space-x-2"
        >
          {/* Minimal Phone Icon SVG (Handset style) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-yellow-600"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6l1.5-2.5 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
          </svg>
          <span>{item.ext}</span>
        </span>
      </div>
    </div>
  );
}

export default function OfficeExtensionsDirectory() {
  const [query, setQuery] = useState("");

  // Sort once (stable) by name A-Z
  const sorted = useMemo(
    () => [...initialExtensions].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return sorted;
    return sorted.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(term);
      const deptMatch = item.dept.toLowerCase().includes(term);
      const extMatch = item.ext.includes(term);
      const notesMatch = item.notes.toLowerCase().includes(term);
      return nameMatch || deptMatch || extMatch || notesMatch;
    });
  }, [query, sorted]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);

  return (
    <main className="min-h-screen antialiased bg-indigo-50">
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12 pt-4">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Office Extensions Directory (TCG Internal)
          </h1>
          <p className="text-lg text-indigo-700 mt-2 font-medium">
            List of employee contacts and office extensions for easy viewing.
          </p>
        </header>

        {/* Search */}
        <div className="mb-8 shadow-2xl bg-white rounded-2xl p-6 border-4 border-indigo-100/70">
          <div className="relative">
            {/* Search Icon */}
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <label htmlFor="search-input" className="sr-only">
              Search name, department, or extension
            </label>
            <input
              id="search-input"
              type="text"
              placeholder="Search name, department, or extension..."
              value={query}
              onChange={onChange}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-indigo-600 focus:border-indigo-600 shadow-inner transition duration-150"
            />
          </div>
        </div>

        {/* List */}
        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {filtered.map((item) => (
              <div key={item.id} role="listitem">
                <ExtensionCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-xl shadow-md border border-gray-200">
            <p className="text-xl font-semibold text-gray-500">
              No extensions matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
