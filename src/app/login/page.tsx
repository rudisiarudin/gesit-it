"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Ambil email berdasarkan username dari table user_profiles
    const { data: userData, error: userError } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("username", username)
      .single();

    if (userError || !userData?.email) {
      setError("Username tidak ditemukan.");
      return;
    }

    // Login dengan email dari username
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password,
    });

    if (loginError) {
      setError("Login gagal. Periksa username dan password.");
    } else {
      router.push("/dashboard"); // arahkan ke halaman utama
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white relative overflow-hidden">
      <img
        src="https://source.unsplash.com/featured/?technology"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-30 blur-lg"
      />

      <div className="relative z-10 bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Login</h1>
        <p className="text-gray-600 text-center mb-6">Masuk dengan username & password</p>

        {error && (
          <p className="text-red-600 bg-red-100 p-2 mb-4 rounded text-sm text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/70 backdrop-blur border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-10 rounded-lg bg-white/70 backdrop-blur border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          Belum punya akun?{" "}
          <a href="/register" className="text-blue-600 font-semibold">
            Daftar
          </a>
        </p>
      </div>
    </div>
  );
}
