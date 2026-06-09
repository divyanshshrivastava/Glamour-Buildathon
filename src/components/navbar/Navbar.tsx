"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";
import Button from "@/components/shared/Button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
              <Button variant="ghost" size="sm">
                Log in
              </Button>
              <Button variant="primary" size="sm">
                Sign Up
              </Button>
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
                </div>
              </div>

              <div className="p-6 border-t border-border-light space-y-3">
                <Button variant="outline" size="md" className="w-full">
                  Log in
                </Button>
                <Button variant="primary" size="md" className="w-full">
                  Sign Up
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
