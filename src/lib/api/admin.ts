import { DashboardStats, Salon, PartnerApplication, User } from "@/types";
import { apiFetchWithAuth } from "./client";

export async function getDashboardStats(token: string) {
  return await apiFetchWithAuth<DashboardStats>("/admin/dashboard/stats", token);
}

export async function getAdminSalons(token: string, page = 1, limit = 50) {
  return await apiFetchWithAuth<{
    salons: Salon[];
    pagination: any;
  }>(`/salons?page=${page}&limit=${limit}`, token);
}

export async function getPartnerApplications(token: string, status?: string) {
  const query = status ? `?status=${status}` : "";
  return await apiFetchWithAuth<{
    applications: PartnerApplication[];
    pagination: any;
  }>(`/admin/applications${query}`, token);
}

export async function updateApplicationStatus(
  token: string,
  id: string,
  status: "approved" | "rejected",
  rejectionReason?: string
) {
  return await apiFetchWithAuth<PartnerApplication>(`/admin/applications/${id}`, token, {
    method: "PUT",
    body: JSON.stringify({ status, rejectionReason }),
  });
}

export async function verifySalon(token: string, id: string) {
  return await apiFetchWithAuth<Salon>(`/admin/salons/${id}/verify`, token, {
    method: "PUT",
  });
}

export async function deleteSalon(token: string, id: string) {
  return await apiFetchWithAuth<{ message: string }>(`/admin/salons/${id}`, token, {
    method: "DELETE",
  });
}
