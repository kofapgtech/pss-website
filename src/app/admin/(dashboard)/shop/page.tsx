import Link from "next/link";
import { getAllProducts, getAllVendors } from "@/lib/data/shop";
import { deleteVendorAction, deleteProductAction } from "@/lib/actions/shop";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { formatCurrency } from "@/lib/format";

export default function AdminShopPage() {
  const vendors = getAllVendors();
  const products = getAllProducts();
  const vendorMap = new Map(vendors.map((v) => [v.id, v]));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-on-background">WeShop</h1>
          <p className="mt-1 text-on-surface-variant">{vendors.length} vendors · {products.length} products</p>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-on-background">Vendors</h2>
          <Link href="/admin/shop/vendors/new" className={buttonVariants("secondary", "sm")}>
            <span className="material-symbols-outlined text-lg">add</span>
            New Vendor
          </Link>
        </div>
        <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-outline-variant text-xs uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td className="px-5 py-4 font-semibold text-on-background">{vendor.name}</td>
                  <td className="px-5 py-4 text-on-surface-variant">{vendor.category}</td>
                  <td className="px-5 py-4">
                    <Badge tone={vendor.published ? "confirmed" : "pending"}>
                      {vendor.published ? "Published" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/shop/vendors/${vendor.id}`} className="text-xs font-semibold text-primary hover:text-secondary">
                        Edit
                      </Link>
                      <form action={deleteVendorAction}>
                        <input type="hidden" name="id" value={vendor.id} />
                        <ConfirmSubmitButton
                          message={`Delete ${vendor.name} and all of their products?`}
                          className="text-xs font-semibold text-error hover:opacity-80"
                        >
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-on-background">Products</h2>
          <Link href="/admin/shop/products/new" className={buttonVariants("secondary", "sm")}>
            <span className="material-symbols-outlined text-lg">add</span>
            New Product
          </Link>
        </div>
        <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-outline-variant text-xs uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-4 font-semibold text-on-background">{product.name}</td>
                  <td className="px-5 py-4 text-on-surface-variant">{vendorMap.get(product.vendorId)?.name ?? "—"}</td>
                  <td className="px-5 py-4 text-on-surface-variant">{formatCurrency(product.price)}</td>
                  <td className="px-5 py-4">
                    <Badge tone={product.published ? "confirmed" : "pending"}>
                      {product.published ? "Published" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/shop/products/${product.id}`} className="text-xs font-semibold text-primary hover:text-secondary">
                        Edit
                      </Link>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={product.id} />
                        <ConfirmSubmitButton
                          message={`Delete ${product.name}?`}
                          className="text-xs font-semibold text-error hover:opacity-80"
                        >
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
