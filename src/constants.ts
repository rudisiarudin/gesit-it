import { NetworkSwitch, PortStatus, DeviceType, SwitchPort } from './types';

// Specific configuration for MikroTik RB1100AHx4
const generateMikrotikPorts = (): SwitchPort[] => {
  return Array.from({ length: 13 }, (_, i) => {
    const num = i + 1;
    let status = PortStatus.IDLE;
    let deviceName = '';
    let deviceType = DeviceType.UNKNOWN;
    let vlan = undefined;
    let uplinkDeviceId = undefined;

    // Mapping based on screenshot provided logic
    if (num === 2) {
        status = PortStatus.ACTIVE;
        deviceName = 'CBN ISP (ether2)';
        deviceType = DeviceType.ROUTER; // ISP Gateway
    } else if (num === 3) {
        status = PortStatus.ACTIVE;
        deviceName = 'LAN Distribution (ether3)';
        deviceType = DeviceType.UPLINK;
        uplinkDeviceId = 'sw-h3c-01'; // Connects to H3C
        vlan = 10;
    } else if (num === 4) {
        status = PortStatus.ACTIVE;
        deviceName = 'LAN Office (ether4)';
        deviceType = DeviceType.UPLINK;
        uplinkDeviceId = 'sw-hp-01'; // Connects to HP
        vlan = 20;
    } else if (num === 5) {
        status = PortStatus.ACTIVE;
        deviceName = 'Modem TP-Link (ether5)';
        deviceType = DeviceType.AP;
    }

    return {
        id: `mk-p-${num}`,
        portNumber: num,
        status: status,
        deviceConnected: status === PortStatus.ACTIVE ? deviceName : undefined,
        deviceType: deviceType,
        vlan: vlan,
        cableLength: status === PortStatus.ACTIVE ? '1m' : undefined,
        patchPanelPort: `Direct-Connect`,
        poeConsumption: 0,
        ipAddress: status === PortStatus.ACTIVE ? `192.168.88.${num}` : undefined,
        macAddress: `D4:CA:6D:E1:5F:${num.toString(16).padStart(2, '0').toUpperCase()}`,
        uplinkDeviceId: uplinkDeviceId
    };
  });
};

// Configuration for H3C Switch S1850-28P
const generateH3CPorts = (): SwitchPort[] => {
  return Array.from({ length: 28 }, (_, i) => {
    const num = i + 1;
    let status = PortStatus.IDLE;
    let deviceType = DeviceType.UNKNOWN;
    let deviceName = '';
    let ip = undefined;
    let vlan = undefined;
    let poe = 0;
    let cableLength = undefined;
    let uplinkDeviceId = undefined;

    // Ports 1-8: Access Points
    if (num >= 1 && num <= 8) {
        status = PortStatus.ACTIVE;
        deviceType = DeviceType.AP;
        deviceName = `AP-Floor1-${num.toString().padStart(2, '0')}`;
        ip = `192.168.1.${200 + num}`; // 201 to 208
        vlan = 100;
        poe = Math.floor(Math.random() * 8) + 7; // 7-15W
        cableLength = `${Math.floor(Math.random() * 20) + 10}m`;
    }
    
    // Simulate some other random activity on ports 9-24
    if (num > 8 && num <= 24 && Math.random() > 0.7) {
        status = PortStatus.ACTIVE;
        deviceType = DeviceType.PC;
        deviceName = `PC-User-${num}`;
        ip = `192.168.1.${num}`;
        vlan = 10;
        cableLength = '5m';
    }

    // SFP Uplink ports 25-28
    if (num === 25) {
        status = PortStatus.ACTIVE;
        deviceType = DeviceType.UPLINK;
        deviceName = "Uplink to Core";
        cableLength = 'Fiber';
        uplinkDeviceId = 'sw-mikrotik-01'; // Back to MikroTik
    }

    return {
      id: `h3c-p-${num}`,
      portNumber: num,
      status: status,
      deviceConnected: status === PortStatus.ACTIVE ? deviceName : undefined,
      deviceType: deviceType,
      vlan: vlan,
      cableLength: cableLength,
      patchPanelPort: num <= 24 ? `PP-H3C-A${num}` : 'Direct',
      poeConsumption: poe,
      ipAddress: ip,
      macAddress: status === PortStatus.ACTIVE ? `00:E0:FC:33:44:${num.toString(16).padStart(2, '0').toUpperCase()}` : undefined,
      uplinkDeviceId: uplinkDeviceId
    };
  });
};

// Configuration for HP V1910-48G JE009A
const generateHP1910Ports = (): SwitchPort[] => {
  // 48 RJ45 ports + 4 SFP ports = 52 ports total
  return Array.from({ length: 52 }, (_, i) => {
    const num = i + 1;
    let status = PortStatus.IDLE;
    let deviceType = DeviceType.UNKNOWN;
    let deviceName = '';
    let ip = undefined;
    let cable = undefined;
    let uplinkDeviceId = undefined;
    
    // Simulate Unmanaged usage (Plug & Play) on 192.168.0.x
    // Random active ports
    const isActive = Math.random() > 0.5;

    if (isActive) {
        status = PortStatus.ACTIVE;
        
        if (num >= 49) {
             // SFP Ports (Uplinks)
             deviceType = DeviceType.UPLINK;
             deviceName = `SFP-Uplink-${num-48}`;
             cable = "Fiber-OM3";
             ip = `192.168.0.${250 + (num-48)}`;
        } else {
             // Regular RJ45
             const r = Math.random();
             if (r > 0.6) {
                 deviceType = DeviceType.PC;
                 deviceName = `Workstation-${num}`;
             } else if (r > 0.4) {
                 deviceType = DeviceType.PRINTER;
                 deviceName = `Printer-Dept-${Math.floor(num/5)}`;
             } else {
                 deviceType = DeviceType.UNKNOWN;
                 deviceName = `Device-${num}`;
             }
             
             ip = `192.168.0.${10 + num}`;
             cable = "Cat5e";
        }
    }

    // Specific Override: Port 1 Uplink
    if (num === 1) {
        status = PortStatus.ACTIVE;
        deviceType = DeviceType.UPLINK;
        deviceName = "Gateway / Router";
        ip = "192.168.0.1";
        cable = "Cat6";
        uplinkDeviceId = 'sw-mikrotik-01'; // Back to MikroTik
    }

    return {
      id: `hp-1910-p-${num}`,
      portNumber: num,
      status: status,
      deviceConnected: status === PortStatus.ACTIVE ? deviceName : undefined,
      deviceType: deviceType,
      vlan: 1, // Unmanaged usually flat vlan 1
      cableLength: status === PortStatus.ACTIVE ? (cable || '10m') : undefined,
      patchPanelPort: num <= 48 ? `PP-Floor2-${num}` : 'N/A',
      poeConsumption: 0, // JE009A is non-PoE
      ipAddress: ip,
      macAddress: status === PortStatus.ACTIVE ? `3C:D9:2B:00:00:${num.toString(16).padStart(2, '0').toUpperCase()}` : undefined,
      uplinkDeviceId: uplinkDeviceId
    };
  });
};

// Configuration for LSA MDF (PABX -> LSA)
const generateLSAPorts = (): SwitchPort[] => {
  // 100 Pairs (10 Modules of 10)
  return Array.from({ length: 100 }, (_, i) => {
    const num = i + 1;
    // Simulate ~60% usage
    const isActive = Math.random() > 0.4;
    
    // MDF connects OUT to the Voice Panel
    return {
      id: `lsa-p-${num}`,
      portNumber: num,
      status: isActive ? PortStatus.ACTIVE : PortStatus.IDLE,
      
      // Connected to the Voice Panel
      deviceConnected: isActive ? `Voice Panel (COM2-${80 + num})` : undefined,
      deviceType: isActive ? DeviceType.FACEPLATE : DeviceType.UNKNOWN,
      
      vlan: undefined,
      cableLength: isActive ? `5m` : undefined,
      
      // The "Patch Panel Port" here refers to the PABX Extension Source
      patchPanelPort: `PABX-Ext-${200 + num}`,
      
      poeConsumption: 0,
      ipAddress: undefined,
      macAddress: isActive ? `LSA-Module-${Math.ceil(num/10)}` : undefined,
      
      // LOGICAL CONNECTION: LSA connects to VP
      uplinkDeviceId: isActive ? 'vp-01' : undefined
    };
  });
};

// Configuration for Rack Faceplate (LSA -> Phone)
const generateVoicePanelPorts = (): SwitchPort[] => {
    // 100 Ports corresponding to the LSA blocks
    return Array.from({ length: 100 }, (_, i) => {
      const num = i + 1;
      const isActive = Math.random() > 0.4;
      
      return {
        id: `vp-p-${num}`,
        portNumber: num,
        status: isActive ? PortStatus.ACTIVE : PortStatus.IDLE,
        
        // Connected to the Desk Phone
        deviceConnected: isActive ? `Analog Phone (Desk ${100 + num})` : undefined,
        deviceType: isActive ? DeviceType.ANALOG_PHONE : DeviceType.UNKNOWN,
        
        vlan: undefined,
        cableLength: isActive ? `${Math.floor(Math.random() * 30) + 5}m` : undefined,
        
        // The ID of this port on the panel
        patchPanelPort: `COM2-${80 + num}`,
        
        poeConsumption: 0,
        ipAddress: undefined,
        // Represents the LSA source pair
        macAddress: isActive ? `LSA Pair ${num}` : undefined,
        
        // LOGICAL CONNECTION: VP is fed by LSA
        uplinkDeviceId: isActive ? 'lsa-mdf-01' : undefined
      };
    });
  };

export const MOCK_SWITCHES: NetworkSwitch[] = [
  {
    id: 'sw-mikrotik-01',
    name: 'MikroTik RB1100AHx4',
    location: 'Main Server Room',
    rack: 'Rack Network',
    model: 'RB1100AHx4 Dude Edition',
    ip: '192.168.88.1',
    totalPorts: 13,
    uptime: '15d 2h 10m',
    ports: generateMikrotikPorts()
  },
  {
    id: 'sw-h3c-01',
    name: 'H3C Access Switch',
    location: 'Floor 1 Distribution',
    rack: 'Rack B1',
    model: 'H3C Switch S1850-28P',
    ip: '192.168.1.2',
    totalPorts: 28,
    uptime: '120d 5h 22m',
    ports: generateH3CPorts()
  },
  {
    id: 'sw-hp-01',
    name: 'HP Unmanaged Switch',
    location: 'Floor 2 Office',
    rack: 'Rack Wallmount',
    model: 'HP V1910-48G JE009A',
    ip: '192.168.0.2', // Management IP
    totalPorts: 52,
    uptime: '400d 12h 05m',
    ports: generateHP1910Ports()
  },
  {
    id: 'lsa-mdf-01',
    name: 'MDF LSA Telpon',
    location: 'Main Server Room',
    rack: 'Wall Frame A',
    model: 'LSA-PLUS MDF', // Keyword 'LSA' triggers LSA visualizer
    ip: 'N/A', 
    totalPorts: 100,
    uptime: 'N/A',
    ports: generateLSAPorts()
  },
  {
    id: 'vp-01',
    name: 'Rack Voice Panel',
    location: 'Main Server Room',
    rack: 'Rack Network',
    model: 'Rack Faceplate Panel', // Keyword 'Faceplate' triggers Voice Panel visualizer
    ip: 'N/A', 
    totalPorts: 100,
    uptime: 'N/A',
    ports: generateVoicePanelPorts()
  },
];

export const APP_NAME = "IT Gesit";
export const USER_NAME = "Rudi Si'arudin";
export const USER_ROLE = "Network Admin";
