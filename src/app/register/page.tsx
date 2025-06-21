"use client";

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
      setError("Only @gesit.co.id emails are allowed.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirmation do not match.");
      return;
    }

    const { data: existing, error: existingError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      setError("Username is already taken. Please choose another.");
      return;
    }

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
      setError(signUpError?.message || "Registration failed.");
      return;
    }

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
      setError(`Failed to save user profile: ${profileError.message}`);
    } else {
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-white relative overflow-hidden">
      {/* Background image blur */}
      <img
        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
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

      {/* Main card container */}
      <main className="flex-grow flex items-center justify-center px-4 pb-12 sm:pb-24">
        <div
          className="
            w-full max-w-md
            bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl
            shadow-lg p-8 md:p-12
            transition-all
          "
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Create Account
          </h2>
          <p className="text-gray-600 text-center mb-6 text-sm sm:text-base">
            Register your new account
          </p>

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

          <form onSubmit={handleRegister} className="space-y-5">
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
                  w-full p-3 rounded-lg bg-white/70 border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  transition
                  text-sm sm:text-base
                "
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="
                  w-full p-3 rounded-lg bg-white/70 border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  transition
                  text-sm sm:text-base
                "
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full p-3 rounded-lg bg-white/70 border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  transition
                  text-sm sm:text-base
                "
                placeholder="Enter your @gesit.co.id email"
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
                    w-full p-3 pr-10 rounded-lg bg-white/70 border border-gray-300
                    focus:outline-none focus:ring-2 focus:ring-blue-400
                    transition
                    text-sm sm:text-base
                  "
                  placeholder="Enter password"
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="
                  w-full p-3 rounded-lg bg-white/70 border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  transition
                  text-sm sm:text-base
                "
                placeholder="Re-enter password"
              />
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
              Register
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600 text-sm sm:text-base">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 font-semibold hover:underline">
              Login
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
