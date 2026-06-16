/**
 * Frontend API client for all AI features.
 * Communicates with the Express backend's /api/v1/ai/* endpoints.
 */

import type {
  BeautyConsultResult,
  ConciergeResult,
  ReviewInsights,
  ReviewQAResult,
  MarketingInput,
  MarketingResult,
  MarketingRefineInput,
  MarketingContent,
  BusinessInsightsResult,
  NoShowRisk,
  NoShowOverview,
} from "@/types/ai";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

// ── Helper ────────────────────────────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// ── 1. Beauty Consultant ──────────────────────────────────────────────

export async function analyzeBeauty(
  imageFile: File
): Promise<BeautyConsultResult> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const res = await fetch(`${API_BASE_URL}/ai/beauty-consultant`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Analysis failed (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

// ── 2. Concierge Search ──────────────────────────────────────────────

export async function conciergeSearch(query: string): Promise<ConciergeResult> {
  const res = await fetch(`${API_BASE_URL}/ai/concierge-search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Search failed (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

// ── 3. Review Intelligence ───────────────────────────────────────────

export async function getReviewInsights(
  salonId: string
): Promise<ReviewInsights> {
  const res = await fetch(
    `${API_BASE_URL}/ai/review-insights/${salonId}`,
    { credentials: "include" }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to load insights (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

export async function askReviewQuestion(
  salonId: string,
  question: string
): Promise<ReviewQAResult> {
  const res = await fetch(`${API_BASE_URL}/ai/review-qa/${salonId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `QA failed (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

// ── 4. Marketing Assistant ───────────────────────────────────────────

export async function generateMarketing(
  input: MarketingInput
): Promise<MarketingResult> {
  const res = await fetch(`${API_BASE_URL}/ai/marketing/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(input),
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Generation failed (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

export async function refineMarketing(
  input: MarketingRefineInput
): Promise<MarketingContent> {
  const res = await fetch(`${API_BASE_URL}/ai/marketing/refine`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(input),
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Refinement failed (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

// ── 5. Business Insights ─────────────────────────────────────────────

export async function getBusinessInsights(
  salonId: string
): Promise<BusinessInsightsResult> {
  const res = await fetch(
    `${API_BASE_URL}/ai/business-insights/${salonId}`,
    {
      headers: { ...getAuthHeaders() },
      credentials: "include",
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to load insights (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

// ── 6. No-Show Predictor ─────────────────────────────────────────────

export async function getBookingRisk(
  bookingId: string
): Promise<NoShowRisk> {
  const res = await fetch(
    `${API_BASE_URL}/ai/no-show-risk/${bookingId}`,
    {
      headers: { ...getAuthHeaders() },
      credentials: "include",
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Risk check failed (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

export async function getSalonRiskOverview(
  salonId: string
): Promise<NoShowOverview> {
  const res = await fetch(
    `${API_BASE_URL}/ai/no-show-risk/salon/${salonId}`,
    {
      headers: { ...getAuthHeaders() },
      credentials: "include",
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Risk overview failed (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}
