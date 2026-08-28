"use server";

import { readCollection, newId } from "@/lib/data/store";
import { saveLeads } from "@/lib/data/leads";
import type { Lead, LeadType } from "@/lib/types";
import { requireAdmin, revalidateAll, formString } from "./guard";

const VALID_TYPES: LeadType[] = [
  "newsletter",
  "partner-inquiry",
  "directory-upgrade",
  "vendor-application",
  "lovewell-join",
  "contact",
];

export type LeadFormState = { success: boolean; error: string };

export async function submitLeadAction(
  _prevState: LeadFormState | undefined,
  formData: FormData,
): Promise<LeadFormState> {
  const email = formString(formData, "email");
  const typeRaw = formString(formData, "type");
  const type = (VALID_TYPES.includes(typeRaw as LeadType) ? typeRaw : "contact") as LeadType;

  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const items = readCollection<Lead>("leads");
  items.push({
    id: newId(),
    type,
    name: formString(formData, "name"),
    organization: formString(formData, "organization"),
    email,
    phone: formString(formData, "phone"),
    message: formString(formData, "message"),
    meta: formString(formData, "meta"),
    status: "new",
    createdAt: new Date().toISOString(),
  });
  saveLeads(items);
  revalidateAll();

  return { success: true, error: "" };
}

export async function updateLeadStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formString(formData, "id");
  const status = formString(formData, "status");
  const items = readCollection<Lead>("leads");
  const index = items.findIndex((l) => l.id === id);
  if (index !== -1 && ["new", "contacted", "closed"].includes(status)) {
    items[index].status = status as Lead["status"];
    saveLeads(items);
    revalidateAll();
  }
}

export async function deleteLeadAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formString(formData, "id");
  const items = readCollection<Lead>("leads").filter((l) => l.id !== id);
  saveLeads(items);
  revalidateAll();
}
