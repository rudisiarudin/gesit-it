'use client';

import { useState } from 'react';
import { addNetworkDevice } from '@/lib/networkActions'; // <-- PATH BENAR
import { Loader2, Plus } from 'lucide-react'; 

export default function AddDeviceForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Router/Switch',
    location: '',
    ip: '',
    ports: 0,
    usage: 0,
    status: 'Active',
    department: 'IT', 
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      await addNetworkDevice(formData);
      onSuccess(); // Panggil onSuccess untuk menutup modal dan refresh data
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Tambah Perangkat Baru</h2>
      
      {formError && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded border border-red-200">{formError}</div>}
      
      {/* Input Nama */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Nama Perangkat</label>
        <input 
          type="text" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      {/* Input Tipe */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Tipe</label>
        <select 
          name="type" 
          value={formData.type} 
          onChange={handleChange} 
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option>Router/Switch</option>
          <option>Access Switch</option>
          <option>Patch Panel</option>
          <option>Media Converter</option>
        </select>
      </div>
      
      {/* Input Lokasi */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Lokasi</label>
        <input 
          type="text" 
          name="location" 
          value={formData.location} 
          onChange={handleChange} 
          required 
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      
      {/* Input Department */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Departemen</label>
        <select 
          name="department" 
          value={formData.department} 
          onChange={handleChange} 
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="IT">IT</option>
          <option value="GA">GA</option>
          <option value="General">General</option>
        </select>
      </div>

      {/* Input IP dan Ports */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Alamat IP (Optional)</label>
          <input 
            type="text" 
            name="ip" 
            value={formData.ip} 
            onChange={handleChange} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Ports</label>
          <input 
            type="number" 
            name="ports" 
            value={formData.ports} 
            onChange={handleChange} 
            min="0"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
        {loading ? 'Menyimpan...' : 'Simpan Perangkat'}
      </button>
    </form>
  );
}
