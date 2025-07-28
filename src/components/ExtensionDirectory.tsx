// components/ExtensionDirectory.tsx
"use client";
import { useEffect, useState } from "react";

export default function ExtensionDirectory() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dept, setDept] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const filtered = data.filter((item) => {
    const keyword = search.toLowerCase();
    const nameMatch = (item["Nama User"] || "").toLowerCase().includes(keyword);
    const deptMatch = (item["Dept"] || "").toLowerCase().includes(keyword);
    const statusMatch = status === "" || (item["Status"] || "").toLowerCase() === status;
    const deptFilterMatch = dept === "" || item["Dept"] === dept;
    return (nameMatch || deptMatch) && statusMatch && deptFilterMatch;
  });

  useEffect(() => {
    fetch("/data/Extension.json")
      .then((res) => res.json())
      .then((raw) => {
        const cleaned = raw
          .filter((d) => d["Nama User"] && d["Extension Code"])
          .sort((a, b) => parseInt(a["Extension Code"]) - parseInt(b["Extension Code"]));
        setData(cleaned);
      });
  }, []);

  const departments = [...new Set(data.map((d) => d["Dept"]).filter(Boolean))].sort();

  return (
    <div className="w-full px-6 py-6">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">TGC Internal Directory</h1>
      </div>

      <div className="flex flex-wrap justify-end gap-4 mb-4">
        <select onChange={(e) => setDept(e.target.value)} className="border rounded px-2 py-1 text-sm shadow-sm">
          <option value="">Semua Departemen</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select onChange={(e) => setStatus(e.target.value)} className="border rounded px-2 py-1 text-sm shadow-sm">
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="idle">Idle</option>
        </select>
        <button onClick={() => setShowModal(true)} className="text-gray-600 hover:text-gray-800 text-2xl">🔍</button>
      </div>

      <div className={`${isSearching ? "flex flex-wrap justify-center" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"} gap-4 transition-all`}>
        {filtered.map((item, i) => (
          <div key={i} className={`card border rounded shadow-sm text-sm p-3 bg-white space-y-1 ${isSearching ? "w-[340px]" : ""}`}>
            <div className="absolute top-1 right-1">
              <span className={`status-badge ${item["Status"] === "Aktif" ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"} text-xs px-2 py-0.5 rounded`}>
                {item["Status"]}
              </span>
            </div>
            <div className="name-one-line font-semibold mt-5">{item["Nama User"]}</div>
            <div className="dept-text text-gray-500">{item["Dept"]}</div>
            <div className="ext text-right text-indigo-700 text-lg font-bold">Ext. {item["Extension Code"]}</div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg scale-100 opacity-100 transition">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Cari</h2>
              <button onClick={() => { setShowModal(false); setSearch(""); setIsSearching(false); }} className="text-xl text-gray-600 hover:text-gray-800">&times;</button>
            </div>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setIsSearching(e.target.value.trim() !== ""); }}
              placeholder="Nama atau Departemen..."
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
