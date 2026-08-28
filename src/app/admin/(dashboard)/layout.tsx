import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { AdminShell } from "@/components/admin/shell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const ok = await isAuthenticated();
  if (!ok) redirect("/admin/login");

  return <AdminShell>{children}</AdminShell>;
}
