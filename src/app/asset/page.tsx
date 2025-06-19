import { Suspense } from 'react';
import AssetDetailClient from '@/components/AssetDetailClient';

export default function AssetPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading page...</div>}>
      <AssetDetailClient />
    </Suspense>
  );
}
