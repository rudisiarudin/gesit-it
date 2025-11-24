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
  { id: 1, name: "MSA",          dept: "Board of Commissioners", ext: "103", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 2, name: "MSA Bed Room", dept: "Board of Commissioners", ext: "107", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 3, name: "JSB",          dept: "Board of Commissioners", ext: "101", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 4, name: "JSC",          dept: "Board of Commissioners", ext: "102", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 5, name: "MSB",          dept: "Board of Commissioners", ext: "104", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 6, name: "MSC",          dept: "Board of Commissioners", ext: "105", notes: "BOARD OF COMMISSIONAIRE" },
  { id: 7, name: "MSD",          dept: "Board of Commissioners", ext: "106", notes: "BOARD OF COMMISSIONAIRE" },

  // PA & SECRETARY (dashed boxes kanan atas)
  { id: 8,  name: "Ety",   dept: "PA & Secretary", ext: "188", notes: "" },
  { id: 9,  name: "Intan", dept: "PA & Secretary", ext: "112", notes: "Chairman" },
  { id: 10, name: "Dinny", dept: "PA & Secretary", ext: "113", notes: "CEO" },
  { id: 11, name: "Asma",  dept: "PA & Secretary", ext: "111", notes: "" },
  { id: 86, name: "Dwi",   dept: "PA & Secretary", ext: "311", notes: "" },

  // FINANCE & ACCOUNTING
  { id: 13, name: "Yayan",      dept: "Finance & Accounting", ext: "120", notes: "" },
  { id: 14, name: "Merly",      dept: "Finance & Accounting", ext: "122", notes: "" },
  { id: 15, name: "Maradonna",  dept: "Finance & Accounting", ext: "154", notes: "" },
  { id: 16, name: "Vanesha",    dept: "Finance & Accounting", ext: "161", notes: "" },
  { id: 17, name: "Stephanie",  dept: "Finance & Accounting", ext: "167", notes: "" },
  { id: 18, name: "Lisi",       dept: "Finance & Accounting", ext: "163", notes: "" },
  { id: 19, name: "Parawinata", dept: "Finance & Accounting", ext: "170", notes: "" },
  { id: 20, name: "Novitasari", dept: "Finance & Accounting", ext: "171", notes: "" },
  { id: 21, name: "Mian",       dept: "Finance & Accounting", ext: "169", notes: "" },
  { id: 22, name: "Evi",        dept: "Finance & Accounting", ext: "168", notes: "" },
  { id: 23, name: "Rama",       dept: "Finance & Accounting", ext: "172", notes: "" },
  { id: 24, name: "Winarti",    dept: "Finance & Accounting", ext: "173", notes: "" },

  // CORPORATE AFFAIRS (kiri atas)
  { id: 25, name: "Peng Tjoan", dept: "Corporate Affair", ext: "130", notes: "" },
  { id: 28, name: "Yudha",      dept: "Corporate Affair", ext: "181", notes: "" },
  { id: 26, name: "Thomas",     dept: "Corporate Affair", ext: "131", notes: "" },
  { id: 29, name: "Ruby",       dept: "Corporate Affair", ext: "182", notes: "" },

  // CORPORATE SECRETARY
  { id: 30, name: "Natalia", dept: "Corporate Secretary", ext: "140", notes: "" },
  { id: 31, name: "Yohan",  dept: "Corporate Secretary", ext: "141", notes: "" },
  { id: 32, name: "Sylvia", dept: "Corporate Secretary", ext: "142", notes: "" },
  { id: 33, name: "Desi",   dept: "Corporate Secretary", ext: "143", notes: "" },
  { id: 118,name: "Nancy",  dept: "Corporate Secretary", ext: "152", notes: "" },
  { id: 119,name: "Nike",   dept: "Corporate Secretary", ext: "504", notes: "" },

  // HR & LOGISTICS
  { id: 37, name: "Javier",                   dept: "HR & Logistic", ext: "195", notes: "" },
  { id: 38, name: "Sarah (Sec. to Javier)",   dept: "HR & Logistic", ext: "115", notes: "" },
  { id: 39, name: "Rara",                     dept: "HR & Logistic", ext: "198", notes: "" },
  { id: 40, name: "Resti - HR",               dept: "HR & Logistic", ext: "185", notes: "" },
  { id: 120,name: "Nisa - HR",                dept: "HR & Logistic", ext: "187", notes: "" },
  { id: 41, name: "Bendry - IT",              dept: "HR & Logistic", ext: "197", notes: "" },
  { id: 42, name: "Rudi - IT",                dept: "HR & Logistic", ext: "196", notes: "" },
  { id: 36, name: "Noni - GA",                dept: "HR & Logistic", ext: "191", notes: "" },
  { id: 87, name: "Suryadi - GA",             dept: "HR & Logistic", ext: "189", notes: "" },
  { id: 34, name: "Susilo - GA",              dept: "HR & Logistic", ext: "162", notes: "" },

  // GESIT FOUNDATION
  { id: 44, name: "Kevin", dept: "Gesit Foundation", ext: "192", notes: "" },
  { id: 43, name: "Yuni",  dept: "Gesit Foundation", ext: "186", notes: "" },

  // BUSINESS DEVELOPMENT (label di gambar; internalnya Property)
  { id: 45, name: "Jave",            dept: "Business Development", ext: "201", notes: "" },
  { id: 52, name: "Corinna",         dept: "Business Development", ext: "302", notes: "" },
  { id: 121,name: "Greg",            dept: "Business Development", ext: "203", notes: "" },
  { id: 47, name: "Stefanini",       dept: "Business Development", ext: "203", notes: "" },
  { id: 48, name: "Elisanti",        dept: "Business Development", ext: "204", notes: "" },
  { id: 49, name: "Donny T.",        dept: "Business Development", ext: "204", notes: "" },
  { id: 50, name: "Petrus",          dept: "Business Development", ext: "206", notes: "" },
  { id: 51, name: "Neysa",           dept: "Business Development", ext: "207", notes: "" },
  { id: 122,name: "Katherine",       dept: "Business Development", ext: "208", notes: "" },

  // FINANCIAL INVESTMENT
  { id: 57, name: "Artika (Sec. to Jave)", dept: "Financial Investment", ext: "114", notes: "" },
  { id: 58, name: "Ita",                   dept: "Financial Investment", ext: "305", notes: "" },

  // TRADING
  { id: 53, name: "Suryadi Hertanto", dept: "Trading", ext: "301", notes: "" },
  { id: 54, name: "Hilaluddin",       dept: "Trading", ext: "303", notes: "" },
  { id: 55, name: "Harvey",           dept: "Trading", ext: "304", notes: "" },
  { id: 56, name: "Ayu",              dept: "Trading", ext: "306", notes: "" },
  { id: 59, name: "External",         dept: "Trading", ext: "116", notes: "" },

  // EXEC / SPECIAL
  { id: 113, name: "Jones", dept: "Deputy CEO & President", ext: "302", notes: "" },

  // COMMON FACILITIES – 27th FLOOR (dotted box Widya)
  { id: 90,  name: "Widya - Receptionist", dept: "Common Rooms", ext: "180/0", notes: "" },
  { id: 121, name: "Board Room 1",         dept: "Common Rooms", ext: "800", notes: "" },
  { id: 122, name: "Board Room 2",         dept: "Common Rooms", ext: "801", notes: "" },
  { id: 123, name: "Conference Room",      dept: "Common Rooms", ext: "802", notes: "" },
  { id: 124, name: "Meeting Room (Lobby)", dept: "Common Rooms", ext: "803", notes: "" },
  { id: 125, name: "Sofa Room",            dept: "Common Rooms", ext: "804", notes: "" },
  { id: 120, name: "Pantry",               dept: "Common Rooms", ext: "190", notes: "" },

  // Gesit Natural Resources – 26th FLOOR (nama & ext dari gambar)
  { id: 200, name: "Fendra",       dept: "Gesit Natural Resources", ext: "211", notes: "Vice President" },
  { id: 201, name: "Budhi",        dept: "Gesit Natural Resources", ext: "210", notes: "Vice President" },
  { id: 202, name: "Husni",        dept: "Gesit Natural Resources", ext: "212", notes: "Vice President" },
  { id: 203, name: "Yudha",        dept: "Gesit Natural Resources", ext: "209", notes: "Vice President" },

  { id: 204, name: "Dwi Suryati",  dept: "Gesit Natural Resources", ext: "—",   notes: "Office Management" },
  { id: 205, name: "Dimas",        dept: "Gesit Natural Resources", ext: "—",   notes: "Office Management" },

  { id: 206, name: "Puji",         dept: "Gesit Natural Resources", ext: "232", notes: "Information Technology" },

  { id: 94,  name: "Tunggul",      dept: "Gesit Natural Resources", ext: "215", notes: "Engineering" },
  { id: 95,  name: "Titis",        dept: "Gesit Natural Resources", ext: "215", notes: "Engineering (Shared Line)" },

  { id: 106, name: "Lydia",        dept: "Gesit Natural Resources", ext: "220", notes: "Project" },

  // HRGA – 26th FLOOR
  { id: 107, name: "Juni",         dept: "HRGA (26th Floor)", ext: "232", notes: "" },
  { id: 108, name: "Irsan",        dept: "HRGA (26th Floor)", ext: "232", notes: "Shared Line" },
  { id: 109, name: "Ayu (HRGA)",   dept: "HRGA (26th Floor)", ext: "230", notes: "" },
  { id: 110, name: "Aditya",       dept: "HRGA (26th Floor)", ext: "230", notes: "" },

  // BUSINESS UNIT – 26th FLOOR
  { id: 97,  name: "Aldri",        dept: "Business Unit (26th Floor)", ext: "220", notes: "" },
  { id: 98,  name: "Ravyiansyah",  dept: "Business Unit (26th Floor)", ext: "220", notes: "" },

  // COMMON FACILITIES – 26th FLOOR
  { id: 115, name: "Pantry",     dept: "Gesit Natural Resources", ext: "241", notes: "Common Area (26th Floor)" },
  { id: 116, name: "Operator 1", dept: "Gesit Natural Resources", ext: "200", notes: "Common Area (26th Floor)" },
  { id: 117, name: "Operator 2", dept: "Gesit Natural Resources", ext: "300", notes: "Common Area (26th Floor)" },
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
  const floor26Depts = [/Gesit Natural Resources/i, /26th Floor/i];
  if (floor26Depts.some((rx) => rx.test(dept))) return 26;
  return 27;
}

/* ===========================
   Small components
=========================== */
function ExtensionCard({ item }: { item: Extension }) {
  const initial = item.name.charAt(0).toUpperCase();
  const floor = getFloor(item.dept);
  const frameColor =
    floor === 27
      ? "border-indigo-200 ring-1 ring-indigo-50"
      : "border-emerald-200 ring-1 ring-emerald-50";
  const barColor = floor === 27 ? "bg-indigo-400" : "bg-emerald-400";

  return (
    <div
      className={classNames(
        "relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6 border",
        frameColor
      )}
    >
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
            <p className="text-sm text-gray-500 truncate" title={item.dept}>
              {item.dept}
            </p>
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

      <div
        className={classNames(
          "mt-3 text-xs font-medium text-center rounded-lg py-1",
          floor === 27 ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"
        )}
      >
        Located on {floor}th Floor
      </div>
    </div>
  );
}

/* ===========================
   Navbar
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
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="Gesit logo" className="h-8 w-auto" />
            <div className="flex flex-col">
              <h1 className="truncate text-2xl md:text-3xl font-extrabold text-gray-900">
                Office Extensions Directory <span className="text-indigo-600">(TGC)</span>
              </h1>
              <span className="text-xs text-gray-500">Last update: Oct 2025</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded border border-emerald-200 bg-emerald-50">
              26th Floor
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded border border-indigo-200 bg-indigo-50">
              27th Floor
            </span>
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
   Usage Notes (NOTE PENGGUNAAN)
=========================== */
function UsageNotes() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 mt-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 md:px-6 py-4 text-sm text-gray-800 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-300 bg-white text-xs font-semibold">
              i
            </span>
            <p className="font-semibold">
              Catatan penggunaan telepon (sesuai internal directory Oct 2025)
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 27th Floor */}
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500 mb-1">
              The City Tower 27th Floor (TGC)
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>The City Tower 27th Floor</li>
              <li>Jl. M.H. Thamrin no. 81, Jakarta – 10310</li>
              <li>Telp: 021 3101601 (Hunting)</li>
            </ul>
            <p className="mt-2 font-medium">Cara penggunaan:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>
                Pick up incoming call:{" "}
                <span className="font-mono font-semibold">#70</span>
              </li>
              <li>
                Extension call ke Lt. 26:{" "}
                <span className="font-mono font-semibold">## + Ext Lt. 26</span>
              </li>
              <li>
                Outgoing call:{" "}
                <span className="font-mono font-semibold">PIN + 9 + Phone No.</span>
              </li>
              <li>
                International call:{" "}
                <span className="font-mono font-semibold">
                  PIN + 9 + 01017 + Country + Phone No.
                </span>
              </li>
            </ul>
          </div>

          {/* 26th Floor */}
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500 mb-1">
              The City Tower 26th Floor (Gesit Natural Resources)
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>The City Tower 26th Floor</li>
              <li>Jl. M.H. Thamrin no. 81, Jakarta – 10310</li>
              <li>Telp: 021 23599441 (Hunting)</li>
            </ul>
            <p className="mt-2 font-medium">Cara penggunaan:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>
                Outgoing call:{" "}
                <span className="font-mono font-semibold">
                  81** + PIN + Phone No.
                </span>
              </li>
              <li>
                Extension call ke Lt. 27:{" "}
                <span className="font-mono font-semibold">
                  88** + PIN + Ext Lt. 27
                </span>
              </li>
              <li>
                Pick up incoming:{" "}
                <span className="font-mono font-semibold">
                  #41 + No. Ext
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===========================
   Main component
=========================== */
export default function OfficeExtensionsDirectory() {
  const [query, setQuery] = useState("");
  const [floorFilter, setFloorFilter] = useState<"All" | 26 | 27>("All");

  const sorted = useMemo(
    () => [...initialExtensions].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

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
      <Navbar
        query={query}
        onChange={onChange}
        floorFilter={floorFilter}
        setFloorFilter={setFloorFilter}
      />

      {/* NOTE PENGGUNAAN SESUAI GAMBAR */}
      <UsageNotes />

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
            <p className="text-sm text-gray-500 mt-1">
              Try another keyword or clear the floor filter.
            </p>
          </div>
        )}
      </div>

      <footer className="relative text-center text-sm text-gray-600 py-8 border-t border-gray-200 bg-white/80">
        <div className="absolute inset-x-0 -top-px h-1 bg-gradient-to-r from-emerald-400 via-slate-200 to-indigo-400" />
        <div className="container mx-auto px-4 flex items-center justify-center gap-3">
          <p>
            © {new Date().getFullYear()} IT Department — The Gesit Companies · Maintained by Rudi
            Siarudin
          </p>
        </div>
      </footer>
    </main>
  );
}
