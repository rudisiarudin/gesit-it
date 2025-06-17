"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import {
  Home,
  List,
  Calendar,
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("User");
  const [userInitials, setUserInitials] = useState("U");

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const fullName =
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            "User";
          setUserName(fullName);

          const initials = fullName
            .split(" ")
            .map((word: string) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          setUserInitials(initials);
        }
      } catch (error) {
        console.error("Failed to get user info:", error);
      }
    };

    getUserInfo();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/dashboard/activity-log?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { href: "/dashboard/activity-log", label: "Activity IT", icon: <List size={18} /> },
    { href: "/dashboard/weekly-plan", label: "Weekly Plan", icon: <Calendar size={18} /> },
    { href: "/dashboard/purchase-plan", label: "Purchase Plan", icon: <ShoppingCart size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed z-40 top-0 left-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b">
          <span className="text-xl font-semibold text-slate-800">Log IT</span>
          <button
            className="md:hidden text-gray-600"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>
        <nav className="mt-4 flex flex-col space-y-1 px-4">
          {menuItems.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                pathname === href
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-screen pl-0 md:pl-64">
        <header className="h-16 bg-white border-b px-4 md:px-6 flex items-center justify-between shadow-sm gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-700"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>

          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari aktivitas..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100"
            >
              <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center text-sm font-semibold">
                {userInitials}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-800">{userName}</span>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-50">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User size={16} className="mr-2" /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                >
                  <LogOut size={16} className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
