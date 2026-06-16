// ─── AI Beauty Consultant ────────────────────────────────────────────

export interface BeautyProfile {
  faceShape: string;
  skinTone: string;
  hairLength: string;
  hairTexture: string;
  styleCharacteristics: string[];
}

export interface BeautyRecommendation {
  name: string;
  explanation: string;
  confidence: number;
  relatedServices: string[];
  category: "hairstyle" | "color" | "treatment" | "grooming" | "occasion";
}

export interface BeautyConsultResult {
  profile: BeautyProfile;
  recommendations: BeautyRecommendation[];
  matchedSalons: AIMatchedSalon[];
}

export interface AIMatchedSalon {
  id: string;
  name: string;
  rating: number;
  city: string;
  coverImage: string;
  matchedServices: {
    id: string;
    name: string;
    price: number;
    duration: string;
  }[];
}

// ─── AI Concierge Search ─────────────────────────────────────────────

export interface ConciergeUnderstood {
  serviceType: string | null;
  budget: { min: number | null; max: number | null };
  date: string | null;
  time: string | null;
  location: string | null;
  ratingPreference: number | null;
  urgency: string | null;
  additionalPreferences: string[];
}

export interface ConciergeResult {
  understood: ConciergeUnderstood;
  results: ConciergeSearchResult[];
  aiRecommendation: string;
}

export interface ConciergeSearchResult {
  id: string;
  name: string;
  slug: string;
  rating: number;
  reviewCount: number;
  city: string;
  coverImage: string;
  startingPrice: number;
  matchedServices: {
    id: string;
    name: string;
    price: number;
    duration: string;
  }[];
  aiScore: number;
  aiReason: string;
}

// ─── AI Review Intelligence ──────────────────────────────────────────

export interface ReviewInsights {
  whatCustomersLove: string[];
  commonComplaints: string[];
  strengthAreas: string[];
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  summary: string;
  cachedAt?: string;
}

export interface ReviewQAResult {
  answer: string;
  relevantReviews: {
    id: string;
    text: string;
    rating: number;
    authorName: string;
  }[];
}

// ─── AI Marketing Assistant ──────────────────────────────────────────

export interface MarketingInput {
  service: string;
  offer?: string;
  discount?: string;
  targetAudience?: string;
  occasion?: string;
  businessGoal?: string;
  tone: "premium" | "luxury" | "friendly" | "professional" | "trendy" | "festive";
  platforms: ("instagram" | "facebook" | "whatsapp")[];
}

export interface MarketingContent {
  platform: string;
  text: string;
  hashtags: string[];
  imagePrompt: string;
}

export interface MarketingResult {
  contents: MarketingContent[];
}

export interface MarketingRefineInput {
  originalContent: string;
  action: "rewrite" | "shorten" | "expand" | "more_premium" | "more_persuasive";
  platform: string;
}

// ─── AI Business Insights ────────────────────────────────────────────

export interface BusinessInsight {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: "revenue" | "operations" | "marketing" | "pricing";
}

export interface PricingRecommendation {
  serviceName: string;
  currentPrice: number;
  suggestedPrice: number;
  reasoning: string;
  action: "increase" | "decrease" | "bundle" | "keep";
}

export interface RevenueOpportunity {
  title: string;
  description: string;
  estimatedRevenue: string;
  effort: "low" | "medium" | "high";
}

export interface BusinessInsightsResult {
  insights: BusinessInsight[];
  pricingRecommendations: PricingRecommendation[];
  revenueOpportunities: RevenueOpportunity[];
  demandForecast: {
    highDemandPeriods: string[];
    lowDemandPeriods: string[];
    seasonalOpportunities: string[];
  };
  actionItems: string[];
  metrics: {
    totalBookings: number;
    totalRevenue: number;
    cancellationRate: number;
    repeatCustomerRate: number;
    averageBookingValue: number;
  };
}

// ─── AI No-Show Predictor ────────────────────────────────────────────

export interface NoShowRisk {
  bookingId: string;
  riskLevel: "low" | "medium" | "high";
  probability: number;
  explanation: string;
  recommendedActions: string[];
}

export interface NoShowOverview {
  totalUpcoming: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  revenueAtRisk: number;
  bookingRisks: NoShowRisk[];
}
