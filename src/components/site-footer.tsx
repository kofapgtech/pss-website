"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoLockup } from "@/components/logo";
import { NewsletterForm } from "@/components/newsletter-form";

const EXPLORE_LINKS = [
  { href: "/shop", label: "WeShop" },
  { href: "/events", label: "PopOuts Events" },
  { href: "/directory", label: "LoveWell Directory" },
  { href: "/front-porch", label: "The Front Porch" },
  { href: "/lovewell", label: "LoveWell" },
];

const PARTNER_LINKS = [
  { href: "/partner", label: "Partner With LoveWell" },
  { href: "/directory#upgrade", label: "Upgrade Your Listing" },
  { href: "mailto:events@pridesouthside.org?subject=Submit%20an%20Event", label: "Submit an Event" },
  { href: "/admin", label: "Staff Admin" },
];

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="w-full bg-inverse-surface px-4 py-16 md:px-12 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <LogoLockup tone="dark" wordmarkClassName="text-lg" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-surface-variant">
              LoveWell is a program of Pride South Side, organizing a collective of LGBTQ+ serving
              and allied organizations bringing health, economic, and cultural resources to the
              South and Southwest Sides of Chicago.
            </p>
            <p className="mt-4 text-sm text-surface-variant">Join our mailing list</p>
            <div className="mt-3">
              <NewsletterForm tone="dark" />
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-6">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary-fixed-dim">
              Explore
            </h3>
            <ul className="flex flex-col gap-3">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-surface-variant transition-colors hover:text-secondary-container"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary-fixed-dim">
              Partners &amp; Staff
            </h3>
            <ul className="flex flex-col gap-3">
              {PARTNER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-surface-variant transition-colors hover:text-secondary-container"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary-fixed-dim">
              Connect
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="https://www.instagram.com/pridesouthside/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-surface-variant transition-colors hover:text-secondary-container"
                >
                  @PrideSouthSide on Instagram
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@pridesouthside.org"
                  className="text-sm text-surface-variant transition-colors hover:text-secondary-container"
                >
                  hello@pridesouthside.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-surface-variant/20 pt-8 text-xs text-surface-variant md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Pride South Side. LoveWell is a program of Pride South
            Side, a fiscal program of the Center on Halsted.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-secondary-container">
              Privacy Policy
            </Link>
            <Link href="/partner" className="hover:text-secondary-container">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
