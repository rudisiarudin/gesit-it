'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ForbiddenPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/dashboard'); // redirect ke dashboard setelah 3 detik
    }, 3000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-lg text-gray-700 mb-6 text-center max-w-md">
        You do not have permission to access this page.
      </p>
      <p className="text-gray-500">Redirecting to dashboard...</p>
    </div>
  );
}
