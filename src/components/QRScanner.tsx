'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner({ onScan }: { onScan: (text: string) => void }) {
  const scannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(
      (text) => {
        onScan(text);
        scanner.clear().catch(console.error);
      },
      (err) => {
        console.warn('Scan error:', err);
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  return <div id="qr-reader" ref={scannerRef}></div>;
}
