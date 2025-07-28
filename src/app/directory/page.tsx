
import { Suspense } from 'react';
import ExtensionDirectory from "@/components/ExtensionDirectory";

export default function DirectoryPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <ExtensionDirectory />
    </main>
  );
}
