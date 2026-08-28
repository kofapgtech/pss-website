import { readCollection, writeCollection } from "./store";
import type { Story } from "@/lib/types";

const COLLECTION = "stories";

export function getAllStories(): Story[] {
  return readCollection<Story>(COLLECTION).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function getPublishedStories(): Story[] {
  return getAllStories().filter((s) => s.published);
}

export function getFeaturedStory(): Story | undefined {
  return getPublishedStories().find((s) => s.featured) ?? getPublishedStories()[0];
}

export function getStory(id: string): Story | undefined {
  return readCollection<Story>(COLLECTION).find((s) => s.id === id);
}

export function saveStories(items: Story[]): void {
  writeCollection(COLLECTION, items);
}
