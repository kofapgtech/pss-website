"use server";

import { redirect } from "next/navigation";
import { readCollection, newId } from "@/lib/data/store";
import { saveEvents } from "@/lib/data/events";
import type { EventItem, EventStatus } from "@/lib/types";
import { requireAdmin, revalidateAll, formString, formBoolean } from "./guard";

function fromForm(formData: FormData): Omit<EventItem, "id" | "createdAt" | "seed"> {
  return {
    title: formString(formData, "title"),
    description: formString(formData, "description"),
    date: formString(formData, "date"),
    time: formString(formData, "time"),
    location: formString(formData, "location"),
    isVirtual: formBoolean(formData, "isVirtual"),
    category: formString(formData, "category"),
    status: (formString(formData, "status") === "published"
      ? "published"
      : "pending") as EventStatus,
    featured: formBoolean(formData, "featured"),
    rsvpUrl: formString(formData, "rsvpUrl") || "#",
  };
}

export async function createEventAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const items = readCollection<EventItem>("events");
  const fields = fromForm(formData);
  items.push({
    id: newId(),
    seed: fields.title.toLowerCase().replace(/\s+/g, "-"),
    createdAt: new Date().toISOString(),
    ...fields,
  });
  saveEvents(items);
  revalidateAll();
  redirect("/admin/events");
}

export async function updateEventAction(id: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const items = readCollection<EventItem>("events");
  const index = items.findIndex((e) => e.id === id);
  if (index === -1) redirect("/admin/events");
  const fields = fromForm(formData);
  items[index] = { ...items[index], ...fields };
  saveEvents(items);
  revalidateAll();
  redirect("/admin/events");
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formString(formData, "id");
  const items = readCollection<EventItem>("events").filter((e) => e.id !== id);
  saveEvents(items);
  revalidateAll();
  redirect("/admin/events");
}

export async function toggleEventStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formString(formData, "id");
  const items = readCollection<EventItem>("events");
  const index = items.findIndex((e) => e.id === id);
  if (index !== -1) {
    items[index].status = items[index].status === "published" ? "pending" : "published";
    saveEvents(items);
    revalidateAll();
  }
}
