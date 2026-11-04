import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/admin-header";

export const metadata: Metadata = {
  title: "Admin | KØDEX",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminHeader />
      <main>{children}</main>
    </div>
  );
}
