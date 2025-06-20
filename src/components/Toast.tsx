'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

type ToastProps = {
  message: string;
  type?: 'success' | 'error';
  onClose?: () => void;
};

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm text-white animate-fade-in-up transition-all ${
        type === 'success' ? 'bg-green-600' : 'bg-red-500'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle size={18} className="text-white" />
      ) : (
        <XCircle size={18} className="text-white" />
      )}
      <span>{message}</span>
    </div>
  );
}
