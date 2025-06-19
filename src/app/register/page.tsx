'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.endsWith("@gesit.co.id")) {
      setError("Hanya email @gesit.co.id yang diizinkan.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi tidak cocok.");
      return;
    }

    const { data: existing, error: existingError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      setError("Username sudah digunakan. Coba yang lain.");
      return;
    }

    // Sign up with metadata
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        },
      },
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message || "Gagal registrasi.");
      return;
    }

    // Insert ke user_profiles table
    const { error: profileError } = await supabase.from("user_profiles").insert([
      {
        id: data.user.id,
        email,
        username,
        full_name: fullName,
        role: "user",
      },
    ]);

    if (profileError) {
      setError(`Gagal menyimpan profil pengguna: ${profileError.message}`);
    } else {
      setSuccess("Registrasi berhasil! Silakan login.");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-30 blur-lg"
      />

      <div className="relative z-10 bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Buat Akun</h1>
        <p className="text-gray-600 text-center mb-6">Daftarkan akun kamu</p>

        {error && (
          <p className="text-red-600 bg-red-100 p-2 mb-4 rounded text-sm text-center">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-600 bg-green-100 p-2 mb-4 rounded text-sm text-center">
            {success}
          </p>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/70 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/70 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/70 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                className="w-full p-3 pr-10 rounded-lg bg-white/70 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          <div>
            <label className="block text-sm text-gray-700 mb-1">Konfirmasi Password</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/70 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-600 font-semibold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
