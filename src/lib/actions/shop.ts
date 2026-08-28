"use server";

import { redirect } from "next/navigation";
import { readCollection, newId } from "@/lib/data/store";
import { saveVendors, saveProducts } from "@/lib/data/shop";
import type { Product, Vendor } from "@/lib/types";
import { requireAdmin, revalidateAll, formString, formNumber, formBoolean } from "./guard";

function vendorFromForm(formData: FormData): Omit<Vendor, "id" | "createdAt" | "seed"> {
  return {
    name: formString(formData, "name"),
    description: formString(formData, "description"),
    category: formString(formData, "category"),
    published: formBoolean(formData, "published"),
  };
}

export async function createVendorAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const items = readCollection<Vendor>("vendors");
  const fields = vendorFromForm(formData);
  items.push({
    id: newId(),
    seed: fields.name.toLowerCase().replace(/\s+/g, "-"),
    createdAt: new Date().toISOString(),
    ...fields,
  });
  saveVendors(items);
  revalidateAll();
  redirect("/admin/shop");
}

export async function updateVendorAction(id: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const items = readCollection<Vendor>("vendors");
  const index = items.findIndex((v) => v.id === id);
  if (index === -1) redirect("/admin/shop");
  items[index] = { ...items[index], ...vendorFromForm(formData) };
  saveVendors(items);
  revalidateAll();
  redirect("/admin/shop");
}

export async function deleteVendorAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formString(formData, "id");
  const vendors = readCollection<Vendor>("vendors").filter((v) => v.id !== id);
  const products = readCollection<Product>("products").filter((p) => p.vendorId !== id);
  saveVendors(vendors);
  saveProducts(products);
  revalidateAll();
  redirect("/admin/shop");
}

function productFromForm(formData: FormData): Omit<Product, "id" | "createdAt" | "seed"> {
  return {
    vendorId: formString(formData, "vendorId"),
    name: formString(formData, "name"),
    price: formNumber(formData, "price"),
    category: formString(formData, "category"),
    published: formBoolean(formData, "published"),
  };
}

export async function createProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const items = readCollection<Product>("products");
  const fields = productFromForm(formData);
  items.push({
    id: newId(),
    seed: fields.name.toLowerCase().replace(/\s+/g, "-"),
    createdAt: new Date().toISOString(),
    ...fields,
  });
  saveProducts(items);
  revalidateAll();
  redirect("/admin/shop");
}

export async function updateProductAction(id: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const items = readCollection<Product>("products");
  const index = items.findIndex((p) => p.id === id);
  if (index === -1) redirect("/admin/shop");
  items[index] = { ...items[index], ...productFromForm(formData) };
  saveProducts(items);
  revalidateAll();
  redirect("/admin/shop");
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formString(formData, "id");
  const items = readCollection<Product>("products").filter((p) => p.id !== id);
  saveProducts(items);
  revalidateAll();
  redirect("/admin/shop");
}
