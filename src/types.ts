import React from 'react';

export enum PortStatus {
  ACTIVE = 'ACTIVE', // Green
  IDLE = 'IDLE',     // Red/Gray
  ERROR = 'ERROR',   // Amber/Orange
  DISABLED = 'DISABLED' // Dark Gray
}

export enum DeviceType {
  PC = 'PC',
  SERVER = 'Server',
  PRINTER = 'Printer',
  AP = 'Access Point',
  CCTV = 'CCTV',
  IP_PHONE = 'IP Phone',
  ANALOG_PHONE = 'Analog Phone', // New
  PABX = 'PABX System',          // New
  ROUTER = 'Router',
  UPLINK = 'Uplink',
  UNKNOWN = 'Unknown',
  FACEPLATE = 'Faceplate Outlet'
}

export interface SwitchPort {
  id: string;
  portNumber: number;
  status: PortStatus;
  deviceConnected?: string; // Hostname or Device Name
  deviceType: DeviceType;
  macAddress?: string;
  ipAddress?: string;
  vlan?: number;
  cableLength?: string; // e.g., "15m"
  patchPanelPort?: string; // e.g., "PP-A-24"
  lastActivity?: string;
  poeConsumption?: number; // In Watts
  
  // New fields for Physical Topology Linking
  uplinkDeviceId?: string; // ID of the switch/router this port connects to
}

export interface NetworkSwitch {
  id: string;
  name: string;
  location: string;
  rack: string;
  model: string;
  ip: string;
  totalPorts: number;
  uptime: string;
  ports: SwitchPort[];
}

export interface DashboardStat {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string; // Tailwind bg class for icon container
  trend?: string; // e.g. "+5%"
}
