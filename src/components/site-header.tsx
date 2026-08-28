"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoLockup } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/shop", label: "WeShop" },
  { href: "/events", label: "PopOuts" },
  { href: "/directory", label: "Directory" },
  { href: "/front-porch", label: "Front Porch" },
  { href: "/lovewell", label: "LoveWell" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-outline-variant bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-12">
        <Link href="/" onClick={() => setOpen(false)}>
          <LogoLockup wordmarkClassName="text-base md:text-lg" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${
                  active
                    ? "border-b-2 border-primary pb-1 text-primary"
                    : "text-on-surface-variant hover:text-secondary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/partner" className="text-sm font-semibold text-on-surface-variant hover:text-secondary">
            Partner With Us
          </Link>
          <Link href="/lovewell#join" className={buttonVariants("primary", "sm")}>
            Join LoveWell
          </Link>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="material-symbols-outlined">{open ? "close" : "menu"}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-outline-variant bg-surface px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/partner"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low"
            >
              Partner With Us
            </Link>
            <Link
              href="/lovewell#join"
              onClick={() => setOpen(false)}
              className={`${buttonVariants("primary", "md")} mt-2`}
            >
              Join LoveWell
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
