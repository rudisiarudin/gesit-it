"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));
    const type = params.get("type");

    if (type === "recovery") {
      setRecoveryMode(true);
    }

    setLoading(false);
  }, []);

  const handleResetPassword = async () => {
    if (!password) return alert("Password baru harus diisi");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      alert("Gagal update password: " + error.message);
    } else {
      alert("Password berhasil diubah!");
      router.push("/login");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        {recoveryMode ? (
          <>
            <h1 className="text-lg font-semibold mb-4">Reset Password</h1>
            <input
              type="password"
              placeholder="Password baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />
            <button
              onClick={handleResetPassword}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Simpan Password
            </button>
          </>
        ) : (
          <p>Redirecting...</p>
        )}
      </div>
    </div>
  );
}
