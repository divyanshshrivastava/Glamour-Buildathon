"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { 
  LayoutDashboard, 
  Store, 
  Calendar, 
  Star, 
  FileText, 
  Users,
  LogOut,
  ChevronLeft
} from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

const ADMIN_NAV = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Salons", href: "/admin/salons", icon: Store },
  { name: "Applications", href: "/admin/applications", icon: FileText },
  // Future pages:
  // { name: "Bookings", href: "/admin/bookings", icon: Calendar },
  // { name: "Reviews", href: "/admin/reviews", icon: Star },
  // { name: "Users", href: "/admin/users", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout, isAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!isAuthenticated) {
        router.push("/login?returnUrl=/admin");
      } else if (!isAdmin) {
        // Not an admin, redirect to home
        router.push("/");
      }
    }
  }, [mounted, isLoading, isAuthenticated, isAdmin, router]);

  // Prevent flash of content while checking auth
  if (!mounted || isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white z-40 hidden lg:block">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-800">
            <a href="/" className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {SITE_NAME}
              <span className="text-xs px-2 py-1 bg-primary/20 text-primary-light rounded-full uppercase tracking-wider font-semibold">
                Admin
              </span>
            </a>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {ADMIN_NAV.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
              const Icon = item.icon;
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-primary text-white" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </a>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-800 space-y-2">
            <a 
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="font-medium">Back to site</span>
            </a>
            <button 
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gray-900 text-white p-4 sticky top-0 z-30 flex items-center justify-between">
          <span className="text-xl font-bold">{SITE_NAME} Admin</span>
          {/* Add mobile menu toggle here if needed */}
        </div>
        
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
