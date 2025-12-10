'use client';

import React from 'react';
import { NetworkSwitch, SwitchPort, PortStatus, DeviceType } from '../types';
import { Video } from 'lucide-react';

interface SwitchVisualizerProps {
  switchDetails: NetworkSwitch;
  onPortClick: (port: SwitchPort) => void;
}

export const SwitchVisualizer: React.FC<SwitchVisualizerProps> = ({ switchDetails, onPortClick }) => {
  const isMikrotik = switchDetails.model.includes('RB1100') || switchDetails.model.includes('MikroTik');
  const isHP = switchDetails.model.includes('HP') || switchDetails.model.includes('V1910');
  const isLSA = switchDetails.model.includes('LSA');
  const isVoicePanel = switchDetails.model.includes('Faceplate') || switchDetails.model.includes('Voice Panel');

  if (isMikrotik) {
    return <MikrotikChassis switchDetails={switchDetails} onPortClick={onPortClick} />;
  }
  
  if (isHP) {
    return <HPChassis switchDetails={switchDetails} onPortClick={onPortClick} />;
  }
  
  if (isLSA) {
    return <LSAChassis switchDetails={switchDetails} onPortClick={onPortClick} />;
  }

  if (isVoicePanel) {
    return <VoicePanelChassis switchDetails={switchDetails} onPortClick={onPortClick} />;
  }
  
  return <StandardChassis switchDetails={switchDetails} onPortClick={onPortClick} />;
};

// ==========================================
// MIKROTIK RENDERER (Single Row, Silver)
// ==========================================
const MikrotikChassis: React.FC<SwitchVisualizerProps> = ({ switchDetails, onPortClick }) => {
    const ports = switchDetails.ports.sort((a, b) => a.portNumber - b.portNumber);

    // Grouping based on RB1100AHx4 layout: 1-5, 6-10, 11-13
    const group1 = ports.filter(p => p.portNumber >= 1 && p.portNumber <= 5);
    const group2 = ports.filter(p => p.portNumber >= 6 && p.portNumber <= 10);
    const group3 = ports.filter(p => p.portNumber >= 11 && p.portNumber <= 13);

    return (
        <div className="w-full overflow-x-auto pb-4">
             {/* Silver Chassis */}
            <div className="min-w-[800px] bg-neutral-300 rounded-sm p-1 shadow-md border border-neutral-400 relative">
                
                {/* Rack Ears */}
                <div className="absolute top-0 bottom-0 -left-3 w-3 bg-neutral-300 border-r border-neutral-400 rounded-l-sm flex flex-col justify-between py-2 items-center">
                    <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full"></div>
                </div>
                <div className="absolute top-0 bottom-0 -right-3 w-3 bg-neutral-300 border-l border-neutral-400 rounded-r-sm flex flex-col justify-between py-2 items-center">
                    <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full"></div>
                </div>

                {/* Ventilation Grid (Top Half) */}
                <div className="h-8 w-full border-b border-neutral-400/30 flex items-center px-4 overflow-hidden gap-1 mb-2">
                     {/* Generating pattern of holes */}
                     {Array.from({ length: 90 }).map((_, i) => (
                        <div key={i} className="w-1 h-3 bg-neutral-800/20 rounded-[1px]"></div>
                     ))}
                </div>

                {/* Content Area */}
                <div className="flex justify-between items-end px-6 pb-2">
                    
                    {/* Ports Container */}
                    <div className="flex gap-8 items-end">
                        {/* Group 1: 1-5 */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] font-bold text-neutral-600 tracking-wider">ETH 1-5</span>
                            <div className="flex gap-1.5 bg-white/50 p-1 rounded border border-neutral-300 shadow-inner">
                                {group1.map(port => (
                                    <SinglePort key={port.id} port={port} onClick={() => onPortClick(port)} />
                                ))}
                            </div>
                        </div>

                        {/* Group 2: 6-10 */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] font-bold text-neutral-600 tracking-wider">ETH 6-10</span>
                            <div className="flex gap-1.5 bg-white/50 p-1 rounded border border-neutral-300 shadow-inner">
                                {group2.map(port => (
                                    <SinglePort key={port.id} port={port} onClick={() => onPortClick(port)} />
                                ))}
                            </div>
                        </div>

                        {/* Group 3: 11-13 */}
                        <div className="flex flex-col items-center gap-1">
                             <span className="text-[9px] font-bold text-neutral-600 tracking-wider">ETH 11-13</span>
                             <div className="flex gap-1.5 bg-white/50 p-1 rounded border border-neutral-300 shadow-inner">
                                {group3.map(port => (
                                    <SinglePort key={port.id} port={port} onClick={() => onPortClick(port)} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Branding & Console */}
                    <div className="flex flex-col items-end gap-2 ml-auto">
                         <div className="text-right">
                             <div className="text-[9px] font-bold text-neutral-500">Dude Edition</div>
                             <div className="font-bold text-neutral-800 italic text-lg leading-none tracking-tight">
                                Mikro<span className="text-neutral-600">Tik</span>
                             </div>
                             <div className="font-bold text-neutral-900 text-sm">RouterBOARD <span className="text-neutral-600">1100AHx4</span></div>
                         </div>
                         <div className="flex items-center gap-2 mt-1">
                             <div className="flex flex-col items-center">
                                 <div className="w-8 h-4 border border-neutral-400 bg-neutral-200 rounded-sm"></div>
                                 <span className="text-[8px] text-neutral-500">SERIAL</span>
                             </div>
                             <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm"></div>
                             <div className="w-1 h-1 rounded-full bg-neutral-400"></div>
                         </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// ==========================================
// HP CHASSIS RENDERER (Groups of 12 + SFP)
// ==========================================
const HPChassis: React.FC<SwitchVisualizerProps> = ({ switchDetails, onPortClick }) => {
    const ports = switchDetails.ports.sort((a, b) => a.portNumber - b.portNumber);

    const block1 = ports.filter(p => p.portNumber >= 1 && p.portNumber <= 12);
    const block2 = ports.filter(p => p.portNumber >= 13 && p.portNumber <= 24);
    const block3 = ports.filter(p => p.portNumber >= 25 && p.portNumber <= 36);
    const block4 = ports.filter(p => p.portNumber >= 37 && p.portNumber <= 48);
    const blockSFP = ports.filter(p => p.portNumber >= 49);

    const renderBlock = (blockPorts: SwitchPort[], isSFP = false) => {
        const oddPorts = blockPorts.filter(p => p.portNumber % 2 !== 0);
        const evenPorts = blockPorts.filter(p => p.portNumber % 2 === 0);
        const columns = Math.ceil(blockPorts.length / 2);

        return (
             <div className="flex gap-px bg-slate-800 p-0.5 rounded border border-slate-600">
                {Array.from({ length: columns }).map((_, colIndex) => {
                     const topPort = oddPorts[colIndex];
                     const bottomPort = evenPorts[colIndex];
                     return (
                         <div key={colIndex} className="flex flex-col gap-1 px-0.5">
                             {topPort && <DualRowPort port={topPort} onClick={() => onPortClick(topPort)} position="top" isSFP={isSFP} />}
                             {bottomPort && <DualRowPort port={bottomPort} onClick={() => onPortClick(bottomPort)} position="bottom" isSFP={isSFP} />}
                         </div>
                     );
                })}
             </div>
        )
    };

    return (
        <div className="w-full overflow-x-auto pb-4">
             {/* Dark Grey Chassis */}
            <div className="min-w-[900px] bg-slate-700 rounded-sm p-2 shadow-xl border border-slate-600 relative">
                 {/* Rack Ears */}
                <div className="absolute top-0 bottom-0 -left-3 w-3 bg-slate-700 border-r border-slate-800 rounded-l-sm flex flex-col justify-between py-2 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                </div>
                <div className="absolute top-0 bottom-0 -right-3 w-3 bg-slate-700 border-l border-slate-800 rounded-r-sm flex flex-col justify-between py-2 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                </div>

                {/* Faceplate Label */}
                <div className="flex justify-between items-center mb-2 px-4 border-b border-slate-600/50 pb-1">
                    <div className="text-xs font-bold text-slate-300">HP V1910-48G</div>
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                         <span className="text-[10px] text-slate-400">PWR</span>
                    </div>
                </div>

                {/* Ports Area */}
                <div className="flex items-center justify-between px-2 gap-4">
                    
                    {/* Main RJ45 Blocks */}
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-slate-400">1-12</span>
                            {renderBlock(block1)}
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-slate-400">13-24</span>
                            {renderBlock(block2)}
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-slate-400">25-36</span>
                            {renderBlock(block3)}
                        </div>
                         <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-slate-400">37-48</span>
                            {renderBlock(block4)}
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="w-px h-16 bg-slate-600"></div>

                    {/* SFP Block */}
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-slate-400">SFP 49-52</span>
                         <div className="flex gap-1 bg-slate-800 p-1 rounded border border-slate-600">
                             {renderBlock(blockSFP, true)}
                         </div>
                    </div>
                    
                    {/* Logo Area */}
                     <div className="ml-auto flex flex-col items-end opacity-50">
                        <div className="w-8 h-8 rounded-full border-2 border-slate-500 flex items-center justify-center">
                            <span className="font-bold text-slate-500 text-xs">hp</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// ==========================================
// VOICE PANEL (RACK FACEPLATE) RENDERER
// ==========================================
const VoicePanelChassis: React.FC<SwitchVisualizerProps> = ({ switchDetails, onPortClick }) => {
    const ports = switchDetails.ports.sort((a, b) => a.portNumber - b.portNumber);

    // Split ports into 24-port chunks to simulate physical 1U patch panels
    // 100 ports = 4 full panels (96 ports) + 1 partial panel (4 ports)
    const chunkSize = 24;
    const panels = [];
    for (let i = 0; i < ports.length; i += chunkSize) {
        panels.push(ports.slice(i, i + chunkSize));
    }
    
    return (
        <div className="w-full overflow-x-auto pb-4 space-y-4">
            {panels.map((panelPorts, panelIndex) => (
                <div key={panelIndex} className="min-w-[800px] bg-[#1a1a1a] rounded-sm shadow-xl border border-neutral-800 relative flex items-center h-24">
                     {/* Rack Ears Left */}
                     <div className="w-8 h-full bg-[#1a1a1a] border-r border-neutral-800 flex flex-col justify-center items-center gap-8 absolute left-0 top-0 bottom-0 z-10">
                         <div className="w-2.5 h-3.5 rounded-full bg-black border border-neutral-600 shadow-inner"></div>
                         <div className="w-2.5 h-3.5 rounded-full bg-black border border-neutral-600 shadow-inner"></div>
                    </div>

                    {/* Panel Label/Brand */}
                    <div className="absolute left-10 top-2 text-[9px] font-bold text-gray-500">
                        PANEL {panelIndex + 1}
                    </div>
                    <div className="absolute right-10 top-2 text-[9px] font-bold text-gray-500">
                        CAT.5e
                    </div>

                    {/* Main Content: Groups of 6 */}
                    <div className="flex-1 ml-10 mr-10 flex gap-4 justify-center px-4 mt-2">
                        {[0, 1, 2, 3].map(groupIndex => {
                            const groupPorts = panelPorts.slice(groupIndex * 6, (groupIndex + 1) * 6);
                            // Even if empty, render spacing to keep alignment for partial panels
                            if (groupPorts.length === 0 && panelIndex < 4) return <div key={groupIndex} className="flex-1"></div>;
                            if (groupPorts.length === 0) return null;

                            return (
                                <div key={groupIndex} className="flex gap-[2px] bg-neutral-900 border-t border-b border-neutral-800 py-1">
                                    {groupPorts.map(port => (
                                        <RackPanelPort key={port.id} port={port} onClick={() => onPortClick(port)} />
                                    ))}
                                </div>
                            );
                        })}
                    </div>

                    {/* Rack Ears Right */}
                    <div className="w-8 h-full bg-[#1a1a1a] border-l border-neutral-800 flex flex-col justify-center items-center gap-8 absolute right-0 top-0 bottom-0 z-10">
                         <div className="w-2.5 h-3.5 rounded-full bg-black border border-neutral-600 shadow-inner"></div>
                         <div className="w-2.5 h-3.5 rounded-full bg-black border border-neutral-600 shadow-inner"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ==========================================
// LSA / KRONE CHASSIS RENDERER
// ==========================================
const LSAChassis: React.FC<SwitchVisualizerProps> = ({ switchDetails, onPortClick }) => {
  const ports = switchDetails.ports.sort((a, b) => a.portNumber - b.portNumber);
  
  // 10 strips (Modules), each has 10 ports
  const modules = Array.from({ length: 10 }, (_, i) => {
      const start = i * 10;
      return ports.slice(start, start + 10);
  });

  return (
      <div className="w-full overflow-x-auto pb-4">
          <div className="min-w-[800px] bg-gray-50 rounded-lg p-6 shadow-md border border-gray-200 relative">
             <div className="absolute top-2 left-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                 MDF / LSA Distribution Frame
             </div>

             <div className="flex gap-4 mt-4 overflow-x-auto">
                 {modules.map((modulePorts, modIndex) => (
                     <div key={modIndex} className="flex flex-col items-center">
                         <div className="bg-white border-x border-t border-gray-300 w-16 h-4 mb-0.5 rounded-t text-[9px] text-center text-gray-400">
                             Mod {modIndex + 1}
                         </div>
                         <div className="bg-white border border-gray-300 rounded-b shadow-sm w-16 p-1 flex flex-col gap-[1px]">
                             {modulePorts.map((port) => {
                                 const isActive = port.status === PortStatus.ACTIVE;
                                 return (
                                     <div 
                                        key={port.id}
                                        onClick={() => onPortClick(port)}
                                        className={`
                                            h-4 w-full flex items-center justify-between px-1 cursor-pointer hover:bg-blue-50 transition-colors
                                            ${isActive ? 'bg-green-50' : ''}
                                        `}
                                     >
                                        <div className="flex gap-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200 border border-gray-400"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200 border border-gray-400"></div>
                                        </div>
                                        <span className="text-[8px] font-mono text-gray-500">{port.portNumber}</span>
                                        <div className="flex gap-0.5">
                                            <div className={`w-1.5 h-1.5 rounded-full border border-gray-400 ${isActive ? 'bg-blue-500' : 'bg-white'}`}></div>
                                            <div className={`w-1.5 h-1.5 rounded-full border border-gray-400 ${isActive ? 'bg-red-500' : 'bg-white'}`}></div>
                                        </div>
                                     </div>
                                 );
                             })}
                         </div>
                     </div>
                 ))}
             </div>
          </div>
      </div>
  );
};

// ==========================================
// STANDARD RENDERER (Dual Row, Dark)
// ==========================================
const StandardChassis: React.FC<SwitchVisualizerProps> = ({ switchDetails, onPortClick }) => {
    const ports = switchDetails.ports;
    const sortedPorts = [...ports].sort((a, b) => a.portNumber - b.portNumber);

    const topRow = sortedPorts.filter(p => p.portNumber % 2 !== 0);
    const bottomRow = sortedPorts.filter(p => p.portNumber % 2 === 0);
    const columns = Math.ceil(ports.length / 2);

    const renderPort = (port: SwitchPort, position: 'top' | 'bottom') => {
        if (port.deviceType === DeviceType.CCTV) {
             return <CCTVPort key={port.id} port={port} onClick={() => onPortClick(port)} position={position} />;
        }
        return <DualRowPort key={port.id} port={port} onClick={() => onPortClick(port)} position={position} />;
    };

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[800px] bg-slate-800 rounded-lg p-2 shadow-inner border-2 border-slate-600 relative">
                
                {/* Branding */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col">
                    <div className="text-gray-400 font-bold text-xs tracking-widest uppercase">Gigabit Switch</div>
                    <div className="flex gap-1 mt-1">
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="text-[10px] text-green-500 leading-none">SYS</div>
                    </div>
                </div>

                {/* Ports Container */}
                <div className="ml-32 mr-8 bg-slate-700 rounded border border-slate-600 p-1 flex">
                    {Array.from({ length: columns }).map((_, colIndex) => {
                        const topPort = topRow[colIndex];
                        const bottomPort = bottomRow[colIndex];
                        return (
                            <div key={colIndex} className="flex flex-col gap-2 px-1 border-r border-slate-600 last:border-0">
                                {topPort && renderPort(topPort, 'top')}
                                {bottomPort && renderPort(bottomPort, 'bottom')}
                            </div>
                        )
                    })}
                </div>

                 {/* Rack Ears */}
                 <div className="absolute top-0 bottom-0 left-0 w-3 border-r border-slate-900 bg-slate-400 rounded-l flex flex-col justify-between py-2 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                </div>
                <div className="absolute top-0 bottom-0 right-0 w-3 border-l border-slate-900 bg-slate-400 rounded-r flex flex-col justify-between py-2 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// SUB COMPONENTS
// ==========================================

// Rack Panel Port (Simulates the image: White Label Top, Black Port Bottom)
const RackPanelPort: React.FC<{ port: SwitchPort; onClick: () => void }> = ({ port, onClick }) => {
    const isActive = port.status === PortStatus.ACTIVE;
    const label = port.patchPanelPort && port.patchPanelPort.includes('COM') 
        ? port.patchPanelPort.split('-')[1] // Show just the number if it's COM2-85 -> 85
        : `${port.portNumber}`;

    return (
        <div 
            onClick={onClick}
            className={`
                flex flex-col items-center cursor-pointer group w-[28px]
            `}
        >
            {/* White Label Box */}
            <div className="w-full h-4 bg-white border border-gray-300 flex items-center justify-center text-[9px] font-bold text-gray-800 leading-none mb-[1px]">
                {label}
            </div>
            
            {/* Port Body */}
            <div className="w-full h-6 bg-black border-x border-b border-neutral-700 flex justify-center items-center relative">
                 {/* Port Hole */}
                 <div className={`
                    w-4 h-4 bg-black border border-neutral-800 rounded-[1px] relative
                    ${isActive ? 'shadow-[0_0_3px_rgba(59,130,246,0.8)]' : ''}
                 `}>
                    <div className="absolute top-0 w-full h-1 bg-yellow-700/20"></div>
                    {/* Pins */}
                    <div className="absolute top-[2px] left-[2px] right-[2px] flex justify-between px-[1px]">
                        {[1,2,3,4].map(i => <div key={i} className="w-[1px] h-1.5 bg-yellow-600"></div>)}
                    </div>
                    {/* Connector */}
                    {isActive && <div className="absolute bottom-0 left-0 right-0 h-2 bg-blue-700 rounded-t-[1px]"></div>}
                 </div>
            </div>
        </div>
    );
}

// Faceplate Port (COM2-XX Style) - Legacy/Generic
const FaceplatePort: React.FC<{ port: SwitchPort; onClick: () => void }> = ({ port, onClick }) => {
    const isActive = port.status === PortStatus.ACTIVE;
    const label = port.patchPanelPort || `P-${port.portNumber}`;
    
    return (
        <div 
            onClick={onClick}
            className={`
                flex flex-col items-center mb-1 p-0.5 cursor-pointer transition-transform hover:scale-105 w-full
                ${isActive ? 'opacity-100' : 'opacity-70'}
            `}
        >
            <div className="bg-white text-black text-[7px] font-bold px-1 w-full text-center border border-gray-300 leading-tight">
                {label}
            </div>
            <div className="w-full bg-neutral-800 border-x border-b border-neutral-600 p-1 flex justify-center shadow-sm">
                <div className={`
                    w-6 h-5 bg-black rounded-[1px] border border-neutral-700 relative
                    ${isActive ? 'shadow-[0_0_5px_rgba(59,130,246,0.5)]' : ''}
                `}>
                    <div className="absolute top-0 w-full h-1 bg-yellow-700/30"></div>
                    {isActive && (
                        <div className="absolute bottom-0 left-1 right-1 h-3 bg-blue-600 rounded-t-sm"></div>
                    )}
                </div>
            </div>
        </div>
    );
};

// CCTV Port Component
const CCTVPort: React.FC<{ port: SwitchPort; onClick: () => void; position: 'top' | 'bottom' }> = ({ port, onClick, position }) => {
    const isActive = port.status === PortStatus.ACTIVE;
    const isError = port.status === PortStatus.ERROR;
    
    // Purple theme for CCTV
    let ledColor = 'bg-slate-900';
    if (isActive) ledColor = 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.8)]';
    else if (isError) ledColor = 'bg-orange-500 animate-pulse';

    const connectorColor = isActive ? 'bg-black' : 'bg-slate-900';

    return (
        <div className="flex flex-col items-center group cursor-pointer" onClick={onClick}>
            {position === 'top' && (
                <div className="flex gap-1 mb-0.5 items-center">
                     <div className={`w-1 h-1 rounded-full ${ledColor} transition-colors duration-300`}></div>
                     <span className="text-[9px] text-gray-400 leading-none font-mono">{port.portNumber}</span>
                </div>
            )}

            <div className={`
                w-9 h-7 rounded-sm border relative flex items-center justify-center
                transition-all duration-200
                ${isActive ? 'border-purple-400 bg-slate-800' : 'border-slate-500 bg-slate-600'}
                group-hover:border-white group-hover:scale-105
            `}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-black/20"></div>
                <div className={`absolute bottom-0 left-1 right-1 h-3.5 ${connectorColor} rounded-t-sm`}></div>
                
                {/* CCTV Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <Video size={12} className={`${isActive ? 'text-purple-300' : 'text-slate-500'} drop-shadow-md`} />
                </div>
            </div>

            {position === 'bottom' && (
                <div className="flex gap-1 mt-0.5 items-center">
                     <div className={`w-1 h-1 rounded-full ${ledColor} transition-colors duration-300`}></div>
                     <span className="text-[9px] text-gray-400 leading-none font-mono">{port.portNumber}</span>
                </div>
            )}
        </div>
    )
}

// Single row port (Mikrotik style)
const SinglePort: React.FC<{ port: SwitchPort; onClick: () => void }> = ({ port, onClick }) => {
    const isActive = port.status === PortStatus.ACTIVE;
    const isError = port.status === PortStatus.ERROR;
    const isIdle = port.status === PortStatus.IDLE;

    // Metal casing style for MikroTik
    const casingColor = 'bg-neutral-800 border-neutral-400';
    const connectorColor = isActive ? 'bg-black' : 'bg-neutral-900';

    let ledColor = 'bg-neutral-700'; 
    if (isActive) ledColor = 'bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.8)]';
    else if (isIdle) ledColor = 'bg-neutral-500'; // Dim/Off
    else if (isError) ledColor = 'bg-orange-500 animate-pulse';

    return (
        <div className="flex flex-col items-center group cursor-pointer" onClick={onClick}>
            {/* Port Label */}
            <span className="text-[9px] text-neutral-500 font-mono mb-0.5">{port.portNumber}</span>

            {/* Physical Port */}
            <div className={`
                w-8 h-7 rounded-[2px] border relative
                transition-all duration-200
                ${casingColor}
                group-hover:scale-110
            `}> 
                 {/* Metal Shield effect */}
                 <div className="absolute inset-0 border border-neutral-600 rounded-[1px] pointer-events-none opacity-50"></div>
                 
                 {/* Gold Pins */}
                 <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-600/30"></div>
                 
                 {/* Inner Connector */}
                 <div className={`absolute bottom-0 left-1 right-1 h-3 ${connectorColor} rounded-t-[1px]`}></div>

                 {/* LED Indicator - Embedded in top corners for Mikrotik usually, or just above */}
                 <div className={`absolute top-1 right-1 w-1 h-1 rounded-full ${ledColor}`}></div>
            </div>
        </div>
    );
}

// Dual row port (Standard style)
const DualRowPort: React.FC<{ port: SwitchPort; onClick: () => void; position: 'top' | 'bottom'; isSFP?: boolean }> = ({ port, onClick, position, isSFP }) => {
    const isActive = port.status === PortStatus.ACTIVE;
    const isError = port.status === PortStatus.ERROR;
    
    let ledColor = 'bg-slate-900';
    if (isActive) ledColor = 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.8)]';
    else if (port.status === PortStatus.IDLE) ledColor = 'bg-slate-600'; // Idle led usually off
    else if (isError) ledColor = 'bg-orange-500 animate-pulse';

    const connectorColor = isActive ? 'bg-black' : 'bg-slate-900';

    if (isSFP) {
        return (
             <div className="flex flex-col items-center group cursor-pointer" onClick={onClick}>
                 {position === 'top' && <span className="text-[8px] text-gray-500 mb-0.5">{port.portNumber}</span>}
                 
                 <div className={`
                    w-8 h-8 rounded-[1px] border border-slate-500 bg-slate-400 relative
                    transition-all duration-200
                    group-hover:border-white
                 `}>
                     {/* SFP Lock latch */}
                     <div className="absolute bottom-0 left-1 right-1 h-1 bg-black/40"></div>
                     {/* Active Transceiver inserted? */}
                     {isActive && (
                         <div className="absolute inset-1 bg-blue-600 rounded-[1px] shadow-sm flex items-center justify-center">
                             <div className="w-4 h-4 bg-black/50 rounded-full"></div>
                         </div>
                     )}
                     {!isActive && <div className="absolute inset-2 bg-slate-800 rounded-[1px]"></div>}
                 </div>

                 {position === 'bottom' && <span className="text-[8px] text-gray-500 mt-0.5">{port.portNumber}</span>}
             </div>
        )
    }

    // Standard RJ45 Render
    return (
        <div className="flex flex-col items-center group cursor-pointer" onClick={onClick}>
            {position === 'top' && (
                <div className="flex gap-1 mb-0.5 items-center">
                     <div className={`w-1 h-1 rounded-full ${ledColor} transition-colors duration-300`}></div>
                     <span className="text-[9px] text-gray-400 leading-none font-mono">{port.portNumber}</span>
                </div>
            )}

            <div className={`
                w-9 h-7 rounded-sm border relative
                transition-all duration-200
                ${isActive ? 'border-slate-400 bg-slate-800' : 'border-slate-500 bg-slate-600'}
                group-hover:border-white group-hover:scale-105
            `}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-black/20"></div>
                <div className={`absolute bottom-0 left-1 right-1 h-3.5 ${connectorColor} rounded-t-sm`}></div>
            </div>

            {position === 'bottom' && (
                <div className="flex gap-1 mt-0.5 items-center">
                     <div className={`w-1 h-1 rounded-full ${ledColor} transition-colors duration-300`}></div>
                     <span className="text-[9px] text-gray-400 leading-none font-mono">{port.portNumber}</span>
                </div>
            )}
        </div>
    )
}
