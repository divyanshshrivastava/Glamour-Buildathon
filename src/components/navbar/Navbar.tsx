"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/shared/Toast";
import { getInitials } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdmin, isSalonOwner, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    showToast("You've been logged out successfully", "info");
    router.push("/");
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-sm shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container-page">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                {SITE_NAME}
              </span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-muted hover:text-foreground transition-colors duration-200"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {!isLoading && (
                isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium shadow-sm">
                        {user.firstName ? getInitials(`${user.firstName} ${user.lastName || ''}`) : <UserIcon size={20} />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border-light overflow-hidden z-50"
                          >
                            <div className="px-4 py-3 border-b border-border-light bg-accent/10">
                              <p className="text-sm font-medium text-foreground truncate">
                                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}
                              </p>
                              <p className="text-xs text-muted truncate">{user.email}</p>
                            </div>
                            <div className="p-1">
                              {isAdmin && (
                                <a
                                  href="/admin"
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/30 rounded-lg transition-colors"
                                >
                                  <LayoutDashboard size={16} />
                                  Admin Panel
                                </a>
                              )}
                              {isSalonOwner && (
                                <a
                                  href="/dashboard"
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/30 rounded-lg transition-colors"
                                >
                                  <LayoutDashboard size={16} />
                                  Salon Dashboard
                                </a>
                              )}
                              <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                              >
                                <LogOut size={16} />
                                Log out
                              </button>
                            </div>
                          </motion.div>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setUserMenuOpen(false)}
                          />
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" href="/login">
                      Log in
                    </Button>
                    <Button variant="primary" size="sm" href="/signup">
                      Sign Up
                    </Button>
                  </>
                )
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-foreground hover:bg-accent/50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl lg:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <span className="text-xl font-bold tracking-tight">
                  {SITE_NAME}
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 hover:bg-accent/50 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6">
                <div className="flex flex-col gap-1 px-4">
                  {NAV_ITEMS.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-base font-medium text-foreground hover:bg-accent/30 rounded-lg transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                  
                  {isAuthenticated && isAdmin && (
                    <a
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-base font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors mt-4 border-t border-border-light pt-6"
                    >
                      <LayoutDashboard size={20} />
                      Admin Panel
                    </a>
                  )}
                  {isAuthenticated && isSalonOwner && (
                    <a
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-base font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors mt-4 border-t border-border-light pt-6"
                    >
                      <LayoutDashboard size={20} />
                      Salon Dashboard
                    </a>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-border-light space-y-3">
                {!isLoading && (
                  isAuthenticated && user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-2">
                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-medium shadow-sm">
                          {user.firstName ? getInitials(`${user.firstName} ${user.lastName || ''}`) : <UserIcon size={24} />}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}
                          </p>
                          <p className="text-sm text-muted">{user.email}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="md" 
                        className="w-full justify-start text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600"
                        onClick={() => {
                          handleLogout();
                          setMobileOpen(false);
                        }}
                      >
                        <LogOut size={18} />
                        Log out
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button variant="outline" size="md" className="w-full" href="/login" onClick={() => setMobileOpen(false)}>
                        Log in
                      </Button>
                      <Button variant="primary" size="md" className="w-full" href="/signup" onClick={() => setMobileOpen(false)}>
                        Sign Up
                      </Button>
                    </>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
