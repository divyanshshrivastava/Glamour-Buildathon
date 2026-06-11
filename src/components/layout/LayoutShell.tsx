"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

/** Routes that use their own sidebar layout — hide the global Navbar & Footer */
const DASHBOARD_ROUTES = ["/admin", "/dashboard"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDashboard = DASHBOARD_ROUTES.some((route) => pathname.startsWith(route));

  if (isDashboard) {
    // Dashboard / admin pages render only the children (they have their own sidebar)
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
