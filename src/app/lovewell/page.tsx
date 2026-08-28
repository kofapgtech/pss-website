import Link from "next/link";
import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PlaceholderTile } from "@/components/placeholder-tile";
import { LeadForm } from "@/components/lead-form";
import { getPublishedOrganizations } from "@/lib/data/organizations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LoveWell",
  description:
    "LoveWell connects the Pride South Side community to care, discounts, exclusive events, and culturally relevant media.",
};

export default function LoveWellPage() {
  const partnerCount = getPublishedOrganizations().length;

  return (
    <>
      <Section className="pb-0 text-center">
        <Badge tone="primary" className="mx-auto mb-4">
          A Program of Pride South Side
        </Badge>
        <h1 className="mx-auto max-w-3xl font-heading text-4xl font-extrabold text-on-background md:text-5xl">
          Your Health, Community, and Culture — Centered.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-on-surface-variant">
          LoveWell connects you to affirming care, exclusive discounts and events, and culturally
          relevant storytelling — powered by a growing collective of {partnerCount}+ LGBTQ+
          serving and allied organizations.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="#join" className={buttonVariants("primary", "lg")}>
            Join LoveWell — It&apos;s Free
          </Link>
          <Link href="/directory" className={buttonVariants("secondary", "lg")}>
            Browse the Directory
          </Link>
        </div>
      </Section>

      {/* Bento preview */}
      <Section>
        <SectionHeader
          eyebrow="Preview"
          title="A sneak peek at your LoveWell hub"
          description="Member accounts are coming with the LoveWell app in Phase 2. Here's what's on the way."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="flex flex-col justify-center gap-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm md:col-span-8 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary-fixed px-3 py-1 text-on-primary-fixed">
                <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
                <span className="text-xs font-semibold">Priority Access</span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-on-background">
                Your Health, Centered.
              </h3>
              <p className="mt-3 text-on-surface-variant">
                Discover affirming providers in the LoveWell directory and connect with telehealth
                partners — no more searching alone.
              </p>
              <Link href="/directory" className={`${buttonVariants("primary", "md")} mt-6`}>
                <span className="material-symbols-outlined">calendar_month</span>
                Find a Provider
              </Link>
            </div>
            <PlaceholderTile
              seed="lovewell-health"
              icon="favorite"
              className="aspect-square w-full rounded-xl md:w-56"
            />
          </div>

          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm md:col-span-4">
            <h3 className="mb-6 font-heading text-xl font-bold text-on-background">Active Perks</h3>
            <ul className="flex flex-col gap-4">
              <PerkListItem
                icon="shopping_bag"
                tone="secondary"
                title="15% off at WeShop"
                description="Available on apparel and accessories from local vendors."
              />
              <PerkListItem
                icon="festival"
                tone="tertiary"
                title="Priority event access"
                description="Skip the line at featured PopOuts community events."
              />
            </ul>
          </div>

          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm md:col-span-6">
            <h3 className="mb-6 font-heading text-xl font-bold text-on-background">Care Checklist</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-r-xl border border-outline-variant/60 bg-surface p-4" style={{ borderLeft: "4px solid var(--color-secondary)" }}>
                <div>
                  <p className="text-sm font-semibold text-on-background">Annual wellness check</p>
                  <p className="text-xs text-secondary">Book with a LoveWell partner</p>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </div>
              <div className="flex items-center justify-between rounded-r-xl border border-outline-variant/60 bg-surface p-4" style={{ borderLeft: "4px solid var(--color-primary)" }}>
                <div>
                  <p className="text-sm font-semibold text-on-background">Explore LoveWell directory</p>
                  <p className="text-xs text-on-surface-variant">{partnerCount}+ partner organizations</p>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center overflow-hidden rounded-2xl bg-inverse-surface p-8 shadow-sm md:col-span-6">
            <div className="relative z-10 max-w-sm">
              <h3 className="mb-2 font-heading text-xl font-bold text-surface-bright">
                Take the Porch with you.
              </h3>
              <p className="mb-4 text-sm text-surface-variant">
                A Phase 2 LoveWell mobile app is coming — book care, track perks, and connect with
                community on the go.
              </p>
              <Badge tone="secondary">Coming in Phase 2</Badge>
            </div>
          </div>
        </div>
      </Section>

      {/* Value prop pillars */}
      <Section className="bg-surface-container-low">
        <SectionHeader eyebrow="Why LoveWell" title="Built on three pillars" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ValueCard icon="payments" title="Economics" description="Discounts, WeShop savings, and foot traffic driven back to community businesses." />
          <ValueCard icon="palette" title="Culture" description="Front Porch storytelling, live sessions, and events that celebrate who we are." />
          <ValueCard icon="health_and_safety" title="Health" description="A trusted directory of affirming care, from telehealth to wellness fairs." />
        </div>
      </Section>

      {/* Join form */}
      <Section id="join" className="max-w-2xl">
        <SectionHeader
          eyebrow="Get Started"
          title="Join LoveWell — it's free"
          description="Be first in line for perks, priority event access, and the LoveWell app when it launches."
        />
        <LeadForm
          type="lovewell-join"
          showPhone
          showMessage={false}
          submitLabel="Join LoveWell"
          successMessage="Welcome to LoveWell! We'll email you as new perks and events go live."
        />
      </Section>
    </>
  );
}

function PerkListItem({
  icon,
  tone,
  title,
  description,
}: {
  icon: string;
  tone: "secondary" | "tertiary";
  title: string;
  description: string;
}) {
  const bg = tone === "secondary" ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-tertiary-fixed text-on-tertiary-fixed";
  return (
    <li className="flex items-start gap-4 rounded-xl border border-outline-variant/50 bg-surface-container-low p-4">
      <div className={`mt-1 rounded-full p-2 ${bg}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-on-background">{title}</h4>
        <p className="text-sm text-on-surface-variant">{description}</p>
      </div>
    </li>
  );
}

function ValueCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center">
      <span className="material-symbols-outlined mb-4 text-4xl text-primary">{icon}</span>
      <h3 className="font-heading text-xl font-bold text-on-background">{title}</h3>
      <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
    </div>
  );
}
