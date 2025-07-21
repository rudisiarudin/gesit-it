'use client';

import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import DownloadAllQRButton from '@/components/DownloadAllQRButton';
import ExportToExcelButton from '@/components/Export/ExportToExcelButton';
import { Asset } from '@/app/dashboard/it-assets/page';

interface Props {
  searchTerm: string;
  onSearch: (term: string) => void;
  onAdd: () => void;
  assets: Asset[];
  role?: string;
}

export default function ITAssetFilterBar({
  searchTerm,
  onSearch,
  onAdd,
  assets,
  role = '',
}: Props) {
  const [localTerm, setLocalTerm] = useState(searchTerm);

  // Debounce search input
  useEffect(() => {
    const delay = setTimeout(() => {
      if (localTerm !== searchTerm) {
        onSearch(localTerm);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [localTerm, onSearch, searchTerm]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
      <input
        type="text"
        placeholder="Search any field (item, brand, SN, status...)"
        value={localTerm}
        onChange={(e) => setLocalTerm(e.target.value)}
        className="border px-4 py-2 rounded w-full md:w-1/3"
      />

      <div className="flex gap-2">
        <DownloadAllQRButton assets={assets} />
        <ExportToExcelButton tableName="it_assets" fileName="IT_Assets" />

        {(role === 'admin' || role === 'staff') && (
          <button
            onClick={onAdd}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
          >
            <PlusCircle size={18} className="mr-1" />
            Add Asset
          </button>
        )}
      </div>
    </div>
  );
}
