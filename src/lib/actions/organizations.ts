"use server";

import { redirect } from "next/navigation";
import { readCollection, newId } from "@/lib/data/store";
import { saveOrganizations } from "@/lib/data/organizations";
import type { Organization } from "@/lib/types";
import { requireAdmin, revalidateAll, formString, formBoolean, formTags } from "./guard";

function fromForm(formData: FormData): Omit<Organization, "id" | "createdAt" | "seed"> {
  return {
    name: formString(formData, "name"),
    category: formString(formData, "category"),
    description: formString(formData, "description"),
    location: formString(formData, "location"),
    website: formString(formData, "website"),
    contactEmail: formString(formData, "contactEmail"),
    tags: formTags(formData, "tags"),
    tier: formString(formData, "tier") === "featured" ? "featured" : "starter",
    published: formBoolean(formData, "published"),
  };
}

export async function createOrganizationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const items = readCollection<Organization>("organizations");
  const fields = fromForm(formData);
  items.push({
    id: newId(),
    seed: fields.name.toLowerCase().replace(/\s+/g, "-"),
    createdAt: new Date().toISOString(),
    ...fields,
  });
  saveOrganizations(items);
  revalidateAll();
  redirect("/admin/organizations");
}

export async function updateOrganizationAction(id: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const items = readCollection<Organization>("organizations");
  const index = items.findIndex((o) => o.id === id);
  if (index === -1) redirect("/admin/organizations");
  const fields = fromForm(formData);
  items[index] = { ...items[index], ...fields };
  saveOrganizations(items);
  revalidateAll();
  redirect("/admin/organizations");
}

export async function deleteOrganizationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formString(formData, "id");
  const items = readCollection<Organization>("organizations").filter((o) => o.id !== id);
  saveOrganizations(items);
  revalidateAll();
  redirect("/admin/organizations");
}

export async function toggleOrganizationPublishedAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formString(formData, "id");
  const items = readCollection<Organization>("organizations");
  const index = items.findIndex((o) => o.id === id);
  if (index !== -1) {
    items[index].published = !items[index].published;
    saveOrganizations(items);
    revalidateAll();
  }
}
