import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ToastProvider } from "@/components/shared/Toast";
import LayoutShell from "@/components/layout/LayoutShell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Glamour — Find Your Perfect Salon Experience",
    template: "%s | Glamour",
  },
  description:
    "Discover, compare, and book trusted salons near you in seconds. Premium salon marketplace with verified professionals and transparent pricing.",
  keywords: [
    "salon",
    "booking",
    "beauty",
    "haircut",
    "spa",
    "marketplace",
    "India",
  ],
  openGraph: {
    title: "Glamour — Find Your Perfect Salon Experience",
    description:
      "Discover, compare, and book trusted salons near you in seconds.",
    type: "website",
    locale: "en_IN",
    siteName: "Glamour",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          <ToastProvider>
            <LayoutShell>{children}</LayoutShell>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
