"use client";

import { usePathname } from "next/navigation";

export function ContentFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  return <main className={isAdmin ? "flex-1" : "flex-1 pt-20"}>{children}</main>;
}
