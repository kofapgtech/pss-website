import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";

export async function requireAdmin(): Promise<void> {
  const ok = await isAuthenticated();
  if (!ok) redirect("/admin/login");
}

export function revalidateAll(): void {
  revalidatePath("/", "layout");
}

export function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function formNumber(formData: FormData, key: string): number {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : 0;
}

export function formBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export function formTags(formData: FormData, key: string): string[] {
  return formString(formData, key)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
