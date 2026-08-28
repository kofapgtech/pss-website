"use server";

import { redirect } from "next/navigation";
import { readCollection, newId } from "@/lib/data/store";
import { saveStories } from "@/lib/data/stories";
import type { Story, StoryType } from "@/lib/types";
import { requireAdmin, revalidateAll, formString, formBoolean } from "./guard";

function fromForm(formData: FormData): Omit<Story, "id" | "createdAt" | "seed"> {
  const type = formString(formData, "type");
  return {
    title: formString(formData, "title"),
    excerpt: formString(formData, "excerpt"),
    body: formString(formData, "body"),
    type: (["article", "video", "audio"].includes(type) ? type : "article") as StoryType,
    category: formString(formData, "category"),
    author: formString(formData, "author") || "PSS Media Team",
    featured: formBoolean(formData, "featured"),
    published: formBoolean(formData, "published"),
    publishedAt: formString(formData, "publishedAt") || new Date().toISOString(),
  };
}

export async function createStoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const items = readCollection<Story>("stories");
  const fields = fromForm(formData);
  items.push({
    id: newId(),
    seed: fields.title.toLowerCase().replace(/\s+/g, "-"),
    createdAt: new Date().toISOString(),
    ...fields,
  });
  saveStories(items);
  revalidateAll();
  redirect("/admin/front-porch");
}

export async function updateStoryAction(id: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const items = readCollection<Story>("stories");
  const index = items.findIndex((s) => s.id === id);
  if (index === -1) redirect("/admin/front-porch");
  items[index] = { ...items[index], ...fromForm(formData) };
  saveStories(items);
  revalidateAll();
  redirect("/admin/front-porch");
}

export async function deleteStoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formString(formData, "id");
  const items = readCollection<Story>("stories").filter((s) => s.id !== id);
  saveStories(items);
  revalidateAll();
  redirect("/admin/front-porch");
}
