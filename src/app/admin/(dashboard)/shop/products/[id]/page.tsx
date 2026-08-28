import { notFound } from "next/navigation";
import { getProduct, getAllVendors } from "@/lib/data/shop";
import { updateProductAction, deleteProductAction } from "@/lib/actions/shop";
import { ProductForm } from "@/components/admin/product-form";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  const vendors = getAllVendors();

  const updateWithId = updateProductAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-on-background">Edit Product</h1>
        <form action={deleteProductAction}>
          <input type="hidden" name="id" value={product.id} />
          <ConfirmSubmitButton
            message={`Delete ${product.name}?`}
            className="text-sm font-semibold text-error hover:opacity-80"
          >
            Delete Product
          </ConfirmSubmitButton>
        </form>
      </div>
      <ProductForm action={updateWithId} product={product} vendors={vendors} submitLabel="Save Changes" />
    </div>
  );
}
