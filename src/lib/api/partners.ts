import { PartnerApplication } from "@/types";
import { apiFetch } from "./client";

export interface PartnerApplicationDTO {
  salonName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  message?: string;
}

/**
 * Submit a new partner application.
 *
 * Backend endpoint: POST /api/v1/partners/apply
 */
export async function submitPartnerApplication(
  data: PartnerApplicationDTO
): Promise<{ id: string; status: string; createdAt: string }> {
  return await apiFetch<{ id: string; status: string; createdAt: string }>("/partners/apply", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
