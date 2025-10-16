"use client";
import React, { useMemo, useState, ChangeEvent } from "react";

/* ===========================
   Types
=========================== */
interface Extension {
  id: number;
  name: string;
  dept: string;
  ext: string;
  notes: string;
}

/* ===========================
   Phone Extension Data
   (SYNCED WITH OCT 2025 DIRECTORY IMAGE)
=========================== */
const initialExtensions: Extension[] = [
  // BOARD OF COMMISSIONERS
  { id: 1, name: "JSA", dept: "Board of Commissioners", ext: "100", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 2, name: "JSB", dept: "Board of Commissioners", ext: "101", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 3, name: "JSC", dept: "Board of Commissioners", ext: "102", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 4, name: "MSA", dept: "Board of Commissioners", ext: "103", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 5, name: "MSB", dept: "Board of Commissioners", ext: "104", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 6, name: "MSC", dept: "Board of Commissioners", ext: "105", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 7, name: "MSD", dept: "Board of Commissioners", ext: "106", notes: "BOARD OF COMMISSIONAIRE" },

  // PA & SECRETARY
  { id: 8,  name: "Asma",  dept: "PA & Secretary", ext: "111", notes: "MSB" },
  { id: 9,  name: "Intan", dept: "PA & Secretary", ext: "112", notes: "Chairman" },
  { id: 10, name: "Dinny", dept: "PA & Secretary", ext: "113", notes: "CEO" },
  { id: 11, name: "Artika",dept: "PA & Secretary", ext: "114", notes: "Jave" },
  { id: 12, name: "Sarah", dept: "PA & Secretary", ext: "115", notes: "Javier" },
  { id: 86, name: "Dwi",   dept: "PA & Secretary", ext: "511", notes: "Jones" },

  // FINANCE & ACCOUNTING (fixed names)
  { id: 13, name: "Yayan",       dept: "Finance & Accounting", ext: "120", notes: "FINANCE & ACCOUNTING" },
  { id: 14, name: "Merly",       dept: "Finance & Accounting", ext: "122", notes: "FINANCE & ACCOUNTING" },
  { id: 15, name: "Maradonna",   dept: "Finance & Accounting", ext: "154", notes: "FINANCE & ACCOUNTING" },
  { id: 16, name: "Vanesha",     dept: "Finance & Accounting", ext: "161", notes: "FINANCE & ACCOUNTING" },
  { id: 17, name: "Lisi",        dept: "Finance & Accounting", ext: "163", notes: "FINANCE & ACCOUNTING" },
  { id: 18, name: "Stephanie",   dept: "Finance & Accounting", ext: "167", notes: "FINANCE & ACCOUNTING" },
  { id: 19, name: "Evi",         dept: "Finance & Accounting", ext: "168", notes: "FINANCE & ACCOUNTING" },
  { id: 20, name: "Mian",        dept: "Finance & Accounting", ext: "169", notes: "FINANCE & ACCOUNTING" },
  { id: 21, name: "Winata",      dept: "Finance & Accounting", ext: "170", notes: "FINANCE & ACCOUNTING" },
  { id: 22, name: "Novitasari",  dept: "Finance & Accounting", ext: "171", notes: "FINANCE & ACCOUNTING" },
  { id: 23, name: "Rama",        dept: "Finance & Accounting", ext: "172", notes: "FINANCE & ACCOUNTING" },
  { id: 24, name: "Winarti",     dept: "Finance & Accounting", ext: "173", notes: "FINANCE & ACCOUNTING" },

  // CORPORATE AFFAIRS
  { id: 25, name: "Peng Tjoan", dept: "Corporate Affairs", ext: "130", notes: "CORPORATE AFFAIR" },
  { id: 26, name: "Thomas",     dept: "Corporate Affairs", ext: "131", notes: "CORPORATE AFFAIR" },
  { id: 27, name: "Yohan",      dept: "Corporate Affairs", ext: "141", notes: "CORPORATE AFFAIR" },
  { id: 28, name: "Yudha",      dept: "Corporate Affairs", ext: "181", notes: "CORPORATE AFFAIR" },
  { id: 29, name: "Ruby",       dept: "Corporate Affairs", ext: "182", notes: "CORPORATE AFFAIR" },

  // CORPORATE SECRETARY & LEGAL
  { id: 30, name: "Natalia", dept: "Corporate Secretary & Legal", ext: "140", notes: "CORPORATE SECRETARY & LEGAL" },
  { id: 31, name: "Sylvia",  dept: "Corporate Secretary & Legal", ext: "142", notes: "CORPORATE SECRETARY & LEGAL" },
  { id: 32, name: "Desi",    dept: "Corporate Secretary & Legal", ext: "143", notes: "CORPORATE SECRETARY & LEGAL" },
  { id: 33, name: "Nancy",   dept: "Corporate Secretary & Legal", ext: "152", notes: "CORPORATE SECRETARY & LEGAL" },
  { id: 118,name: "Nike",    dept: "Corporate Secretary & Legal", ext: "504", notes: "From directory" },

  // GENERAL AFFAIRS (+ receptionist)
  { id: 34, name: "Susilo", dept: "General Affairs", ext: "162", notes: "GENERAL AFFAIR" },
  { id: 35, name: "Etty",   dept: "General Affairs", ext: "188", notes: "GENERAL AFFAIR" },
  { id: 87, name: "Suryadi",dept: "General Affairs", ext: "189", notes: "GENERAL AFFAIR" },
  { id: 36, name: "Noni",   dept: "General Affairs", ext: "191", notes: "GENERAL AFFAIR" },
  { id: 119,name: "Widya",  dept: "General Affairs", ext: "180/0", notes: "Receptionist" },

  // HR & LOGISTICS
  { id: 37, name: "Javier", dept: "HR & Logistics", ext: "195", notes: "HR & LOGISTICS" },
  { id: 38, name: "Resti",  dept: "HR & Logistics", ext: "185", notes: "HR & LOGISTICS" },
  { id: 39, name: "Nisa",   dept: "HR & LOGISTICS", ext: "187", notes: "HR & LOGISTICS" },
  { id: 40, name: "Rara",   dept: "HR & LOGISTICS", ext: "198", notes: "HR & LOGISTICS" },

  // INFORMATION TECHNOLOGY
  { id: 41, name: "Rudi",  dept: "Information Technology", ext: "196", notes: "INFORMATION TECHNOLOGY" },
  { id: 42, name: "Bendry",dept: "Information Technology", ext: "197", notes: "INFORMATION TECHNOLOGY" },

  // GESIT FOUNDATION
  { id: 44, name: "Kevin", dept: "Gesit Foundation", ext: "192", notes: "GESIT FOUNDATION" },
  { id: 43, name: "Yuni",  dept: "Gesit Foundation", ext: "186", notes: "GESIT FOUNDATION" },

  // PROPERTY (Corrina fix)
  { id: 45, name: "Jave",             dept: "Property", ext: "301", notes: "PROPERTY (TRADING CONFLICT)" },
  { id: 46, name: "Donny Triatmoko",  dept: "Property", ext: "202", notes: "PROPERTY" },
  { id: 47, name: "Stefanini",        dept: "Property", ext: "203", notes: "PROPERTY" },
  { id: 48, name: "Eliaanti",         dept: "Property", ext: "204", notes: "PROPERTY" },
  { id: 49, name: "Petrus",           dept: "Property", ext: "206", notes: "PROPERTY" },
  { id: 50, name: "Neysa",            dept: "Property", ext: "207", notes: "PROPERTY" },
  { id: 51, name: "Katherine",        dept: "Property", ext: "208", notes: "PROPERTY" },
  { id: 52, name: "Corina",           dept: "Property", ext: "302", notes: "PROPERTY" },

  // TRADING
  { id: 53, name: "Suryadi Hertanto", dept: "Trading", ext: "301", notes: "TRADING (PROPERTY CONFLICT)" },
  { id: 54, name: "Hilal",            dept: "Trading", ext: "303", notes: "TRADING" },
  { id: 55, name: "Harvey",           dept: "Trading", ext: "304", notes: "TRADING" },
  { id: 56, name: "Ayu",              dept: "Trading", ext: "306", notes: "TRADING" },

  // FINANCIAL INVESTMENT
  { id: 57, name: "Ita Permatasari", dept: "Financial Investment", ext: "305", notes: "FINANCIAL INVESTMENT" },

  // DINAMIKA SEJAHTERA MANDIRI – 26th FLOOR (shared lines noted)
  { id: 90,  name: "Budhi Rahmadhi", dept: "Dinamika Sejahtera Mandiri", ext: "210", notes: "DSM 26" },
  { id: 91,  name: "Fendra",         dept: "Dinamika Sejahtera Mandiri", ext: "211", notes: "DSM 26" },
  { id: 92,  name: "Husni",          dept: "Dinamika Sejahtera Mandiri", ext: "212", notes: "DSM 26" },
  { id: 93,  name: "Dwi",            dept: "Dinamika Sejahtera Mandiri", ext: "213", notes: "DSM 26" },
  { id: 94,  name: "Tunggul",        dept: "Dinamika Sejahtera Mandiri", ext: "215", notes: "DSM 26 (Shared Line)" },
  { id: 95,  name: "Titis",          dept: "Dinamika Sejahtera Mandiri", ext: "215", notes: "DSM 26 (Shared Line)" },
  { id: 96,  name: "Ryandhi",        dept: "Dinamika Sejahtera Mandiri", ext: "215", notes: "DSM 26 (Shared Line)" },
  { id: 97,  name: "Aldri",          dept: "Dinamika Sejahtera Mandiri", ext: "220", notes: "DSM 26 (Shared Line)" },
  { id: 98,  name: "Rayvi",          dept: "Dinamika Sejahtera Mandiri", ext: "220", notes: "DSM 26 (Shared Line)" },
  { id: 99,  name: "Yusup",          dept: "Dinamika Sejahtera Mandiri", ext: "223", notes: "DSM 26 (Shared Line)" },
  { id: 100, name: "Hadly",          dept: "Dinamika Sejahtera Mandiri", ext: "223", notes: "DSM 26 (Shared Line)" },
  { id: 101, name: "Andrias",        dept: "Dinamika Sejahtera Mandiri", ext: "225", notes: "DSM 26" },
  { id: 102, name: "Pipin",          dept: "Dinamika Sejahtera Mandiri", ext: "226", notes: "DSM 26 (Shared Line)" },
  { id: 103, name: "Said",           dept: "Dinamika Sejahtera Mandiri", ext: "226", notes: "DSM 26 (Shared Line)" },
  { id: 104, name: "Afif",           dept: "Dinamika Sejahtera Mandiri", ext: "228", notes: "DSM 26 (Shared Line)" },
  { id: 105, name: "Hansdi",         dept: "Dinamika Sejahtera Mandiri", ext: "228", notes: "DSM 26 (Shared Line)" },
  { id: 106, name: "Aditya",         dept: "Dinamika Sejahtera Mandiri", ext: "230", notes: "DSM 26 (Shared Line)" },
  { id: 107, name: "Annisa Ayu",     dept: "Dinamika Sejahtera Mandiri", ext: "230", notes: "DSM 26 (Shared Line)" },
  { id: 108, name: "Irsan",          dept: "Dinamika Sejahtera Mandiri", ext: "232", notes: "DSM 26 (Shared Line)" },
  { id: 109, name: "Juni",           dept: "Dinamika Sejahtera Mandiri", ext: "232", notes: "DSM 26 (Shared Line)" },
  { id: 110, name: "Rahmat",         dept: "Dinamika Sejahtera Mandiri", ext: "236", notes: "DSM 26 (Shared Line)" },
  { id: 111, name: "Firly",          dept: "Dinamika Sejahtera Mandiri", ext: "236", notes: "DSM 26 (Shared Line)" },
  { id: 112, name: "Diana",          dept: "Dinamika Sejahtera Mandiri", ext: "238", notes: "DSM 26" },

  // EXEC / SPECIAL (same extensions shown on directory)
  { id: 113, name: "Jones", dept: "Deputy President & CEO", ext: "502", notes: "As listed" },

  // COMMON FACILITIES (27th & 26th)
  { id: 115, name: "Pantry",     dept: "Common Facilities", ext: "241", notes: "Common Area (27th Floor)" },
  { id: 116, name: "Operator 1", dept: "Common Facilities", ext: "200", notes: "Common Area (27th Floor)" },
  { id: 117, name: "Operator 2", dept: "Common Facilities", ext: "300", notes: "Common Area (27th Floor)" },
  { id: 120, name: "Pantry",     dept: "Common Facilities", ext: "190", notes: "Pantry (26th Floor)" },

  // MEETING / COMMON ROOMS (present on directory)
  { id: 121, name: "Board Room 1",    dept: "Common Rooms", ext: "800", notes: "" },
  { id: 122, name: "Board Room 2",    dept: "Common Rooms", ext: "801", notes: "" },
  { id: 123, name: "Conference Room", dept: "Common Rooms", ext: "802", notes: "" },
  { id: 124, name: "Meeting Room 1",  dept: "Common Rooms", ext: "803", notes: "" },
  { id: 125, name: "Cigar Room",      dept: "Common Rooms", ext: "805", notes: "" },
];

/* ===========================
   UI helpers
=========================== */
const PHONE_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
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
);

function classNames(...c: Array<string | false | undefined>) {
  return c.filter(Boolean).join(" ");
}

/* ===========================
   Floor detection (department-only)
=========================== */
function getFloor(dept: string): 26 | 27 {
  if (/Dinamika Sejahtera Mandiri/i.test(dept)) return 26;
  return 27;
}

/* ===========================
   Small components
=========================== */
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg border ${color}`}>{label}</span>
  );
}

function ExtensionCard({ item }: { item: Extension }) {
  const initial = item.name.charAt(0).toUpperCase();
  const floor = getFloor(item.dept);
  const frameColor = floor === 27 ? "border-indigo-200 ring-1 ring-indigo-50" : "border-emerald-200 ring-1 ring-emerald-50";
  const barColor = floor === 27 ? "bg-indigo-400" : "bg-emerald-400";

  return (
    <div className={classNames("relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6 border", frameColor)}>
      {/* top accent bar */}
      <div className={classNames("absolute left-0 right-0 top-0 h-1 rounded-t-2xl", barColor)} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center min-w-0 gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-xl grid place-items-center shadow-sm border-2 border-indigo-300">
            {initial}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate" title={item.name}>
              {item.name}
            </h2>
            <p className="text-sm text-gray-500 truncate" title={item.dept}>{item.dept}</p>
          </div>
        </div>
        <span
          title="Extension Number"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xl font-extrabold bg-amber-50 text-amber-700 border-amber-200"
        >
          {PHONE_ICON}
          <span>{item.ext}</span>
        </span>
      </div>

      {/* Always show floor label */}
      <div className={classNames("mt-3 text-xs font-medium text-center rounded-lg py-1", floor === 27 ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700")}> 
        Located on {floor}th Floor
      </div>
    </div>
  );
}

/* ===========================
   Full Navbar component
=========================== */
function Navbar({
  query,
  onChange,
  floorFilter,
  setFloorFilter,
}: {
  query: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  floorFilter: "All" | 26 | 27;
  setFloorFilter: (f: "All" | 26 | 27) => void;
}) {
  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-white/90 border-b border-indigo-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="Gesit logo" className="h-8 w-auto" />
            <h1 className="truncate text-2xl md:text-3xl font-extrabold text-gray-900">
              Office Extensions Directory <span className="text-indigo-600">(TCG)</span>
            </h1>
          </div>

          {/* Legend badges (desktop) */}
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded border border-emerald-200 bg-emerald-50">26th Floor</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded border border-indigo-200 bg-indigo-50">27th Floor</span>
          </div>
        </div>

        {/* Search + quick filters */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-3">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
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
            <input
              id="search-input"
              type="text"
              placeholder="Search name, department, or extension..."
              value={query}
              onChange={onChange}
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {(["All", 26, 27] as const).map((f) => (
              <button
                key={String(f)}
                onClick={() => setFloorFilter(f)}
                className={classNames(
                  "px-3 py-2 text-sm rounded-xl border whitespace-nowrap",
                  floorFilter === f
                    ? f === 27
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : f === 26
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-800 text-white border-slate-800"
                    : f === 27
                    ? "bg-white text-gray-700 border-indigo-200 hover:border-indigo-300"
                    : f === 26
                    ? "bg-white text-gray-700 border-emerald-200 hover:border-emerald-300"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                )}
                aria-pressed={floorFilter === f}
              >
                {f === "All" ? "All" : `${f}th Floor`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ===========================
   Main component
=========================== */
export default function OfficeExtensionsDirectory() {
  const [query, setQuery] = useState("");
  const [floorFilter, setFloorFilter] = useState<"All" | 26 | 27>("All");

  // Sort once (stable) by name A–Z
  const sorted = useMemo(() => [...initialExtensions].sort((a, b) => a.name.localeCompare(b.name)), []);

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    return sorted.filter((item) => {
      const f = getFloor(item.dept);
      const floorOk = floorFilter === "All" || f === floorFilter;
      if (!term) return floorOk;
      const match =
        item.name.toLowerCase().includes(term) ||
        item.dept.toLowerCase().includes(term) ||
        item.ext.toLowerCase().includes(term) ||
        item.notes.toLowerCase().includes(term);
      return floorOk && match;
    });
  }, [query, sorted, floorFilter]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);

  return (
    <main className="min-h-screen flex flex-col justify-between antialiased bg-gradient-to-b from-indigo-50 to-white">
      {/* Full Navbar */}
      <Navbar query={query} onChange={onChange} floorFilter={floorFilter} setFloorFilter={setFloorFilter} />

      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 py-6 max-w-7xl">
        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {filtered.map((item) => (
              <div key={item.id} role="listitem">
                <ExtensionCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-200">
            <p className="text-lg font-semibold text-gray-700">No matching results found.</p>
            <p className="text-sm text-gray-500 mt-1">Try another keyword or clear the floor filter.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative text-center text-sm text-gray-600 py-8 border-t border-gray-200 bg-white/80">
        <div className="absolute inset-x-0 -top-px h-1 bg-gradient-to-r from-emerald-400 via-slate-200 to-indigo-400" />
        <div className="container mx-auto px-4 flex items-center justify-center gap-3">
          <p>© {new Date().getFullYear()} IT Department — The Gesit Companies · Maintained by Rudi Siarudin</p>
        </div>
      </footer>
    </main>
  );
}
