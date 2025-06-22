'use client';

import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabaseClient';
import { Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  userId: string;
  fetchAssets: () => void;
};

const ImportExcel = ({ userId, fetchAssets }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        let successCount = 0;
        let skippedCount = 0;

        for (const row of data) {
          const companyCode = row.company?.toLowerCase().includes('gesit alumas') ? 'GA' :
            row.company?.toLowerCase().includes('gesit perkasa') ? 'GP' :
            row.company?.toLowerCase().includes('sircon') ? 'SI' :
            row.company?.toLowerCase().includes('alakasa') ? 'AI' :
            row.company?.toLowerCase().includes('gesit graha') ? 'GG' :
            row.company?.toLowerCase().includes('gesit intrade') ? 'GI' :
            row.company?.toLowerCase().includes('dharma') ? 'DAS' :
            row.company?.toLowerCase().includes('dinamika') ? 'DSM' : 'XX';

          const catCode = row.category?.toLowerCase().includes('laptop') ? 'LP' :
            row.category?.toLowerCase().includes('pc') ? 'PC' :
            row.category?.toLowerCase().includes('printer') ? 'PR' :
            row.category?.toLowerCase().includes('monitor') ? 'MN' :
            row.category?.toLowerCase().includes('proyektor') ? 'PJ' :
            row.category?.toLowerCase().includes('router') ? 'RT' :
            row.category?.toLowerCase().includes('harddisk') ? 'HD' :
            row.category?.toLowerCase().includes('switch') ? 'SW' :
            row.category?.toLowerCase().includes('access') ? 'AP' :
            row.category?.toLowerCase().includes('peripherals') ? 'PH' :
            row.category?.toLowerCase().includes('security') ? 'SC' :
            row.category?.toLowerCase().includes('tools') ? 'TL' : 'OT';

          const { count } = await supabase
            .from('it_assets')
            .select('*', { count: 'exact', head: true })
            .eq('category', row.category)
            .eq('company', row.company);

          const serial = String((count || 0) + 1).padStart(3, '0');
          const id = `${companyCode}-${catCode}-${serial}`;
          const qr_value = `${location.origin}/asset?id=${id}`;

          // Cek apakah ID sudah ada
          const { data: existing } = await supabase
            .from('it_assets')
            .select('id')
            .eq('id', id)
            .single();

          if (existing) {
            skippedCount++;
            continue; // Lewati jika ID sudah ada
          }

          const { error } = await supabase.from('it_assets').insert([
            {
              ...row,
              id,
              qr_value,
              user_id: userId,
            },
          ]);

          if (error) {
            console.error('Insert error:', error);
            toast.error(`Gagal simpan: ${error.message}`);
            setIsLoading(false);
            return;
          }

          successCount++;
        }

        if (successCount > 0) toast.success(`Berhasil import ${successCount} data`);
        if (skippedCount > 0) toast.info(`${skippedCount} data dilewati (ID sudah ada)`);

        fetchAssets();
      } catch (err) {
        console.error('Import error:', err);
        toast.error('Gagal memproses file Excel');
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium border transition
      ${isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
      <Upload size={16} />
      {isLoading ? 'Mengimpor...' : 'Import Excel'}
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isLoading}
      />
    </label>
  );
};

export default ImportExcel;
