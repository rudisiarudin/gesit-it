import { Suspense } from 'react';
import GAAssetDetailPage from '@/components/GAAssetDetailPage';

export default function GAAssetPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading asset detail...</div>}>
      <GAAssetDetailPage />
    </Suspense>
  );
}
