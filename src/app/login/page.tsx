"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true); // default true
  const [error, setError] = useState("");

  // Kalau rememberMe = false, logout otomatis saat tab/window ditutup
  useEffect(() => {
    if (!rememberMe) {
      const handleBeforeUnload = async () => {
        await supabase.auth.signOut();
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [rememberMe]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Cari email dari username
    const { data: userData, error: userError } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("username", username)
      .single();

    if (userError || !userData?.email) {
      setError("Username not found.");
      return;
    }

    // Login dengan email + password
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password,
    });

    if (loginError) {
      setError("Login failed. Please check your username and password.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-white relative overflow-hidden">
      {/* Background image blur */}
      <img
        src="https://source.unsplash.com/featured/?technology"
        alt="Background"
        className="fixed inset-0 w-full h-full object-cover opacity-30 blur-lg -z-10"
      />

      {/* Logo + text above card */}
      <header className="flex flex-col items-center mt-16 mb-8 px-4 select-none">
        <img
          src="/logo.png"
          alt="IT Gesit Logo"
          className="w-16 h-16 object-contain mb-2"
        />
        <h1 className="text-4xl font-extrabold text-black-700">IT Gesit</h1>
      </header>

      {/* Main container card login */}
      <main className="flex-grow flex items-center justify-center px-4 pb-12 sm:pb-24">
        <div
          className="
            w-full max-w-md
            bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl
            shadow-lg p-6 sm:p-10
            transition-all
          "
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Login
          </h2>
          <p className="text-gray-600 text-center mb-6 text-sm sm:text-base">
            Sign in with your username & password
          </p>

          {error && (
            <p className="text-red-600 bg-red-100 p-2 mb-4 rounded text-sm text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="
                  w-full p-3 rounded-lg bg-white/70 backdrop-blur border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  transition
                  text-sm sm:text-base
                "
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="
                    w-full p-3 pr-10 rounded-lg bg-white/70 backdrop-blur border border-gray-300
                    focus:outline-none focus:ring-2 focus:ring-blue-400
                    transition
                    text-sm sm:text-base
                  "
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex justify-between items-center mt-2">
                <label className="inline-flex items-center gap-2 text-sm select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="form-checkbox text-blue-600"
                  />
                  Remember me
                </label>

                <a
                  href="/forgot-password"
                  className="text-blue-600 font-semibold hover:underline text-sm"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="
                w-full bg-blue-600 text-white p-3 rounded-lg
                hover:bg-blue-700 transition
                font-semibold
                text-sm sm:text-base
              "
            >
              Login
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600 text-sm sm:text-base">
            Don’t have an account?{" "}
            <a
              href="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Register
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 bg-white/50 backdrop-blur border-t border-gray-200 text-center text-gray-600 text-xs sm:text-sm select-none">
        &copy; {new Date().getFullYear()} IT Gesit. All rights reserved.
      </footer>
    </div>
  );
}
