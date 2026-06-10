"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { loginUser } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthContext";
import { SITE_NAME } from "@/lib/constants";
import Button from "@/components/shared/Button";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registered = searchParams.get("registered");
  const returnUrl = searchParams.get("returnUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginUser(email, password);
      login(response.token, response as any);
      
      // Redirect based on role
      if (response.role === "admin") {
        router.push("/admin");
      } else if (response.role === "salonOwner") {
        router.push("/dashboard");
      } else {
        router.push(returnUrl);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 mt-16 lg:mt-0">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <a href="/" className="inline-block mb-6 text-3xl font-bold tracking-tight text-foreground">
            {SITE_NAME}
          </a>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-muted">
            Log in to manage your appointments and discover new salons.
          </p>
        </div>

        {registered && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Registration successful</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your account has been created. Please log in below.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 px-3 py-2 border border-border-light rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-foreground" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 px-3 py-2 border border-border-light rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-red-50 border border-red-200 p-4"
              >
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="ml-3 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full h-11 flex justify-center py-2 px-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <span className="flex items-center gap-2">
                Log in <ArrowRight size={18} />
              </span>
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted">
          Don't have an account?{" "}
          <a href="/signup" className="font-medium text-primary hover:text-primary-dark transition-colors">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
