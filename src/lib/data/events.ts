import { readCollection, writeCollection } from "./store";
import type { EventItem } from "@/lib/types";

const COLLECTION = "events";

export function getAllEvents(): EventItem[] {
  return readCollection<EventItem>(COLLECTION).sort((a, b) => a.date.localeCompare(b.date));
}

export function getPublishedEvents(): EventItem[] {
  return getAllEvents().filter((e) => e.status === "published");
}

export function getUpcomingEvents(): EventItem[] {
  const today = new Date().toISOString().slice(0, 10);
  return getPublishedEvents().filter((e) => e.date >= today);
}

export function getEvent(id: string): EventItem | undefined {
  return readCollection<EventItem>(COLLECTION).find((e) => e.id === id);
}

export function saveEvents(items: EventItem[]): void {
  writeCollection(COLLECTION, items);
}
