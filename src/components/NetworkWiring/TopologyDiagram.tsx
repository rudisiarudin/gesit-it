'use client';

import React, { useMemo } from 'react';
import { Cloud, Router, Server, Wifi, Box, Phone, PhoneCall, Grid, Disc } from 'lucide-react';
import { MOCK_SWITCHES } from '../constants';
import { DeviceType } from '../types';

// Node Configuration mapping based on ID for fixed layout logic
const LAYOUT_CONFIG: Record<string, { x: number, y: number, color: string, icon: any }> = {
    'internet-cloud': { x: 400, y: 50, color: 'bg-blue-400', icon: Cloud },
    'sw-mikrotik-01': { x: 400, y: 180, color: 'bg-slate-800', icon: Router },
    'sw-h3c-01': { x: 200, y: 350, color: 'bg-blue-600', icon: Server }, // Left Branch
    'sw-hp-01': { x: 600, y: 350, color: 'bg-slate-600', icon: Box },   // Right Branch
    
    // Voice Network (Separate Tree visually)
    'pabx-main': { x: 850, y: 50, color: 'bg-purple-700', icon: PhoneCall },
    'lsa-mdf-01': { x: 850, y: 180, color: 'bg-yellow-600', icon: Grid },
    'vp-01': { x: 850, y: 350, color: 'bg-neutral-800', icon: Server },
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

interface NodeProps {
    id: string;
    label: string;
    sublabel: string;
    x: number;
    y: number;
    icon: any;
    color: string;
    details?: string;
}

const DiagramNode: React.FC<NodeProps> = ({ label, sublabel, x, y, icon: Icon, color, details }) => (
    <div 
        className="absolute flex flex-col items-center bg-white p-3 rounded-xl shadow-lg border-2 border-gray-200 hover:border-brand-500 hover:scale-105 transition-all z-20 group"
        style={{ 
            left: x - NODE_WIDTH / 2, 
            top: y, 
            width: NODE_WIDTH,
            height: NODE_HEIGHT 
        }}
    >
        <div className={`absolute -top-4 p-2 rounded-full ${color} text-white shadow-md group-hover:shadow-lg transition-all`}>
            <Icon size={20} />
        </div>
        <div className="mt-3 text-center w-full">
            <h4 className="font-bold text-gray-800 text-sm leading-tight truncate px-2">{label}</h4>
            <p className="text-xs text-gray-500 font-mono mt-0.5 font-medium truncate">{sublabel}</p>
            {details && <p className="text-[10px] text-gray-400 mt-0.5">{details}</p>}
        </div>
    </div>
);

export const TopologyDiagram: React.FC = () => {
    // 1. Prepare Nodes based on MOCK_SWITCHES and Layout Config
    const nodes = useMemo(() => {
        const nodeList: NodeProps[] = [];

        // Add static Internet Node
        nodeList.push({
            id: 'internet-cloud',
            label: 'Internet / ISP',
            sublabel: 'WAN Gateway',
            x: LAYOUT_CONFIG['internet-cloud'].x,
            y: LAYOUT_CONFIG['internet-cloud'].y,
            icon: LAYOUT_CONFIG['internet-cloud'].icon,
            color: LAYOUT_CONFIG['internet-cloud'].color
        });

        // Add Static PABX Node
        nodeList.push({
            id: 'pabx-main',
            label: 'PABX Server',
            sublabel: 'Telephony Host',
            x: LAYOUT_CONFIG['pabx-main'].x,
            y: LAYOUT_CONFIG['pabx-main'].y,
            icon: LAYOUT_CONFIG['pabx-main'].icon,
            color: LAYOUT_CONFIG['pabx-main'].color
        });

        MOCK_SWITCHES.forEach(sw => {
            const config = LAYOUT_CONFIG[sw.id];
            if (config) {
                nodeList.push({
                    id: sw.id,
                    label: sw.name,
                    sublabel: sw.model,
                    x: config.x,
                    y: config.y,
                    icon: config.icon,
                    color: config.color,
                    details: sw.ip
                });
            }
        });

        return nodeList;
    }, []);

    // 2. Calculate Connections (Edges)
    const edges = useMemo(() => {
        const edgeList: Array<{ x1: number, y1: number, x2: number, y2: number, color: string, type: 'solid' | 'dashed' }> = [];

        // Manual Internet Link
        edgeList.push({
            x1: LAYOUT_CONFIG['internet-cloud'].x,
            y1: LAYOUT_CONFIG['internet-cloud'].y + NODE_HEIGHT,
            x2: LAYOUT_CONFIG['sw-mikrotik-01'].x,
            y2: LAYOUT_CONFIG['sw-mikrotik-01'].y,
            color: '#94a3b8',
            type: 'dashed'
        });

        // Loop through switches to find Uplinks
        MOCK_SWITCHES.forEach(sourceSw => {
            const sourcePos = LAYOUT_CONFIG[sourceSw.id];
            if (!sourcePos) return;

            sourceSw.ports.forEach(port => {
                if (port.uplinkDeviceId) {
                    const targetPos = LAYOUT_CONFIG[port.uplinkDeviceId];
                    if (targetPos) {
                        // Avoid duplicates: only draw if source ID < target ID alphabetically 
                        // (This assumes bi-directional links, but our data might be uni-directional in definition)
                        // Actually, let's just draw everything and overlap is fine for now, or filter by logic.
                        
                        // Check if it's voice or data for color
                        const isVoice = sourceSw.id.includes('lsa') || sourceSw.id.includes('vp');
                        
                        edgeList.push({
                            x1: sourcePos.x,
                            y1: sourcePos.y + NODE_HEIGHT,
                            x2: targetPos.x,
                            y2: targetPos.y,
                            color: isVoice ? '#eab308' : '#0ea5e9', // Yellow for voice, Blue for data
                            type: 'solid'
                        });
                    }
                }
            });
        });

        // Add PABX to LSA Link (Logic not in ports for PABX stub)
        edgeList.push({
            x1: LAYOUT_CONFIG['pabx-main'].x,
            y1: LAYOUT_CONFIG['pabx-main'].y + NODE_HEIGHT,
            x2: LAYOUT_CONFIG['lsa-mdf-01'].x,
            y2: LAYOUT_CONFIG['lsa-mdf-01'].y,
            color: '#eab308',
            type: 'solid'
        });

        return edgeList;
    }, []);

    return (
        <div className="w-full bg-slate-50 p-4 rounded-xl border border-gray-200 overflow-auto min-h-[600px] relative">
            <h3 className="absolute left-4 top-4 text-xs font-bold text-gray-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded">
                Live Wiring Map
            </h3>
            
            <div className="relative min-w-[1000px] h-[600px] mx-auto">
                {/* SVG Layer for Cables */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                        </marker>
                    </defs>
                    {edges.map((edge, idx) => {
                        // Draw bezier curve
                        const pathData = `M ${edge.x1} ${edge.y1} C ${edge.x1} ${edge.y1 + 50}, ${edge.x2} ${edge.y2 - 50}, ${edge.x2} ${edge.y2}`;
                        return (
                            <path 
                                key={idx}
                                d={pathData}
                                stroke={edge.color}
                                strokeWidth="3"
                                strokeDasharray={edge.type === 'dashed' ? '5,5' : 'none'}
                                fill="none"
                                className="opacity-60"
                            />
                        );
                    })}
                </svg>

                {/* Nodes Layer */}
                {nodes.map(node => (
                    <DiagramNode key={node.id} {...node} />
                ))}

                {/* Simulated Leaf Nodes Area (Visual Decoration) */}
                <div className="absolute top-[480px] left-[100px] right-[100px] border-t-2 border-dashed border-gray-200 pt-4 flex justify-around opacity-70">
                     <div className="flex flex-col items-center gap-2">
                        <Wifi className="text-blue-500" />
                        <span className="text-[10px] uppercase font-bold text-gray-400">Wireless Zone</span>
                     </div>
                     <div className="flex flex-col items-center gap-2">
                        <Disc className="text-slate-500" />
                        <span className="text-[10px] uppercase font-bold text-gray-400">Workstations</span>
                     </div>
                     <div className="flex flex-col items-center gap-2">
                        <Phone className="text-yellow-500" />
                        <span className="text-[10px] uppercase font-bold text-gray-400">Voice Extensions</span>
                     </div>
                </div>
            </div>
        </div>
    );
};
