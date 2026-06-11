"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Star,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { useToast } from "@/components/shared/Toast";

const DASHBOARD_NAV = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Bookings", href: "/dashboard/bookings", icon: Calendar },
  { name: "Services", href: "/dashboard/services", icon: Scissors },
  { name: "Reviews", href: "/dashboard/reviews", icon: Star },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout, isSalonOwner, isAdmin } =
    useAuth();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!isAuthenticated) {
        router.push("/login?returnUrl=/dashboard");
      } else if (!isSalonOwner && !isAdmin) {
        router.push("/");
      }
    }
  }, [mounted, isLoading, isAuthenticated, isSalonOwner, isAdmin, router]);

  // Prevent flash of content while checking auth
  if (!mounted || isLoading || !isAuthenticated || (!isSalonOwner && !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          <p className="text-sm text-gray-500 font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-violet-950 text-white z-40 hidden lg:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <a
            href="/"
            className="text-2xl font-bold tracking-tight text-white flex items-center gap-2"
          >
            {SITE_NAME}
          </a>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 bg-violet-500/20 text-violet-300 rounded-full uppercase tracking-wider font-semibold border border-violet-500/30">
              Salon Dashboard
            </span>
          </div>
        </div>

        {/* Owner info */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 font-semibold text-sm border border-violet-500/30">
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "S"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ""}`
                  : user?.email}
              </p>
              <p className="text-xs text-gray-400 truncate">Salon Owner</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {DASHBOARD_NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href) && item.href !== "/dashboard");
            const Icon = item.icon;

            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">Back to site</span>
          </a>
          <button
            onClick={() => {
              logout();
              showToast("You've been logged out successfully", "info");
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-violet-950 text-white z-50 lg:hidden transform transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <span className="text-xl font-bold">{SITE_NAME}</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="px-4 py-6 space-y-1">
          {DASHBOARD_NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href) && item.href !== "/dashboard");
            const Icon = item.icon;

            return (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </a>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 space-y-1">
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">Back to site</span>
          </a>
          <button
            onClick={() => {
              logout();
              showToast("You've been logged out successfully", "info");
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gradient-to-r from-gray-900 to-violet-950 text-white p-4 sticky top-0 z-30 flex items-center justify-between shadow-lg">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu size={22} />
          </button>
          <span className="text-lg font-bold">{SITE_NAME}</span>
          <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 font-semibold text-sm border border-violet-500/30">
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "S"}
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
