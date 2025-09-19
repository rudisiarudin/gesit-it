import { Suspense } from 'react';
import AssetDetailGBP from '@/components/AssetDetailGBP';

export default function AssetGBPPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading page...</div>}>
      <AssetDetailGBP />
    </Suspense>
  );
}
