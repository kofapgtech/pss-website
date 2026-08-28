import Link from "next/link";
import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PlaceholderTile } from "@/components/placeholder-tile";
import { CategoryFilter } from "@/components/category-filter";
import { getFeaturedStory, getPublishedStories } from "@/lib/data/stories";
import { formatEventDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Front Porch",
  description:
    "The official media and digital storytelling hub of Pride South Side — recap videos, short-form clips, and community storytelling.",
};

const TYPE_ICON: Record<string, string> = {
  article: "article",
  video: "play_circle",
  audio: "graphic_eq",
};

export default async function FrontPorchPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const stories = getPublishedStories();
  const featured = getFeaturedStory();
  const categories = Array.from(new Set(stories.map((s) => s.category))).sort();
  const rest = stories
    .filter((s) => s.id !== featured?.id)
    .filter((s) => !category || s.category === category);

  return (
    <>
      <Section className="pb-0 text-center">
        <Badge tone="secondary" className="mx-auto mb-4">
          Media &amp; Storytelling
        </Badge>
        <h1 className="mx-auto max-w-3xl font-heading text-4xl font-extrabold text-on-background md:text-5xl">
          The Front Porch
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-on-surface-variant">
          Festival recap videos, short-form clips, and stories created in collaboration with
          partner media producers — driving cultural engagement across the South Side.
        </p>
      </Section>

      {featured && (
        <Section>
          <Link
            href={`/front-porch/${featured.id}`}
            className="group relative block aspect-video overflow-hidden rounded-xl shadow-sm"
          >
            <PlaceholderTile seed={featured.seed} className="h-full w-full" dotPattern />
            {featured.type !== "article" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors duration-500 group-hover:bg-black/10">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary/90 text-on-primary backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  <span className="material-symbols-outlined ml-1 text-4xl">play_arrow</span>
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
              <Badge tone="secondary" className="mb-3">
                {featured.category}
              </Badge>
              <h2 className="font-heading text-3xl font-extrabold text-white md:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-2 max-w-xl text-surface-variant">{featured.excerpt}</p>
            </div>
          </Link>
        </Section>
      )}

      <Section className="bg-surface-container-low">
        <SectionHeader eyebrow="All Stories" title="Stories from the Porch" />
        <div className="mb-8">
          <CategoryFilter basePath="/front-porch" options={categories} active={category} />
        </div>
        {rest.length === 0 ? (
          <p className="text-on-surface-variant">No stories in this category yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((story) => (
              <Link
                key={story.id}
                href={`/front-porch/${story.id}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-video">
                  <PlaceholderTile seed={story.seed} icon={TYPE_ICON[story.type]} className="h-full w-full" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge tone="tertiary">{story.category}</Badge>
                    <span className="text-xs capitalize text-on-surface-variant">{story.type}</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-on-background group-hover:text-primary">
                    {story.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-on-surface-variant">{story.excerpt}</p>
                  <p className="mt-4 text-xs text-outline">
                    {story.author} · {formatEventDate(story.publishedAt.slice(0, 10))}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section className="max-w-2xl text-center">
        <SectionHeader
          eyebrow="For Organizations"
          title="Get featured on the Front Porch"
          description="LoveWell partners can commission articles, videos, and promotions starting at $500. Storytelling packages scale from $500–$2,000 based on tier."
        />
        <Link href="/partner#storytelling" className={buttonVariants("primary", "lg")}>
          Explore Storytelling Packages
        </Link>
      </Section>
    </>
  );
}
