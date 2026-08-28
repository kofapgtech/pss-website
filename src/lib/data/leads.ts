import { readCollection, writeCollection } from "./store";
import type { Lead } from "@/lib/types";

const COLLECTION = "leads";

export function getAllLeads(): Lead[] {
  return readCollection<Lead>(COLLECTION).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveLeads(items: Lead[]): void {
  writeCollection(COLLECTION, items);
}
