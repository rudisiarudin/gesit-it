// File: /app/dashboard/network-wiring/page.tsx

'use client'; // Pastikan ini ada karena NetworkDashboard menggunakan useState

import { NetworkDashboard } from '@/components/NetworkWiring/NetworkDashboard';
import { useRouter } from 'next/navigation';
import React from 'react';

// Halaman utama untuk Network & Wiring
export default function NetworkWiringPage() {
    const router = useRouter();

    // Fungsi untuk kembali ke halaman dashboard utama
    const handleBack = () => {
        router.push('/dashboard'); 
    };

    return (
        <div className="p-6 md:p-10 space-y-6">
            {/* Header Halaman */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-extrabold text-gray-900">
                    Network & Wiring Management
                </h1>
                {/* Opsi tombol back jika diperlukan di masa depan */}
                {/* <button onClick={handleBack} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                </button> */}
            </div>
            
            <NetworkDashboard 
                onBack={handleBack} 
            />
        </div>
    );
}
