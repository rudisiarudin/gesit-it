'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';

type Row = {
  id: string;
  itemName: string;
  qty: number;
  uom: string;
  estPrice: number;
  remarks: string;
  status: string;
};

export default function PurchasePlan() {
  const [rows, setRows] = useState<Row[]>([
    {
      id: uuidv4(),
      itemName: '',
      qty: 1,
      uom: '',
      estPrice: 0,
      remarks: '',
      status: '',
    },
  ]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: uuidv4(),
        itemName: '',
        qty: 1,
        uom: '',
        estPrice: 0,
        remarks: '',
        status: '',
      },
    ]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleChange = (id: string, key: keyof Row, value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, [key]: key === 'qty' || key === 'estPrice' ? Number(value) : value }
          : row
      )
    );
  };

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const total = rows.reduce((sum, row) => sum + row.qty * row.estPrice, 0);

  const saveToSupabase = async () => {
    const planId = uuidv4();

    const { error: planError } = await supabase.from('purchase_plans').insert({
      id: planId,
      plan_name: 'Plan ' + new Date().toLocaleDateString(),
      created_by: 'admin',
    });

    if (planError) {
      alert('Gagal simpan rencana: ' + planError.message);
      return;
    }

    const items = rows.map((row) => ({
      id: uuidv4(),
      plan_id: planId,
      item_name: row.itemName,
      qty: row.qty,
      uom: row.uom,
      est_price: row.estPrice,
      remarks: row.remarks,
      status: row.status,
    }));

    const { error: itemError } = await supabase.from('purchase_plan_items').insert(items);

    if (itemError) {
      alert('Gagal simpan item: ' + itemError.message);
    } else {
      alert('Berhasil disimpan!');
      setRows([
        {
          id: uuidv4(),
          itemName: '',
          qty: 1,
          uom: '',
          estPrice: 0,
          remarks: '',
          status: '',
        },
      ]);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Purchase Plan</h2>
      <table className="w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">No</th>
            <th className="border px-2 py-1">Item Name</th>
            <th className="border px-2 py-1">Qty</th>
            <th className="border px-2 py-1">UoM</th>
            <th className="border px-2 py-1">Est. Price</th>
            <th className="border px-2 py-1">Subtotal</th>
            <th className="border px-2 py-1">Remarks</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id}>
              <td className="border px-2 py-1 text-center">{idx + 1}</td>
              <td className="border px-2 py-1">
                <input
                  className="w-full border px-1"
                  value={row.itemName}
                  onChange={(e) => handleChange(row.id, 'itemName', e.target.value)}
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  className="w-full border px-1 text-right"
                  value={row.qty}
                  onChange={(e) => handleChange(row.id, 'qty', e.target.value)}
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  className="w-full border px-1"
                  value={row.uom}
                  onChange={(e) => handleChange(row.id, 'uom', e.target.value)}
                />
              </td>
              <td className="border px-2 py-1 text-right">
                <input
                  type="number"
                  className="w-full border px-1 text-right"
                  value={row.estPrice}
                  onChange={(e) => handleChange(row.id, 'estPrice', e.target.value)}
                />
              </td>
              <td className="border px-2 py-1 text-right">
                {formatIDR(row.qty * row.estPrice)}
              </td>
              <td className="border px-2 py-1">
                <input
                  className="w-full border px-1"
                  value={row.remarks}
                  onChange={(e) => handleChange(row.id, 'remarks', e.target.value)}
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  className="w-full border px-1"
                  value={row.status}
                  onChange={(e) => handleChange(row.id, 'status', e.target.value)}
                />
              </td>
              <td className="border px-2 py-1 text-center">
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => removeRow(row.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          <tr className="bg-gray-100 font-semibold">
            <td colSpan={5} className="border px-2 py-2 text-right">
              Total
            </td>
            <td className="border px-2 py-2 text-right">{formatIDR(total)}</td>
            <td colSpan={3} className="border px-2 py-2"></td>
          </tr>
        </tbody>
      </table>

      <div className="flex gap-4 mt-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={addRow}
        >
          Add Row
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={saveToSupabase}
        >
          Save to Supabase
        </button>
      </div>
    </div>
  );
}
