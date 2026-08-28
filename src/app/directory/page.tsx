import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { LogoMonogram } from "@/components/placeholder-tile";
import { CategoryFilter } from "@/components/category-filter";
import { LeadForm } from "@/components/lead-form";
import { getPublishedOrganizations } from "@/lib/data/organizations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LoveWell Directory",
  description:
    "A living directory of LGBTQ+ serving and allied organizations bringing health, economic, and cultural resources to the South and Southwest Sides of Chicago.",
};

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const organizations = getPublishedOrganizations();
  const featured = organizations.filter((o) => o.tier === "featured");
  const categories = Array.from(new Set(organizations.map((o) => o.category))).sort();
  const filtered = category ? organizations.filter((o) => o.category === category) : organizations;

  return (
    <>
      <Section className="pb-0 text-center">
        <Badge tone="primary" className="mx-auto mb-4">
          Phase 1 · Founding Directory
        </Badge>
        <h1 className="mx-auto max-w-3xl font-heading text-4xl font-extrabold text-on-background md:text-5xl">
          The LoveWell Directory
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-on-surface-variant">
          A collective of LGBTQ+ serving and allied organizations bringing health, economic, and
          cultural resources to the South and Southwest Sides of Chicago.
        </p>
      </Section>

      {featured.length > 0 && (
        <Section>
          <SectionHeader eyebrow="Featured Partners" title="Founding LoveWell partners" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featured.map((org) => (
              <div
                key={org.id}
                className="flex flex-col gap-4 rounded-xl border-2 border-primary-fixed bg-surface-container-lowest p-6 shadow-sm sm:flex-row"
              >
                <LogoMonogram seed={org.seed} name={org.name} className="h-16 w-16 shrink-0 text-lg" />
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-xl font-bold text-on-background">{org.name}</h3>
                    <Badge tone="primary">Featured</Badge>
                  </div>
                  <p className="text-sm font-semibold text-secondary">{org.category}</p>
                  <p className="mt-2 text-sm text-on-surface-variant">{org.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {org.tags.map((tag) => (
                      <Badge key={tag} tone="neutral">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {org.website && (
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-secondary"
                    >
                      Visit website <span className="material-symbols-outlined text-sm">north_east</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section className="bg-surface-container-low">
        <SectionHeader
          eyebrow="Full Directory"
          title="Every LoveWell partner"
          description="Starter profiles are populated by the PSS team for every past festival organizational participant. Reach out below to claim and upgrade yours."
        />
        <div className="mb-8">
          <CategoryFilter basePath="/directory" options={categories} active={category} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((org) => (
            <div
              key={org.id}
              className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <LogoMonogram seed={org.seed} name={org.name} className="h-11 w-11 shrink-0 text-sm" />
                <Badge tone={org.tier === "featured" ? "primary" : "neutral"}>
                  {org.tier === "featured" ? "Featured" : "Starter Profile"}
                </Badge>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-on-background">{org.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                  {org.category}
                </p>
              </div>
              <p className="line-clamp-3 text-sm text-on-surface-variant">{org.description}</p>
              <p className="mt-auto flex items-center gap-1 text-xs text-outline">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {org.location}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="upgrade" className="max-w-2xl">
        <SectionHeader
          eyebrow="For Organizations"
          title="Upgrade to a Featured listing"
          description="Featured LoveWell partners get top placement, push notifications to 10,000+ Pride South Side followers, and inclusion in storytelling and event placement. $1,000/month."
        />
        <LeadForm
          type="directory-upgrade"
          showOrganization
          showPhone
          messageLabel="Anything else we should know?"
          submitLabel="Request an Upgrade"
          successMessage="Thanks! Our partnerships team will follow up about featuring your organization."
        />
      </Section>
    </>
  );
}
