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
}) {
  return await apiFetch<{
    id: string;
    email: string;
    role: string;
    createdAt: string;
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

export async function logoutUser(token: string) {
  try {
    await apiFetchWithAuth("/auth/logout", token, {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout failed on server:", error);
  }
}
