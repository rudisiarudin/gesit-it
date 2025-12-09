'use client';

import { Cloud, Server, Monitor, HardHat, Camera, Wifi } from 'lucide-react';

// --- Interface Data Node (untuk Diagram) ---
interface SchemaNodeProps {
  name: string;
  type: string;
  ip: string;
  description: string;
  icon: React.ReactNode;
  color: string; // Warna untuk border/background node
}

// --- Komponen Individual Node ---
const SchemaNode: React.FC<SchemaNodeProps> = ({ name, type, ip, description, icon, color }) => (
  <div className={`p-3 rounded-xl shadow-md border-t-4 ${color} bg-white text-center w-40 flex flex-col items-center justify-center`}>
    <div className={`p-2 rounded-full mb-1 ${color} bg-opacity-10`}>
        {icon}
    </div>
    <div className="text-sm font-semibold text-slate-800">{name}</div>
    <div className="text-xs text-gray-500 mb-1">{type}</div>
    {ip && <div className="text-xs font-mono text-gray-700">{ip}</div>}
    {description && <div className="text-[10px] text-gray-400 mt-1">{description}</div>}
  </div>
);

// --- Komponen Utama Diagram ---
export default function NetworkSchemaView() {
  return (
    <div className="flex flex-col items-center p-8 bg-gray-50 rounded-xl min-h-[600px] border border-dashed">
      
      {/* 1. LAYER CLOUD (Tertinggi) */}
      <div className="mb-4">
        <SchemaNode
          name="ISP Cloud"
          type="Public Gateway"
          ip=""
          description="Internet Access"
          icon={<Cloud size={20} />}
          color="border-indigo-500"
        />
      </div>

      {/* Garis Penghubung Cloud ke Gateway */}
      <div className="w-px h-8 bg-gray-400 border-dashed mb-4" />

      {/* 2. LAYER GATEWAY (MikroTik) */}
      <div className="relative mb-8">
        <SchemaNode
          name="MikroTik RB1100AHx4"
          type="Patch Gateway"
          ip="192.168.88.1"
          description="Main Router & Firewall"
          icon={<Server size={20} />}
          color="border-blue-500"
        />
        {/* Label di garis penghubung */}
        <span className="absolute -left-10 top-1/2 transform -translate-y-1/2 text-[10px] text-blue-500 font-semibold">WAN</span>
      </div>

      {/* Garis Penghubung Gateway ke Distribution */}
      <div className="w-px h-8 bg-gray-400 mb-4" />

      {/* 3. LAYER DISTRIBUTION */}
      <div className="relative mb-8">
        <SchemaNode
          name="H3C Access Switch"
          type="L3/L2 Distribution"
          ip="192.168.1.2"
          description="Floor 1 Network Main Switch"
          icon={<Server size={20} />}
          color="border-green-500"
        />
        {/* Label di garis penghubung */}
        <span className="absolute -right-10 top-1/2 transform -translate-y-1/2 text-[10px] text-green-500 font-semibold">UPLINK</span>
      </div>

      {/* 4. LAYER ACCESS (Cabang ke bawah) */}
      <div className="flex justify-between w-full max-w-4xl pt-4">
        
        {/* KIRI: Office LAN */}
        <div className="flex flex-col items-center relative pr-10">
          <div className="absolute top-0 w-px h-4 bg-gray-400" /> {/* Garis vertikal ke Distribution */}
          <div className="absolute top-4 w-[150px] h-px bg-gray-400 -left-16" /> {/* Garis horizontal */}
          
          <span className="text-[10px] text-gray-500 font-semibold mb-2">OFFICE LAN</span>

          <SchemaNode
            name="HP V1910-48G"
            type="L2 User Distribution"
            ip="192.168.0.2"
            description="Office User Ports"
            icon={<Monitor size={20} />}
            color="border-yellow-600"
          />

          <div className="flex justify-around w-full mt-4">
            <SchemaNode
              name="PCs/Workstations"
              type="End Devices"
              ip=""
              description="User Terminals"
              icon={<Monitor size={16} />}
              color="border-gray-500"
            />
            <SchemaNode
              name="Printers/Scanners"
              type="End Devices"
              ip=""
              description="Shared Office Devices"
              icon={<HardHat size={16} />}
              color="border-gray-500"
            />
          </div>
        </div>

        {/* TENGAH: Surveillance */}
        <div className="flex flex-col items-center relative">
          <div className="absolute top-0 w-px h-4 bg-gray-400" /> {/* Garis vertikal ke Distribution */}
          
          <span className="text-[10px] text-gray-500 font-semibold mb-2">SURVEILLANCE</span>

          <SchemaNode
            name="NVR System"
            type="Network Video Recorder"
            ip="192.168.20.10"
            description="IP Cameras Recording"
            icon={<Camera size={20} />}
            color="border-purple-600"
          />
          <div className="w-px h-4 bg-gray-400 mt-4" />
          <SchemaNode
            name="DVR System"
            type="Analog/IP Combo"
            ip=""
            description="Legacy & Bullet Cams"
            icon={<Camera size={20} />}
            color="border-purple-600"
          />
        </div>

        {/* KANAN: Wireless Access */}
        <div className="flex flex-col items-center relative pl-10">
          <div className="absolute top-0 w-px h-4 bg-gray-400" /> {/* Garis vertikal ke Distribution */}
          <div className="absolute top-4 w-[150px] h-px bg-gray-400 -right-16" /> {/* Garis horizontal */}

          <span className="text-[10px] text-gray-500 font-semibold mb-2">WIRELESS</span>

          <SchemaNode
            name="Access Points"
            type="L2 Radio Access"
            ip=""
            description="Office and Public WiFi"
            icon={<Wifi size={20} />}
            color="border-teal-500"
          />
          <div className="mt-4 text-xs text-gray-500 border border-dashed p-2 rounded-lg">
            PoE-Powered <br/> (Scalable Qty)
          </div>
        </div>
      </div>
    </div>
  );
}
