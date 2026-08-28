import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { createProductAction } from "@/lib/actions/shop";
import { getAllVendors } from "@/lib/data/shop";

export default function NewProductPage() {
  const vendors = getAllVendors();

  if (vendors.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-3xl font-bold text-on-background">New Product</h1>
        <p className="text-on-surface-variant">
          Add a vendor first before creating a product.{" "}
          <Link href="/admin/shop/vendors/new" className="font-semibold text-primary">
            Create a vendor
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl font-bold text-on-background">New Product</h1>
      <ProductForm action={createProductAction} vendors={vendors} submitLabel="Create Product" />
    </div>
  );
}
