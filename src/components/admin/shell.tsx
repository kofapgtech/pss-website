"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { LogoLockup } from "@/components/logo";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/organizations", label: "LoveWell Directory", icon: "diversity_3" },
  { href: "/admin/events", label: "PopOuts Events", icon: "calendar_month" },
  { href: "/admin/shop", label: "WeShop", icon: "storefront" },
  { href: "/admin/front-porch", label: "The Front Porch", icon: "movie" },
  { href: "/admin/leads", label: "Leads Inbox", icon: "inbox" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full bg-surface-container-low">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest lg:flex">
        <div className="flex h-20 items-center border-b border-outline-variant px-6">
          <LogoLockup wordmarkClassName="text-sm" markClassName="h-8 w-8" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {NAV.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-primary-fixed text-on-primary-fixed"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-outline-variant p-4">
          <Link href="/" className="mb-2 flex items-center gap-2 px-3 py-2 text-sm text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined text-xl">public</span>
            View live site
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 lg:hidden">
          <LogoLockup wordmarkClassName="text-sm" markClassName="h-8 w-8" />
          <form action={logoutAction}>
            <button type="submit" className="text-sm font-semibold text-on-surface-variant">
              Log out
            </button>
          </form>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-outline-variant bg-surface-container-lowest px-4 py-2 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
