"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className={`min-h-[calc(100vh-4rem)] pb-20 md:pb-0`}>
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
