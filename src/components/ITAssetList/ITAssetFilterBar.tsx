'use client';

import { PlusCircle } from 'lucide-react';
import DownloadAllQRButton from '@/components/DownloadAllQRButton';
import ExportToExcelButton from '@/components/Export/ExportToExcelButton';
import { Asset } from '@/app/dashboard/it-assets/page';

interface Props {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAdd: () => void;
  assets: Asset[];
  role: string;
}

export default function ITAssetFilterBar({
  searchTerm,
  setSearchTerm,
  onAdd,
  assets,
  role,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
      <input
        type="text"
        placeholder="Search any field (item, brand, SN, status...)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border px-4 py-2 rounded w-full md:w-1/3"
      />

      <div className="flex gap-2">
        <DownloadAllQRButton assets={assets} />
        <ExportToExcelButton data={assets} fileName="IT_Assets" />

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
