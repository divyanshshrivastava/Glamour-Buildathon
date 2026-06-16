import { NavItem } from "@/types";

export const SITE_NAME = "Glamour";
export const SITE_TAGLINE = "Find Your Perfect Salon Experience";
export const SITE_DESCRIPTION =
  "Discover, compare, and book trusted salons near you in seconds. Premium salon marketplace with verified professionals and transparent pricing.";

export const NAV_ITEMS: NavItem[] = [
  { label: "Explore", href: "#explore" },
  { label: "Salons", href: "/salons" },
  { label: "AI Consultant", href: "/ai/beauty-consultant" },
  { label: "Services", href: "#services" },
  { label: "Reviews", href: "#reviews" },
  { label: "For Businesses", href: "/partner" },
];

export const FOOTER_LINKS = {
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Safety", href: "/safety" },
    { label: "Accessibility", href: "/accessibility" },
  ],
};

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com", icon: "Instagram" },
  { label: "Twitter", href: "https://twitter.com", icon: "Twitter" },
  { label: "Facebook", href: "https://facebook.com", icon: "Facebook" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "Linkedin" },
];

export const STATS = [
  { value: "10,000+", label: "Happy Customers" },
  { value: "500+", label: "Partner Salons" },
  { value: "50+", label: "Cities" },
  { value: "4.8", label: "Average Rating" },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Search",
    description:
      "Enter your location, preferred service, and date to find salons near you.",
    icon: "Search",
  },
  {
    step: 2,
    title: "Compare",
    description:
      "Browse ratings, reviews, pricing, and portfolios to find your perfect match.",
    icon: "SlidersHorizontal",
  },
  {
    step: 3,
    title: "Book",
    description:
      "Reserve your appointment instantly with transparent pricing and no hidden fees.",
    icon: "CalendarCheck",
  },
  {
    step: 4,
    title: "Enjoy",
    description:
      "Visit the salon, enjoy your experience, and leave a review for the community.",
    icon: "Sparkles",
  },
];

export const WHY_CHOOSE_US = [
  {
    title: "Verified Salons",
    description:
      "Every salon on our platform is personally vetted to ensure quality and professionalism.",
    icon: "ShieldCheck",
  },
  {
    title: "Real Reviews",
    description:
      "Authentic reviews from real customers help you make informed decisions.",
    icon: "MessageSquare",
  },
  {
    title: "Transparent Pricing",
    description:
      "See exact prices upfront. No hidden charges, no surprises at checkout.",
    icon: "Receipt",
  },
  {
    title: "Instant Booking",
    description:
      "Book your appointment in seconds with real-time availability updates.",
    icon: "Zap",
  },
  {
    title: "Trusted Professionals",
    description:
      "Work with experienced stylists and therapists who are passionate about their craft.",
    icon: "Award",
  },
  {
    title: "Premium Experience",
    description:
      "From discovery to checkout, every touchpoint is designed for your comfort.",
    icon: "Crown",
  },
];
