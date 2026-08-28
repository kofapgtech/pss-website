import { notFound } from "next/navigation";
import { getVendor } from "@/lib/data/shop";
import { updateVendorAction, deleteVendorAction } from "@/lib/actions/shop";
import { VendorForm } from "@/components/admin/vendor-form";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

export default async function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = getVendor(id);
  if (!vendor) notFound();

  const updateWithId = updateVendorAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-on-background">Edit Vendor</h1>
        <form action={deleteVendorAction}>
          <input type="hidden" name="id" value={vendor.id} />
          <ConfirmSubmitButton
            message={`Delete ${vendor.name} and all of their products?`}
            className="text-sm font-semibold text-error hover:opacity-80"
          >
            Delete Vendor
          </ConfirmSubmitButton>
        </form>
      </div>
      <VendorForm action={updateWithId} vendor={vendor} submitLabel="Save Changes" />
    </div>
  );
}
