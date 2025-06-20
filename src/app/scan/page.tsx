'use client';

import { useRouter } from 'next/navigation';
import QRScanner from '@/components/QRScanner';

export default function QRScanPage() {
  const router = useRouter();

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Scan QR</h1>
      <QRScanner onScan={(result) => router.push(result)} />
    </div>
  );
}
