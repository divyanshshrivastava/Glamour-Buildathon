"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthState, User } from "@/types";
import { getCurrentUser, refreshAccessToken } from "../api/auth";

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
        let token = localStorage.getItem("auth_token");

        if (token) {
          // Try fetching the current user with the stored access token
          let userData = await getCurrentUser(token);

          // If the access token is expired, attempt a silent refresh
          if (!userData) {
            const newToken = await refreshAccessToken();
            if (newToken) {
              token = newToken;
              localStorage.setItem("auth_token", token);
              userData = await getCurrentUser(token);
            }
          }

          if (userData) {
            setState({
              user: userData,
              token,
              isAuthenticated: true,
              isAdmin: userData.role === "admin",
              isSalonOwner: userData.role === "salonOwner",
              isLoading: false,
            });
            return;
          }
        }

        // No token or all attempts failed — clear everything
        localStorage.removeItem("auth_token");
        setState((prev) => ({ ...prev, isLoading: false }));
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
