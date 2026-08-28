import Link from "next/link";
import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { PlaceholderTile } from "@/components/placeholder-tile";
import { CategoryFilter } from "@/components/category-filter";
import { LeadForm } from "@/components/lead-form";
import { getPublishedProducts, getPublishedVendors } from "@/lib/data/shop";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WeShop",
  description: "Shop past Pride South Side festival vendors — local, queer, and allied creators.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const vendors = getPublishedVendors();
  const vendorMap = new Map(vendors.map((v) => [v.id, v]));
  const allProducts = getPublishedProducts();
  const categories = Array.from(new Set(allProducts.map((p) => p.category))).sort();
  const products = category ? allProducts.filter((p) => p.category === category) : allProducts;

  return (
    <>
      <Section className="pb-0 text-center">
        <h1 className="mx-auto max-w-3xl font-heading text-4xl font-extrabold text-on-background md:text-5xl">
          WeShop
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-on-surface-variant">
          Support local creators and wellness practitioners from past Pride South Side festivals.
          100% of proceeds support community social programs across the South Side.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-sm font-semibold text-primary">
            <span className="material-symbols-outlined text-lg">local_shipping</span>
            Nationwide Shipping
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-sm font-semibold text-tertiary">
            <span className="material-symbols-outlined text-lg">storefront</span>
            Local Pickup
          </span>
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <aside className="flex flex-col gap-8 md:col-span-3">
            <div>
              <h3 className="mb-4 font-heading text-lg font-bold text-on-background">Categories</h3>
              <CategoryFilter basePath="/shop" options={categories} active={category} />
            </div>
            <div className="rounded-xl border border-primary-fixed bg-primary-container p-6">
              <h4 className="font-heading text-lg font-bold text-on-primary-container">
                LoveWell Member?
              </h4>
              <p className="mt-2 text-sm text-on-primary-container/90">
                Unlock 15% off local vendor goods and access exclusive wellness items.
              </p>
              <Link
                href="/lovewell"
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-on-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-highest"
              >
                Join LoveWell
              </Link>
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
              <h4 className="font-heading text-lg font-bold text-on-background">Sell on WeShop</h4>
              <p className="mt-2 text-sm text-on-surface-variant">
                Past festival vendors and community makers can apply to be featured.
              </p>
              <a
                href="mailto:hello@pridesouthside.org?subject=WeShop%20Vendor%20Application"
                className="mt-4 inline-flex w-full items-center justify-center rounded-full border-2 border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container"
              >
                Apply as a Vendor
              </a>
            </div>
          </aside>

          <div className="md:col-span-9">
            {products.length === 0 ? (
              <p className="text-on-surface-variant">No products in this category yet — check back soon.</p>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => {
                  const vendor = vendorMap.get(product.vendorId);
                  return (
                    <article
                      key={product.id}
                      className="group flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-4 transition-all duration-300 hover:border-b-2 hover:border-b-secondary hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)]"
                    >
                      <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-lg">
                        <PlaceholderTile seed={product.seed} className="h-full w-full" />
                        <span className="absolute right-2 top-2 z-10 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-on-secondary shadow-sm">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-outline">
                        {product.category}
                      </span>
                      <h3 className="font-heading text-lg font-bold leading-tight text-on-background">
                        {product.name}
                      </h3>
                      <p className="mb-4 mt-1 text-sm text-on-surface-variant">
                        By {vendor?.name ?? "Local Vendor"}
                      </p>
                      <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-4">
                        <span className="flex items-center gap-1 text-xs font-medium text-primary">
                          <span className="material-symbols-outlined text-base">volunteer_activism</span>
                          Community Fund
                        </span>
                        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-container text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                          <span className="material-symbols-outlined">add_shopping_cart</span>
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section className="bg-surface-container-low">
        <SectionHeader
          eyebrow="Our Vendors"
          title="Meet the makers"
          description="WeShop features past Pride South Side festival vendors — queer, local, and allied creators."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="flex items-start gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
            >
              <PlaceholderTile seed={vendor.seed} className="h-12 w-12 shrink-0 rounded-lg" />
              <div>
                <h4 className="font-heading text-sm font-bold text-on-background">{vendor.name}</h4>
                <p className="mt-1 text-xs text-on-surface-variant">{vendor.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="vendor-application" className="max-w-2xl">
        <SectionHeader
          eyebrow="Become a Vendor"
          title="Apply to sell on WeShop"
          description="Tell us about your business and we'll follow up about featuring you on WeShop."
        />
        <LeadForm
          type="vendor-application"
          showOrganization
          showPhone
          messageLabel="What do you sell?"
          submitLabel="Submit Application"
        />
      </Section>
    </>
  );
}
