"use client";
import React, { useMemo, useState } from "react";
import { 
  Search, 
  Phone, 
  Building2, 
  Info, 
  PhoneOutgoing, 
  PhoneIncoming, 
  Globe, 
  LayoutGrid,
  MapPin,
  Users
} from "lucide-react";

/* ===========================
   Types
=========================== */
interface Extension {
  id: number;
  name: string;
  dept: string;
  ext: string;
  floor: 26 | 27;
  role?: string;
}

/* ===========================
   Data (Synced with Oct 2025 Image)
=========================== */
const DATA: Extension[] = [
  // --- BOARD OF COMMISSIONERS (27th) ---
  { id: 101, name: "JSB", dept: "Board of Commissioners", ext: "101", floor: 27 },
  { id: 102, name: "JSC", dept: "Board of Commissioners", ext: "102", floor: 27 },
  { id: 103, name: "MSA", dept: "Board of Commissioners", ext: "103", floor: 27 },
  { id: 104, name: "MSB", dept: "Board of Commissioners", ext: "104", floor: 27 },
  { id: 105, name: "MSC", dept: "Board of Commissioners", ext: "105", floor: 27 },
  { id: 106, name: "MSD", dept: "Board of Commissioners", ext: "106", floor: 27 },
  { id: 107, name: "MSA Bed Room", dept: "Board of Commissioners", ext: "107", floor: 27 },

  // --- DEPUTY CEO ---
  { id: 502, name: "Jones", dept: "Deputy CEO & President", ext: "502", floor: 27 },

  // --- PA & SECRETARY / SUPPORT (27th) ---
  { id: 111, name: "Asma", dept: "PA & Secretary", ext: "111", floor: 27 },
  { id: 112, name: "Intan", dept: "PA & Secretary", ext: "112", floor: 27 },
  { id: 113, name: "Dinny", dept: "PA & Secretary", ext: "113", floor: 27 },
  { id: 188, name: "Ety", dept: "PA & Secretary", ext: "188", floor: 27 },
  { id: 511, name: "Dwi", dept: "PA & Secretary", ext: "511", floor: 27 },

  // --- CORPORATE AFFAIRS (27th) ---
  { id: 130, name: "Peng Tjoan", dept: "Corporate Affair", ext: "130", floor: 27 },
  { id: 131, name: "Thomas", dept: "Corporate Affair", ext: "131", floor: 27 },
  { id: 181, name: "Yudha", dept: "Corporate Affair", ext: "181", floor: 27 },
  { id: 182, name: "Ruby", dept: "Corporate Affair", ext: "182", floor: 27 },

  // --- CORPORATE SECRETARY (27th) ---
  { id: 140, name: "Natalia", dept: "Corporate Secretary", ext: "140", floor: 27 },
  { id: 141, name: "Yohan", dept: "Corporate Secretary", ext: "141", floor: 27 },
  { id: 142, name: "Sylvia", dept: "Corporate Secretary", ext: "142", floor: 27 },
  { id: 143, name: "Desi", dept: "Corporate Secretary", ext: "143", floor: 27 },
  { id: 152, name: "Nancy", dept: "Corporate Secretary", ext: "152", floor: 27 },
  { id: 504, name: "Nike", dept: "Corporate Secretary", ext: "504", floor: 27 },

  // --- FINANCE & ACCOUNTING (27th) ---
  { id: 120, name: "Yayan", dept: "Finance & Accounting", ext: "120", floor: 27 },
  { id: 154, name: "Maradona", dept: "Finance & Accounting", ext: "154", floor: 27 },
  { id: 161, name: "Vanesha", dept: "Finance & Accounting", ext: "161", floor: 27 },
  { id: 167, name: "Stephanie Y.", dept: "Finance & Accounting", ext: "167", floor: 27 },
  { id: 122, name: "Merly", dept: "Finance & Accounting", ext: "122", floor: 27 },
  { id: 163, name: "Lisi", dept: "Finance & Accounting", ext: "163", floor: 27 },
  { id: 170, name: "Parawinata", dept: "Finance & Accounting", ext: "170", floor: 27 },
  { id: 171, name: "Novitasari", dept: "Finance & Accounting", ext: "171", floor: 27 },
  { id: 169, name: "Mian", dept: "Finance & Accounting", ext: "169", floor: 27 },
  { id: 168, name: "Evi", dept: "Finance & Accounting", ext: "168", floor: 27 },
  { id: 172, name: "Rama", dept: "Finance & Accounting", ext: "172", floor: 27 },
  { id: 173, name: "Winarti", dept: "Finance & Accounting", ext: "173", floor: 27 },

  // --- HR & LOGISTIC (27th) ---
  { id: 195, name: "Javier", dept: "HR & Logistic", ext: "195", floor: 27 },
  { id: 115, name: "Sarah", dept: "HR & Logistic", ext: "115", floor: 27, role: "Sec. to Javier" },
  { id: 198, name: "Rara", dept: "HR & Logistic", ext: "198", floor: 27 },
  { id: 185, name: "Resti", dept: "HR & Logistic", ext: "185", floor: 27, role: "HR" },
  { id: 187, name: "Nisa", dept: "HR & Logistic", ext: "187", floor: 27, role: "HR" },
  { id: 197, name: "Bendry", dept: "HR & Logistic", ext: "197", floor: 27, role: "IT" },
  { id: 196, name: "Rudi", dept: "HR & Logistic", ext: "196", floor: 27, role: "IT" },
  { id: 191, name: "Noni", dept: "HR & Logistic", ext: "191", floor: 27, role: "GA" },
  { id: 189, name: "Suryadi", dept: "HR & Logistic", ext: "189", floor: 27, role: "GA" },
  { id: 162, name: "Susilo", dept: "HR & Logistic", ext: "162", floor: 27, role: "GA" },

  // --- BUSINESS DEVELOPMENT (27th) ---
  { id: 201, name: "Jave", dept: "Business Development", ext: "201", floor: 27 },
  { id: 302, name: "Corinna", dept: "Business Development", ext: "302", floor: 27 },
  { id: 205, name: "Greg", dept: "Business Development", ext: "205", floor: 27 },
  { id: 203, name: "Stefanini", dept: "Business Development", ext: "203", floor: 27 },
  { id: 204, name: "Elisanti", dept: "Business Development", ext: "204", floor: 27 },
  { id: 202, name: "Donny T.", dept: "Business Development", ext: "202", floor: 27 },
  { id: 206, name: "Petrus", dept: "Business Development", ext: "206", floor: 27 },
  { id: 207, name: "Neysa", dept: "Business Development", ext: "207", floor: 27 },
  { id: 208, name: "Katherine", dept: "Business Development", ext: "208", floor: 27 },

  // --- FINANCIAL INVESTMENT (27th) ---
  { id: 114, name: "Artika", dept: "Financial Investment", ext: "114", floor: 27, role: "Sec. to Jave" },
  { id: 305, name: "Ita", dept: "Financial Investment", ext: "305", floor: 27 },

  // --- TRADING (27th) ---
  { id: 301, name: "Suryadi Hertanto", dept: "Trading", ext: "301", floor: 27 },
  { id: 303, name: "Hilaluddin", dept: "Trading", ext: "303", floor: 27 },
  { id: 304, name: "Harvey", dept: "Trading", ext: "304", floor: 27 },
  { id: 306, name: "Ayu", dept: "Trading", ext: "306", floor: 27 },
  { id: 116, name: "External", dept: "Trading", ext: "116", floor: 27 },

  // --- GESIT FOUNDATION (27th) ---
  { id: 192, name: "Kevin", dept: "Gesit Foundation", ext: "192", floor: 27 },
  { id: 186, name: "Yuni", dept: "Gesit Foundation", ext: "186", floor: 27 },

  // --- COMMON (27th) ---
  { id: 180, name: "Widya", dept: "Receptionist", ext: "180/0", floor: 27 },
  { id: 800, name: "Board Room 1", dept: "Common Areas", ext: "800", floor: 27 },
  { id: 801, name: "Board Room 2", dept: "Common Areas", ext: "801", floor: 27 },
  { id: 802, name: "Conference Room", dept: "Common Areas", ext: "802", floor: 27 },
  { id: 803, name: "Meeting Room (Lobby)", dept: "Common Areas", ext: "803", floor: 27 },
  { id: 805, name: "Sofa Room", dept: "Common Areas", ext: "805", floor: 27 },
  { id: 190, name: "Pantry", dept: "Common Areas", ext: "190", floor: 27 },

  // ===============================================
  // 26th Floor - Gesit Natural Resources
  // ===============================================
  
  // --- VP ---
  { id: 211, name: "Fendra", dept: "Vice President", ext: "211", floor: 26 },
  { id: 210, name: "Budhi", dept: "Vice President", ext: "210", floor: 26 },
  { id: 212, name: "Husni", dept: "Vice President", ext: "212", floor: 26 },
  { id: 209, name: "Yudha", dept: "Vice President", ext: "209", floor: 26 },

  // --- PERMIT & LICENSE (26th) ---
  { id: 236, name: "Rahmat Hidayat", dept: "Permit & License", ext: "236", floor: 26 },
  { id: 2400, name: "Novita Sitorus", dept: "Permit & License", ext: "240", floor: 26 },
  { id: 2401, name: "Diana", dept: "Permit & License", ext: "240", floor: 26 },
  { id: 2361, name: "Afirlinka", dept: "Permit & License", ext: "236", floor: 26 },
  { id: 2402, name: "Marissa", dept: "Permit & License", ext: "240", floor: 26 },
  { id: 2403, name: "Ezra", dept: "Permit & License", ext: "240", floor: 26 },
  { id: 2404, name: "Adnan", dept: "Permit & License", ext: "240", floor: 26 },
  { id: 2405, name: "Asep Zaelani", dept: "Permit & License", ext: "240", floor: 26 },

  // --- FINANCE & ACCOUNTING (26th) ---
  { id: 228, name: "Afif", dept: "Finance & Accounting", ext: "228", floor: 26 },
  { id: 226, name: "Said", dept: "Finance & Accounting", ext: "226", floor: 26 },
  { id: 2281, name: "Hansdi", dept: "Finance & Accounting", ext: "228", floor: 26 },
  { id: 2261, name: "Pipin Syaripin", dept: "Finance & Accounting", ext: "226", floor: 26 },

  // --- PROCUREMENT (26th) ---
  { id: 223, name: "Yusup", dept: "Procurement", ext: "223", floor: 26 },
  { id: 2231, name: "Hadly", dept: "Procurement", ext: "223", floor: 26 },
  { id: 2232, name: "Andrias", dept: "Procurement", ext: "223", floor: 26 },

  // --- SALES / MARKETING (26th) ---
  { id: 2153, name: "Ryandhi", dept: "Sales / Marketing", ext: "215", floor: 26 },

  // --- IT (26th) ---
  { id: 2320, name: "Puji", dept: "Information Technology", ext: "232", floor: 26 },

  // --- ENGINEERING (26th) ---
  { id: 215, name: "Tunggul", dept: "Engineering", ext: "215", floor: 26 },
  { id: 2152, name: "Titis", dept: "Engineering", ext: "215", floor: 26 },

  // --- PROJECT (26th) ---
  { id: 220, name: "Lydia", dept: "Project", ext: "220", floor: 26 },

  // --- HRGA (26th) ---
  { id: 2321, name: "Juni", dept: "HRGA", ext: "232", floor: 26 },
  { id: 2322, name: "Irsan", dept: "HRGA", ext: "232", floor: 26 },
  { id: 230, name: "Ayu", dept: "HRGA", ext: "230", floor: 26 },
  { id: 2301, name: "Aditya", dept: "HRGA", ext: "230", floor: 26 },

  // --- BUSINESS UNIT (26th) ---
  { id: 2201, name: "Aldri", dept: "Business Unit", ext: "220", floor: 26 },
  { id: 2202, name: "Rayviansyah", dept: "Business Unit", ext: "220", floor: 26 },

  // --- RECEPTION (26th) ---
  { id: 200, name: "Receptionist", dept: "Front Desk", ext: "200", floor: 26 },
  { id: 300, name: "Operator", dept: "Front Desk", ext: "300", floor: 26 },
  { id: 2121, name: "Pantry", dept: "Common Areas", ext: "212", floor: 26 },
];

/* ===========================
   Components
=========================== */

// 1. Navbar
const Navbar = ({ 
  searchTerm, 
  setSearchTerm, 
  floorFilter, 
  setFloorFilter 
}: { 
  searchTerm: string, 
  setSearchTerm: (s: string) => void, 
  floorFilter: 'All' | 26 | 27, 
  setFloorFilter: (f: 'All' | 26 | 27) => void 
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Logo / Title */}
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-200">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">TGC Internal Directory</h1>
                <p className="text-xs text-slate-500 font-medium">Updated: Oct 2025</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-inner"
                placeholder="Search by name, department, or extension..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Floor Filter */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              {(['All', 27, 26] as const).map((floor) => (
                <button
                  key={floor}
                  onClick={() => setFloorFilter(floor)}
                  className={`
                    px-4 py-1.5 text-sm font-semibold rounded-md transition-all
                    ${floorFilter === floor 
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                  `}
                >
                  {floor === 'All' ? 'All Floors' : `${floor}th`}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

// 2. Instructions Panel (The "Notes" requested)
const InstructionPanel = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
      >
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-300" />
          <span className="font-semibold tracking-wide">Quick Dialing Guide</span>
        </div>
        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">{isOpen ? "Hide" : "Show"}</span>
      </button>

      {isOpen && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          
          {/* 27th Floor Card */}
          <div className="bg-white rounded-xl p-5 border-l-4 border-indigo-500 shadow-sm ring-1 ring-slate-200">
            <h3 className="flex items-center gap-2 text-indigo-700 font-bold mb-3 uppercase text-sm tracking-wider">
              <MapPin className="w-4 h-4" /> The City Tower 27th Floor (TGC)
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3 items-start">
                <PhoneIncoming className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                <span>
                  <strong>Pick up Incoming Call:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">#70</code>
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <PhoneOutgoing className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                <span>
                  <strong>Call to 26th Floor:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">##</code> + Ext
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <Globe className="w-4 h-4 mt-0.5 text-purple-500 shrink-0" />
                <span>
                  <strong>Outgoing Call:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">* *</code> + PIN + 9 + No.
                </span>
              </li>
              <li className="flex gap-3 items-start opacity-75">
                <Globe className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                <span>
                  <strong>International:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">* *</code> + PIN + 9 + 01017 + Country + No.
                </span>
              </li>
            </ul>
          </div>

          {/* 26th Floor Card */}
          <div className="bg-white rounded-xl p-5 border-l-4 border-emerald-500 shadow-sm ring-1 ring-slate-200">
            <h3 className="flex items-center gap-2 text-emerald-700 font-bold mb-3 uppercase text-sm tracking-wider">
              <MapPin className="w-4 h-4" /> Gesit Natural Resources (26th Floor)
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3 items-start">
                <PhoneIncoming className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                <span>
                  <strong>Pick up Incoming Call:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">#41</code> + Ext
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <PhoneOutgoing className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                <span>
                  <strong>Call to 27th Floor:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">88**</code> + PIN + Ext
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <Globe className="w-4 h-4 mt-0.5 text-purple-500 shrink-0" />
                <span>
                  <strong>Outgoing Call:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">81**</code> + PIN + No.
                </span>
              </li>
              <li className="flex gap-3 items-start opacity-75">
                <span className="w-4 h-4 shrink-0"></span>
                <span className="text-xs italic text-slate-400">
                  Note: PIN is required for external calls.
                </span>
              </li>
            </ul>
          </div>

        </div>
      )}
    </div>
  );
};

// 3. Extension Card
const ExtensionCard: React.FC<{ ext: Extension }> = ({ ext }) => {
  // Styles based on floor
  const is27 = ext.floor === 27;
  const accentColor = is27 ? "bg-indigo-600" : "bg-emerald-600";
  const lightAccent = is27 ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700";
  const ringColor = is27 ? "group-hover:ring-indigo-200" : "group-hover:ring-emerald-200";

  return (
    <div className={`
      group relative bg-white rounded-2xl p-5 shadow-sm border border-slate-100 
      transition-all duration-300 hover:shadow-md hover:-translate-y-1 ring-2 ring-transparent ${ringColor}
    `}>
      <div className="flex justify-between items-start gap-3">
        
        {/* Avatar Placeholder */}
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm
          ${accentColor}
        `}>
          {ext.name.charAt(0).toUpperCase()}
        </div>

        {/* Extension Number Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full text-white shadow-sm">
          <Phone className="w-3.5 h-3.5" />
          <span className="font-mono text-lg font-bold tracking-wide">{ext.ext}</span>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-bold text-slate-900 truncate pr-2">{ext.name}</h3>
        <p className="text-sm text-slate-500 font-medium truncate">{ext.dept}</p>
        {ext.role && (
           <p className="text-xs text-slate-400 mt-1 italic">{ext.role}</p>
        )}
      </div>

      <div className={`mt-4 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${lightAccent}`}>
        <Building2 className="w-3 h-3 mr-1.5" />
        {ext.floor}th Floor
      </div>
    </div>
  );
};

// 4. Main App Component
export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [floorFilter, setFloorFilter] = useState<'All' | 26 | 27>('All');

  const filteredExtensions = useMemo(() => {
    return DATA.filter((item) => {
      // 1. Check Floor
      if (floorFilter !== 'All' && item.floor !== floorFilter) return false;

      // 2. Check Search
      const searchLower = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.dept.toLowerCase().includes(searchLower) ||
        item.ext.includes(searchLower) ||
        (item.role && item.role.toLowerCase().includes(searchLower))
      );
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm, floorFilter]);

  return (
    <div className="min-h-screen flex flex-col pb-10">
      <Navbar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        floorFilter={floorFilter}
        setFloorFilter={setFloorFilter}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        
        <InstructionPanel />

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-slate-400" />
            Directory Listings
          </h2>
          <span className="text-sm bg-slate-200 text-slate-600 px-2 py-1 rounded-md font-medium">
            {filteredExtensions.length} results
          </span>
        </div>

        {/* Grid */}
        {filteredExtensions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExtensions.map((ext) => (
              <ExtensionCard key={`${ext.id}-${ext.ext}`} ext={ext} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No extensions found</h3>
            <p className="text-slate-500">Try adjusting your search or floor filter.</p>
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-slate-200 pt-8 text-center">
        <p className="text-slate-500 text-sm">
          &copy; 2025 The Gesit Companies. Internal Use Only.
        </p>
      </footer>
    </div>
  );
}
