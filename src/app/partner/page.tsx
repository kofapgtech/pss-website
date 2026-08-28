import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { LeadForm } from "@/components/lead-form";

export const metadata: Metadata = {
  title: "Partner With LoveWell",
  description:
    "Partner with LoveWell to reach 10,000+ Pride South Side followers through directory listings, storytelling, event placement, and service referrals.",
};

const TIERS = [
  {
    id: "directory",
    icon: "diversity_3",
    name: "Directory of Services",
    price: "$1,000",
    unit: "/ month",
    description: "Brand, location, interests, and push notifications inside the LoveWell Directory.",
    features: [
      "Featured placement in the LoveWell Directory",
      "Push notifications to the PSS audience",
      "Conversion tracking on profile engagement",
      "Upgrade path from your free starter profile",
    ],
    tone: "primary" as const,
  },
  {
    id: "storytelling",
    icon: "movie",
    name: "Storytelling",
    price: "$500–$2,000",
    unit: "/ package",
    description: "Articles, videos, and promotions on The Front Porch, priced by subscription tier.",
    features: [
      "Feature article or video on The Front Porch",
      "Cross-promotion across PSS social channels",
      "Tiny Porch Concerts / Tiny-Desk style features",
      "Pricing scales with package tier",
    ],
    tone: "secondary" as const,
  },
  {
    id: "events",
    icon: "calendar_month",
    name: "Event Placement & Curation",
    price: "$500–$1,000",
    unit: "/ event",
    description: "Get your event curated and promoted on the PopOuts community calendar.",
    features: [
      "Featured placement on PopOuts",
      "Promotion to the PSS mailing list & socials",
      "Pricing scales with event size & scope",
    ],
    tone: "tertiary" as const,
  },
  {
    id: "referral",
    icon: "share",
    name: "Service Referral",
    price: "$500",
    unit: "/ integration",
    description: "Integrate your service offerings into PSS and PSS partner events.",
    features: [
      "Service integration into PSS programming",
      "Warm referrals from the PSS/LoveWell team",
      "Visibility at PSS partner events",
    ],
    tone: "primary" as const,
  },
];

const toneClasses: Record<string, string> = {
  primary: "bg-primary-fixed text-on-primary-fixed",
  secondary: "bg-secondary-fixed text-on-secondary-fixed",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed",
};

export default function PartnerPage() {
  return (
    <>
      <Section className="pb-0 text-center">
        <Badge tone="secondary" className="mx-auto mb-4">
          For Organizations
        </Badge>
        <h1 className="mx-auto max-w-3xl font-heading text-4xl font-extrabold text-on-background md:text-5xl">
          Partner With LoveWell
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-on-surface-variant">
          Reach 10,000+ Pride South Side followers across social, email, and phone. Partners in
          LoveWell play a central role in the growth and scale of the festival.
        </p>
      </Section>

      <Section className="pb-0">
        <div className="rounded-2xl border border-primary-fixed bg-primary-container px-6 py-10 text-center text-on-primary-container md:px-16">
          <p className="text-xs font-bold uppercase tracking-widest opacity-90">Launch Goal</p>
          <p className="mt-3 font-heading text-3xl font-extrabold md:text-4xl">
            20 Directory Subscribers in 4 Weeks
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-90">
            20 organizations at the $1,000/month Directory of Services tier generates a baseline
            of $20,000 in monthly recurring revenue — reinvested directly into the community.
          </p>
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow="Revenue Tiers" title="Ways to partner with LoveWell" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              id={tier.id === "storytelling" ? "storytelling" : undefined}
              className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-8"
            >
              <div className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 ${toneClasses[tier.tone]}`}>
                <span className="material-symbols-outlined text-[18px]">{tier.icon}</span>
                <span className="text-xs font-semibold">{tier.name}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-3xl font-extrabold text-on-background">{tier.price}</span>
                <span className="text-sm text-on-surface-variant">{tier.unit}</span>
              </div>
              <p className="text-sm text-on-surface-variant">{tier.description}</p>
              <ul className="mt-2 flex flex-col gap-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-on-surface">
                    <span className="material-symbols-outlined mt-0.5 text-base text-primary">check</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-surface-container-low">
        <SectionHeader eyebrow="Timeline" title="What's next" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TimelineCard icon="rocket_launch" date="September 8, 2026" title="Soft Site Launch" description="The updated LoveWell website goes live as the digital hub for the collective." />
          <TimelineCard icon="handshake" date="September 30, 2026" title="Partners Finalized" description="Founding directory partners are confirmed and featured across LoveWell." />
        </div>
      </Section>

      <Section className="max-w-2xl">
        <SectionHeader
          eyebrow="Get Started"
          title="Tell us about your organization"
          description="Our partnerships team will follow up to walk through tiers, pricing, and next steps."
        />
        <LeadForm
          type="partner-inquiry"
          showOrganization
          showPhone
          metaOptions={TIERS.map((t) => `${t.name} (${t.price}${t.unit})`)}
          metaLabel="Which partnership tier are you interested in?"
          messageLabel="Tell us about your organization"
          submitLabel="Request Partnership Info"
          successMessage="Thanks! Our partnerships team will reach out to walk you through next steps."
        />
      </Section>
    </>
  );
}

function TimelineCard({
  icon,
  date,
  title,
  description,
}: {
  icon: string;
  date: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
      <span className="material-symbols-outlined text-3xl text-primary">{icon}</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-secondary">{date}</p>
        <h3 className="font-heading text-lg font-bold text-on-background">{title}</h3>
        <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
      </div>
    </div>
  );
}
