"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthState, User } from "@/types";
import { getCurrentUser } from "../api/auth";

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isAdmin: false,
    isSalonOwner: false,
    isLoading: true,
  });

  // Initialize auth state from local storage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("auth_token");
        
        if (storedToken) {
          // Verify token and get fresh user data from backend
          const userData = await getCurrentUser(storedToken);
          
          if (userData) {
            setState({
              user: userData,
              token: storedToken,
              isAuthenticated: true,
              isAdmin: userData.role === "admin",
              isSalonOwner: userData.role === "salonOwner",
              isLoading: false,
            });
          } else {
            // Token invalid or expired
            localStorage.removeItem("auth_token");
            setState((prev) => ({ ...prev, isLoading: false }));
          }
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        localStorage.removeItem("auth_token");
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem("auth_token", token);
    setState({
      user,
      token,
      isAuthenticated: true,
      isAdmin: user.role === "admin",
      isSalonOwner: user.role === "salonOwner",
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isSalonOwner: false,
      isLoading: false,
    });
  };

  const updateUser = (updates: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
      isAdmin: (updates.role || prev.user?.role) === "admin",
      isSalonOwner: (updates.role || prev.user?.role) === "salonOwner",
    }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
