import { Field, SelectField, CheckboxField } from "@/components/admin/fields";
import { buttonVariants } from "@/components/ui/button";
import type { Product, Vendor } from "@/lib/types";

export function ProductForm({
  action,
  product,
  vendors,
  submitLabel = "Save Product",
}: {
  action: (formData: FormData) => void;
  product?: Product;
  vendors: Vendor[];
  submitLabel?: string;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-5">
      <Field label="Product name" name="name" defaultValue={product?.name} required />
      <SelectField
        label="Vendor"
        name="vendorId"
        defaultValue={product?.vendorId ?? vendors[0]?.id}
        options={vendors.map((v) => ({ value: v.id, label: v.name }))}
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Price (USD)" name="price" type="number" defaultValue={product?.price} required />
        <Field label="Category" name="category" defaultValue={product?.category} placeholder="Apparel, Wellness & Care…" required />
      </div>
      <CheckboxField label="Published" name="published" defaultChecked={product?.published ?? true} hint="Visible on the public WeShop page." />
      <div>
        <button type="submit" className={buttonVariants("primary", "lg")}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
