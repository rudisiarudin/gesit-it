'use client';

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
  Cpu,
  Package,
  Users,
  Boxes,
  Link as LinkIcon, // 👈 Import ikon Link untuk Network & Wiring
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userInitials, setUserInitials] = useState("U");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userGroups, setUserGroups] = useState<string[]>([]);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          router.push("/login");
          return;
        }
        const userId = authData.user.id;

        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("full_name, role, groups")
          .eq("id", userId)
          .single();

        if (profileError || !profileData) {
          console.error("Failed to fetch user profile:", profileError);
          router.push("/login");
          return;
        }

        setUserName(profileData.full_name || "User");
        setUserRole(profileData.role || null);
        setUserGroups(profileData.groups || []);

        const initials = (profileData.full_name || "User")
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        setUserInitials(initials);
      } catch (error) {
        console.error("Failed to get user info:", error);
        router.push("/login");
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home size={18} />,
      groups: ["IT", "GA", "BOC"],
    },
    {
      href: "/dashboard/activity-log",
      label: "Activity IT",
      icon: <List size={18} />,
      groups: ["IT"],
    },
    {
      href: "/dashboard/weekly-plan",
      label: "Weekly Plan",
      icon: <Calendar size={18} />,
      groups: ["IT", "GA"],
    },
    {
      href: "/dashboard/purchase-plan",
      label: "Purchase Plan",
      icon: <ShoppingCart size={18} />,
      groups: ["BOC", "IT"],
    },
    {
      href: "/dashboard/it-assets",
      label: "IT Asset",
      icon: <Cpu size={18} />,
      groups: ["IT", "GBP"],
    },
    {
      href: "/dashboard/ga-assets",
      label: "GA Asset",
      icon: <Package size={18} />,
      groups: ["GA"],
    },
    {
      href: "/dashboard/gbp-assets",
      label: "GNR Asset",
      icon: <Boxes size={18} />,
      groups: ["GBP"],
    },
    // 👇👇👇 MENU BARU: Network & Wiring 👇👇👇
    {
      href: "/dashboard/network-wiring",
      label: "Network & Wiring",
      icon: <LinkIcon size={18} />, // Menggunakan LinkIcon (di-alias dari Link)
      groups: ["IT"], // Hanya terlihat oleh grup IT
    },
  ];

  if (userRole === "admin") {
    menuItems.push({
      href: "/dashboard/users",
      label: "User Management",
      icon: <Users size={18} />,
      groups: ["IT", "GA", "BOC"],
    });
  }

  const filteredMenuItems = menuItems.filter((item) =>
    item.groups.some((g) => userGroups.includes(g))
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed z-40 top-0 left-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <span className="text-lg font-bold text-slate-800">IT Gesit</span>
          </div>

          <button
            className="md:hidden text-gray-600"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="mt-4 flex flex-col space-y-1 px-4">
          {filteredMenuItems.map(({ href, label, icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                  isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                {icon}
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-screen pl-0 md:pl-64">
        <header className="h-16 bg-white border-b px-4 md:px-6 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-700"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>

          <div className="relative ml-auto">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100"
            >
              <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center text-sm font-semibold">
                {userInitials}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-800">
                {userName}
              </span>
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

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>

        <footer className="h-12 bg-white border-t text-center text-gray-600 text-xs flex items-center justify-center select-none">
          &copy; {new Date().getFullYear()} IT Gesit. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
