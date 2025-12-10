'use client';

import React from 'react';
import { X, Network, Server, Wifi, Video, Printer, Smartphone, Monitor, Square, Phone, PhoneCall } from 'lucide-react';
import { SwitchPort, DeviceType, PortStatus } from '../types';

interface PortDetailModalProps {
  port: SwitchPort | null;
  onClose: () => void;
  switchName: string;
}

const getDeviceIcon = (type: DeviceType) => {
  switch (type) {
    case DeviceType.AP: return <Wifi className="text-blue-500" />;
    case DeviceType.CCTV: return <Video className="text-purple-500" />;
    case DeviceType.PRINTER: return <Printer className="text-orange-500" />;
    case DeviceType.IP_PHONE: return <Smartphone className="text-green-500" />;
    case DeviceType.ANALOG_PHONE: return <Phone className="text-green-600" />; // Old school phone
    case DeviceType.SERVER: return <Server className="text-indigo-600" />;
    case DeviceType.PC: return <Monitor className="text-slate-600" />;
    case DeviceType.FACEPLATE: return <Square className="text-yellow-600" />; // Faceplate Icon
    case DeviceType.PABX: return <PhoneCall className="text-blue-800" />;
    default: return <Network className="text-gray-400" />;
  }
};

const getStatusColor = (status: PortStatus) => {
  switch (status) {
    case PortStatus.ACTIVE: return 'bg-green-100 text-green-700 border-green-200';
    case PortStatus.IDLE: return 'bg-red-50 text-red-600 border-red-200';
    case PortStatus.ERROR: return 'bg-orange-100 text-orange-700 border-orange-200';
    case PortStatus.DISABLED: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

export const PortDetailModal: React.FC<PortDetailModalProps> = ({ port, onClose, switchName }) => {
  if (!port) return null;

  // Detect which device type view we need
  const isLSA = switchName.includes('LSA');
  const isVoicePanel = switchName.includes('Faceplate') || switchName.includes('Voice Panel');
  const isTelephony = isLSA || isVoicePanel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
                {isTelephony ? `Connection Detail: ${port.patchPanelPort || 'Port ' + port.portNumber}` : `Port ${port.portNumber} Details`}
            </h3>
            <p className="text-xs text-gray-500">{switchName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          
          {/* Main Status Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 rounded-full bg-slate-50 border border-slate-100`}>
              {getDeviceIcon(port.deviceType)}
            </div>
            <div>
              <p className="text-sm text-gray-500">Connected Device</p>
              <h4 className="text-xl font-bold text-gray-900">
                {port.deviceConnected || "No Device"}
              </h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1 ${getStatusColor(port.status)}`}>
                {port.status}
              </span>
            </div>
          </div>

          {isTelephony ? (
              // === TELEPHONY WIRING FLOW (LSA or Voice Panel) ===
              <div className="space-y-6">
                  <h5 className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-2">Telephony Wiring Path</h5>
                  
                  <div className="relative pl-6 border-l-2 border-gray-200 space-y-8">
                      {/* 1. SOURCE: PABX (or LSA if viewing Voice Panel) */}
                      <div className="relative">
                          <div className="absolute -left-[33px] top-0 bg-blue-100 p-1.5 rounded-full border border-blue-200">
                              <PhoneCall size={16} className="text-blue-700" />
                          </div>
                          <div>
                              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">Source</p>
                              {isLSA ? (
                                <>
                                    <p className="font-semibold text-gray-800">PABX System</p>
                                    <p className="text-sm font-mono text-gray-500">{port.patchPanelPort}</p>
                                </>
                              ) : (
                                <>
                                    <p className="font-semibold text-gray-800">MDF LSA Block</p>
                                    <p className="text-sm font-mono text-gray-500">{port.macAddress || 'Pair ' + port.portNumber}</p>
                                </>
                              )}
                          </div>
                      </div>

                      {/* 2. MIDDLE: The Device being viewed */}
                      <div className="relative">
                           <div className="absolute -left-[33px] top-0 bg-yellow-100 p-1.5 rounded-full border border-yellow-200">
                              {isLSA ? <Server size={16} className="text-yellow-700" /> : <Square size={16} className="text-yellow-700" />}
                          </div>
                          <div>
                              <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-0.5">Current Point</p>
                              {isLSA ? (
                                  <>
                                    <p className="font-semibold text-gray-800">LSA Module {Math.ceil(port.portNumber/10)}</p>
                                    <p className="text-sm text-gray-500">Pair {port.portNumber}</p>
                                  </>
                              ) : (
                                  <>
                                    <p className="font-semibold text-gray-800">Voice Panel</p>
                                    <p className="text-sm font-mono text-gray-500">{port.patchPanelPort}</p>
                                  </>
                              )}
                          </div>
                      </div>

                      {/* 3. DESTINATION: Faceplate or Phone */}
                      <div className="relative">
                          <div className="absolute -left-[33px] top-0 bg-green-100 p-1.5 rounded-full border border-green-200">
                              {isLSA ? <Square size={16} className="text-green-700" /> : <Phone size={16} className="text-green-700" />}
                          </div>
                          <div>
                              <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-0.5">Destination</p>
                              <p className="font-semibold text-gray-800">{port.deviceConnected || 'Unknown'}</p>
                              {port.cableLength && <p className="text-xs text-gray-400 mt-1">Distance: {port.cableLength}</p>}
                          </div>
                      </div>
                  </div>
              </div>
          ) : (
              // === STANDARD DATA SWITCH VIEW ===
              <>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Device Type</p>
                    <p className="font-semibold text-gray-800">{port.deviceType}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">VLAN ID</p>
                    <p className="font-semibold text-gray-800">{port.vlan || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">IP Address</p>
                    <p className="font-mono text-sm font-semibold text-gray-800">{port.ipAddress || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">MAC Address</p>
                    <p className="font-mono text-sm font-semibold text-gray-800">{port.macAddress || '-'}</p>
                    </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                    <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Network size={16} /> Physical Wiring
                    </h5>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Patch Panel / Block</span>
                            <span className="font-mono font-medium text-gray-800">{port.patchPanelPort}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Cable Length</span>
                            <span className="font-medium text-gray-800">{port.cableLength || 'N/A'}</span>
                        </div>
                        {port.poeConsumption ? (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">PoE Usage</span>
                                <span className="font-medium text-green-600">{port.poeConsumption} W</span>
                            </div>
                        ) : null}
                    </div>
                </div>
              </>
          )}
          
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Close
          </button>
          <button className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
            {isTelephony ? 'Edit Circuit' : 'Edit Config'}
          </button>
        </div>
      </div>
    </div>
  );
};
