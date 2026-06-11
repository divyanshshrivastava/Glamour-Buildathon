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
  // The backend returns an array of applications in the `data` field, which apiFetchWithAuth unpacks.
  return await apiFetchWithAuth<PartnerApplication[]>(`/admin/applications${query}`, token);
}

export async function updateApplicationStatus(
  token: string,
  id: string,
  status: "approved" | "rejected",
  rejectionReason?: string
) {
  const action = status === "approved" ? "approve" : "reject";
  const endpoint = `/partners/${id}/${action}`; // Hits POST /api/v1/partners/:id/approve or /reject
  const body = status === "rejected" ? JSON.stringify({ reason: rejectionReason }) : undefined;
  
  return await apiFetchWithAuth<PartnerApplication>(endpoint, token, {
    method: "POST",
    body,
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
