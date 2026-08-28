import Link from "next/link";
import { Section, SectionHeader } from "@/components/ui/section";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlaceholderTile } from "@/components/placeholder-tile";
import { getUpcomingEvents } from "@/lib/data/events";
import { getPublishedOrganizations } from "@/lib/data/organizations";
import { getPublishedProducts, getPublishedVendors } from "@/lib/data/shop";
import { getPublishedStories } from "@/lib/data/stories";
import { formatEventDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const events = getUpcomingEvents().slice(0, 3);
  const organizations = getPublishedOrganizations();
  const vendors = getPublishedVendors();
  const products = getPublishedProducts();
  const stories = getPublishedStories().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden px-4 py-20 md:px-12">
        <div className="absolute inset-0 z-0">
          <PlaceholderTile seed="pss-hero" className="h-full w-full" dotPattern />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        </div>
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
          <Badge tone="secondary" className="mb-6">
            LoveWell · A Program of Pride South Side
          </Badge>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-on-background sm:text-5xl md:text-6xl">
            The Front Porch of the South Side.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-on-surface-variant md:text-xl">
            A vibrant, intersectional space celebrating community, commerce, and care — connecting
            the South and Southwest Sides of Chicago to health, economic, and cultural resources.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/events" className={buttonVariants("primary", "lg")}>
              Explore Upcoming Events
            </Link>
            <Link href="/shop" className={buttonVariants("secondary", "lg")}>
              Shop Local Vendors
            </Link>
          </div>
        </div>
      </section>

      {/* Milestone strip */}
      <div className="w-full border-y border-outline-variant bg-surface-container-low px-4 py-4 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 text-sm font-semibold text-on-surface-variant sm:flex-row sm:gap-8">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">rocket_launch</span>
            Soft Site Launch — September 8
          </span>
          <span className="hidden h-4 w-px bg-outline-variant sm:block" />
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">handshake</span>
            Partners Finalized — September 30
          </span>
          <span className="hidden h-4 w-px bg-outline-variant sm:block" />
          <Link href="/partner" className="flex items-center gap-2 text-primary hover:text-secondary">
            <span className="material-symbols-outlined">arrow_forward</span>
            Become a Founding Partner
          </Link>
        </div>
      </div>

      {/* Three pillars */}
      <Section>
        <SectionHeader
          eyebrow="What's on the porch"
          title="Three pillars, one community."
          description="LoveWell brings together commerce, culture, and care so the South and Southwest Sides always have somewhere to land."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <PillarCard
            href="/shop"
            icon="storefront"
            eyebrow="Pillar 1"
            title="WeShop"
            description="Shop past festival vendors — local, queer, and allied creators. Revenue supports year-round community programs."
            stat={`${vendors.length} vendors · ${products.length} products`}
            seed="pillar-shop"
          />
          <PillarCard
            href="/events"
            icon="calendar_month"
            eyebrow="Pillar 2"
            title="PopOuts"
            description="A community calendar of meetups, wellness fairs, and cultural events across the South Side — curated by the PSS team."
            stat={`${events.length}+ upcoming events`}
            seed="pillar-events"
          />
          <PillarCard
            href="/directory"
            icon="diversity_3"
            eyebrow="Pillar 3"
            title="LoveWell Directory"
            description="A living directory of LGBTQ+ serving and allied organizations bringing care, culture, and resources to our community."
            stat={`${organizations.length} partner organizations`}
            seed="pillar-directory"
          />
        </div>
      </Section>

      {/* Upcoming events */}
      {events.length > 0 && (
        <Section className="bg-surface-container-low">
          <SectionHeader
            eyebrow="PopOuts"
            title="Upcoming gatherings"
            description="From block parties to health fairs — see what's happening on the South Side."
            action={
              <Link href="/events" className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">
                View full calendar <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            }
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href="/events"
                className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <PlaceholderTile seed={event.seed} icon="calendar_today" className="aspect-video" />
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge tone="secondary">{event.category}</Badge>
                    <span className="text-xs text-on-surface-variant">{formatEventDate(event.date)}</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-on-background group-hover:text-primary">
                    {event.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">{event.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* LoveWell value prop */}
      <Section>
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="order-2 flex flex-col gap-6 md:order-1">
            <div className="mb-2 flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-primary">favorite</span>
              <h2 className="font-heading text-3xl font-bold text-on-background md:text-4xl">
                LoveWell
              </h2>
            </div>
            <p className="text-lg text-on-surface-variant">
              More than a directory — LoveWell connects you to essential care, exclusive community
              perks, and a network of trusted organizations built specifically for the South Side.
            </p>
            <div className="mt-2 flex flex-col gap-4">
              <PerkRow
                icon="medical_services"
                tone="secondary"
                title="Priority Healthcare Access"
                description="Discover affirming providers and book appointments through our partner directory."
              />
              <PerkRow
                icon="local_offer"
                tone="primary"
                title="Discounts & Perks"
                description="Unlock savings at WeShop and exclusive access to community events."
              />
            </div>
            <div className="mt-4">
              <Link href="/lovewell" className={buttonVariants("primary", "lg")}>
                Discover LoveWell
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <PlaceholderTile
              seed="lovewell-hero"
              icon="diversity_3"
              className="aspect-square rounded-2xl shadow-lg md:aspect-[4/3]"
            />
          </div>
        </div>
      </Section>

      {/* Front Porch Media */}
      {stories.length > 0 && (
        <Section className="bg-inverse-surface text-surface-bright">
          <SectionHeader
            tone="dark"
            eyebrow="Media & Storytelling"
            title="The Front Porch"
            description="Stories, sounds, and voices from our community."
            action={
              <Link href="/front-porch" className="flex items-center gap-2 text-sm font-semibold text-primary-fixed-dim hover:text-primary-fixed">
                View all media <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            }
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Link href="/front-porch" className="group relative aspect-video overflow-hidden rounded-xl">
              <PlaceholderTile seed={stories[0].seed} className="h-full w-full" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors duration-500 group-hover:bg-black/10">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/90 text-on-primary backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  <span className="material-symbols-outlined ml-1 text-3xl">play_arrow</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <Badge tone="secondary" className="mb-2">
                  {stories[0].category}
                </Badge>
                <h3 className="font-heading text-2xl font-bold text-white">{stories[0].title}</h3>
              </div>
            </Link>
            <div className="flex flex-col justify-between gap-4">
              {stories.slice(1).map((story) => (
                <Link
                  key={story.id}
                  href="/front-porch"
                  className="group flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-inverse-on-surface/10"
                >
                  <PlaceholderTile seed={story.seed} className="h-24 w-24 shrink-0 rounded-lg" />
                  <div>
                    <h4 className="font-heading text-lg font-bold text-surface-bright group-hover:text-primary-fixed-dim">
                      {story.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-sm text-surface-variant">{story.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Partner CTA */}
      <Section>
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-outline-variant bg-surface-container-low px-6 py-14 text-center md:px-16">
          <Badge tone="tertiary">For Organizations</Badge>
          <h2 className="max-w-2xl font-heading text-3xl font-bold text-on-background md:text-4xl">
            Join 20 founding partners driving $20,000/month back into the community.
          </h2>
          <p className="max-w-xl text-on-surface-variant">
            LoveWell is opening 20 founding Directory of Services memberships in its first four
            weeks. Get discovered by 10,000+ Pride South Side followers.
          </p>
          <Link href="/partner" className={buttonVariants("primary", "lg")}>
            See Partnership Tiers
          </Link>
        </div>
      </Section>
    </>
  );
}

function PillarCard({
  href,
  icon,
  eyebrow,
  title,
  description,
  stat,
  seed,
}: {
  href: string;
  icon: string;
  eyebrow: string;
  title: string;
  description: string;
  stat: string;
  seed: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <PlaceholderTile seed={seed} icon={icon} className="aspect-[3/2]" />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">{eyebrow}</p>
        <h3 className="mt-1 font-heading text-2xl font-bold text-on-background group-hover:text-primary">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-on-surface-variant">{description}</p>
        <p className="mt-4 text-xs font-semibold text-primary">{stat}</p>
      </div>
    </Link>
  );
}

function PerkRow({
  icon,
  tone,
  title,
  description,
}: {
  icon: string;
  tone: "primary" | "secondary";
  title: string;
  description: string;
}) {
  const stripColor = tone === "primary" ? "bg-primary" : "bg-secondary-container";
  const iconColor = tone === "primary" ? "text-primary" : "text-secondary-container";
  return (
    <div className="relative flex items-center gap-4 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
      <div className={`absolute bottom-0 left-0 top-0 w-1 ${stripColor}`} />
      <span className={`material-symbols-outlined text-3xl ${iconColor}`}>{icon}</span>
      <div>
        <h4 className="font-heading text-lg font-bold text-on-background">{title}</h4>
        <p className="text-sm text-on-surface-variant">{description}</p>
      </div>
    </div>
  );
}
