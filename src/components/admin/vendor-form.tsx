import { Field, TextAreaField, CheckboxField } from "@/components/admin/fields";
import { buttonVariants } from "@/components/ui/button";
import type { Vendor } from "@/lib/types";

export function VendorForm({
  action,
  vendor,
  submitLabel = "Save Vendor",
}: {
  action: (formData: FormData) => void;
  vendor?: Vendor;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-5">
      <Field label="Vendor name" name="name" defaultValue={vendor?.name} required />
      <Field label="Category" name="category" defaultValue={vendor?.category} placeholder="Apparel, Art & Prints…" required />
      <TextAreaField label="Description" name="description" defaultValue={vendor?.description} required />
      <CheckboxField label="Published" name="published" defaultChecked={vendor?.published ?? true} hint="Visible on the public WeShop page." />
      <div>
        <button type="submit" className={buttonVariants("primary", "lg")}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
