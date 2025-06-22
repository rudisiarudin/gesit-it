'use client';

import React from 'react';
import { Asset } from '@/app/dashboard/it-assets/page';

type Props = {
  form: Omit<Asset, 'qr_value'>;
  setForm: (form: Omit<Asset, 'qr_value'>) => void;
};

const AdditionalSpecs: React.FC<Props> = ({ form, setForm }) => {
  return (
    <>
      <hr className="my-6 border-gray-300" />
      <h3 className="text-base font-medium text-gray-800 mb-2">Spesifikasi Tambahan</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Storage', 'RAM', 'VGA', 'Processor'].map((label) => {
          const key = label.toLowerCase();
          return (
            <div key={key}>
              <label className="block text-sm text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={(form as any)[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default AdditionalSpecs;
