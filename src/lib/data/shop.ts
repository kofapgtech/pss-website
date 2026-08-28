import { readCollection, writeCollection } from "./store";
import type { Product, Vendor } from "@/lib/types";

export function getAllVendors(): Vendor[] {
  return readCollection<Vendor>("vendors").sort((a, b) => a.name.localeCompare(b.name));
}

export function getPublishedVendors(): Vendor[] {
  return getAllVendors().filter((v) => v.published);
}

export function getVendor(id: string): Vendor | undefined {
  return readCollection<Vendor>("vendors").find((v) => v.id === id);
}

export function saveVendors(items: Vendor[]): void {
  writeCollection("vendors", items);
}

export function getAllProducts(): Product[] {
  return readCollection<Product>("products").sort((a, b) => a.name.localeCompare(b.name));
}

export function getPublishedProducts(): Product[] {
  return getAllProducts().filter((p) => p.published);
}

export function getProduct(id: string): Product | undefined {
  return readCollection<Product>("products").find((p) => p.id === id);
}

export function saveProducts(items: Product[]): void {
  writeCollection("products", items);
}
