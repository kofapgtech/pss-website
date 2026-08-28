import { VendorForm } from "@/components/admin/vendor-form";
import { createVendorAction } from "@/lib/actions/shop";

export default function NewVendorPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl font-bold text-on-background">New Vendor</h1>
      <VendorForm action={createVendorAction} submitLabel="Create Vendor" />
    </div>
  );
}
