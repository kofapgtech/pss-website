import { readCollection, writeCollection } from "./store";
import type { Organization } from "@/lib/types";

const COLLECTION = "organizations";

export function getAllOrganizations(): Organization[] {
  return readCollection<Organization>(COLLECTION).sort((a, b) =>
    a.tier === b.tier ? a.name.localeCompare(b.name) : a.tier === "featured" ? -1 : 1,
  );
}

export function getPublishedOrganizations(): Organization[] {
  return getAllOrganizations().filter((o) => o.published);
}

export function getFeaturedOrganizations(): Organization[] {
  return getPublishedOrganizations().filter((o) => o.tier === "featured");
}

export function getOrganization(id: string): Organization | undefined {
  return readCollection<Organization>(COLLECTION).find((o) => o.id === id);
}

export function saveOrganizations(items: Organization[]): void {
  writeCollection(COLLECTION, items);
}
