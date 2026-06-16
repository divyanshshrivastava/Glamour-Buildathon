import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Features — Glamour",
  description:
    "AI-powered beauty tools to help you discover the perfect style, find the right salon, and book with confidence.",
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
