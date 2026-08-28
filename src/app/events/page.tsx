import Link from "next/link";
import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PlaceholderTile } from "@/components/placeholder-tile";
import { CategoryFilter } from "@/components/category-filter";
import { getPublishedEvents } from "@/lib/data/events";
import { formatEventDate, formatEventDayMonth } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PopOuts — Community Events",
  description: "A curated community event calendar of meetups, cultural events, and partner programming from Pride South Side.",
};

const SUBMIT_EVENT_MAILTO = (() => {
  const subject = "Submit an Event for PopOuts";
  const body = [
    "Event title:",
    "Date & time:",
    "Location (or 'Virtual'):",
    "Category (Festival / Health / Arts & Culture / Music / etc.):",
    "Short description:",
    "RSVP or ticket link (if any):",
    "Contact person & organization:",
  ].join("\n");
  return `mailto:events@pridesouthside.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
})();

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const allEvents = getPublishedEvents();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = allEvents.filter((e) => e.date >= today);
  const categories = Array.from(new Set(allEvents.map((e) => e.category))).sort();

  const featured = upcoming.find((e) => e.featured) ?? upcoming[0];
  const rest = upcoming
    .filter((e) => e.id !== featured?.id)
    .filter((e) => !category || e.category === category);

  return (
    <>
      <Section className="pb-0">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-heading text-4xl font-extrabold text-primary md:text-5xl">
              Community Calendar
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-on-surface-variant">
              Discover upcoming gatherings, workshops, and celebrations on the Front Porch.
              Connect with your community and find your space.
            </p>
          </div>
          <a href={SUBMIT_EVENT_MAILTO} className={buttonVariants("secondary", "lg")}>
            <span className="material-symbols-outlined">add_circle</span>
            Submit an Event
          </a>
        </div>
      </Section>

      {featured && (
        <Section className="pb-0">
          <div className="group relative overflow-hidden rounded-xl shadow-sm">
            <PlaceholderTile seed={featured.seed} className="h-80 w-full" dotPattern />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge tone="secondary" className="mb-3 shadow-md">
                Featured
              </Badge>
              <h2 className="font-heading text-3xl font-extrabold text-on-background md:text-4xl">
                {featured.title}
              </h2>
              <div className="mb-4 mt-3 flex flex-wrap gap-4 text-sm font-medium text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary">calendar_today</span>
                  {formatEventDate(featured.date)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  {featured.location}
                </span>
              </div>
              <a href={featured.rsvpUrl} className={buttonVariants("primary", "md")}>
                RSVP Now
              </a>
            </div>
          </div>
        </Section>
      )}

      <Section id="event-list">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <aside className="flex flex-col gap-8 lg:col-span-4">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
              <h4 className="mb-4 font-heading text-lg font-bold text-on-background">Filter Events</h4>
              <CategoryFilter basePath="/events" options={categories} active={category} />
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
              <h4 className="mb-2 font-heading text-lg font-bold text-on-background">Have an event?</h4>
              <p className="mb-4 text-sm text-on-surface-variant">
                PopOuts submissions come in by email — send us the details and our team will
                review and publish it.
              </p>
              <a href={SUBMIT_EVENT_MAILTO} className={`${buttonVariants("primary", "md")} w-full`}>
                Email Your Event
              </a>
            </div>
          </aside>

          <div className="flex flex-col gap-4 lg:col-span-8">
            {rest.length === 0 ? (
              <p className="text-on-surface-variant">No more events in this category yet — check back soon.</p>
            ) : (
              rest.map((event) => {
                const { month, day } = formatEventDayMonth(event.date);
                return (
                  <div
                    key={event.id}
                    className="relative flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:shadow-md md:flex-row"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-confirmed" />
                    <div className="w-24 shrink-0 rounded-lg bg-surface-container px-4 py-3 text-center">
                      <div className="text-xs font-semibold uppercase text-primary">{month}</div>
                      <div className="font-heading text-3xl text-on-surface">{day}</div>
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-tertiary">{event.category}</span>
                        {event.isVirtual && (
                          <span className="rounded-sm bg-surface-variant px-2 py-0.5 text-xs text-on-surface-variant">
                            Virtual
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading text-xl font-bold text-on-surface">{event.title}</h3>
                      <p className="mt-1 text-sm text-on-surface-variant">{event.description}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">
                            {event.isVirtual ? "videocam" : "location_on"}
                          </span>
                          {event.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-end justify-end md:flex-col md:items-end md:justify-center">
                      <a href={event.rsvpUrl} className={buttonVariants("secondary", "sm")}>
                        RSVP
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Section>

      <Section className="bg-surface-container-low">
        <SectionHeader
          eyebrow="Front Porch Stages"
          title="Intimate, tiny-desk style sessions"
          description="Grab a seat on the porch for local live performances."
          action={
            <Link href="/front-porch" className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">
              Visit The Front Porch <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          }
        />
      </Section>
    </>
  );
}
