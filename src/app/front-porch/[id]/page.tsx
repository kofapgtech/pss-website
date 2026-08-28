import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { PlaceholderTile } from "@/components/placeholder-tile";
import { getStory, getPublishedStories } from "@/lib/data/stories";
import { formatEventDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const story = getStory(id);
  return { title: story?.title ?? "Story" };
}

export default async function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = getStory(id);
  if (!story || !story.published) notFound();

  const related = getPublishedStories()
    .filter((s) => s.id !== story.id && s.category === story.category)
    .slice(0, 3);

  return (
    <>
      <Section className="max-w-3xl pb-0">
        <Link href="/front-porch" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-secondary">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to The Front Porch
        </Link>
        <Badge tone="tertiary" className="mb-3">
          {story.category}
        </Badge>
        <h1 className="font-heading text-3xl font-extrabold text-on-background md:text-4xl">
          {story.title}
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          {story.author} · {formatEventDate(story.publishedAt.slice(0, 10))}
        </p>
      </Section>

      <Section className="max-w-3xl">
        <PlaceholderTile seed={story.seed} icon="play_arrow" className="mb-8 aspect-video rounded-xl" />
        <p className="text-lg leading-relaxed text-on-surface-variant">{story.body}</p>
      </Section>

      {related.length > 0 && (
        <Section className="bg-surface-container-low">
          <h2 className="mb-6 font-heading text-2xl font-bold text-on-background">More from {story.category}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/front-porch/${item.id}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest"
              >
                <PlaceholderTile seed={item.seed} className="aspect-video" />
                <div className="p-4">
                  <h3 className="font-heading text-sm font-bold text-on-background group-hover:text-primary">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
