import { User } from "@/types";
import { apiFetch, apiFetchWithAuth } from "./client";

export async function loginUser(email: string, password: string) {
  const response = await apiFetch<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: "customer" | "salonOwner" | "admin";
    salonId: string | null;
    city: string | null;
    token: string;
    refreshToken: string;
    expiresIn: number;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  
  return response;
}

export async function registerUser(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
}) {
  return await apiFetch<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: "customer" | "salonOwner" | "admin";
    salonId: string | null;
    city: string | null;
    token: string;
    refreshToken: string;
    expiresIn: number;
  }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCurrentUser(token: string) {
  try {
    const user = await apiFetchWithAuth<User>("/auth/me", token);
    return user;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
}

/**
 * Call POST /auth/refresh.
 * The refresh_token httpOnly cookie is sent automatically via credentials: 'include'.
 * Returns the new access token string, or null on failure.
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const data = await apiFetch<{ token: string; expiresIn: number }>(
      "/auth/refresh",
      { method: "POST" },
    );
    return data.token;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
}

export async function logoutUser(token: string) {
  try {
    await apiFetchWithAuth("/auth/logout", token, {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout failed on server:", error);
  }
}

