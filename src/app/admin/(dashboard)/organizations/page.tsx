import Link from "next/link";
import { getAllOrganizations } from "@/lib/data/organizations";
import { deleteOrganizationAction, toggleOrganizationPublishedAction } from "@/lib/actions/organizations";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

export default function AdminOrganizationsPage() {
  const organizations = getAllOrganizations();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-on-background">LoveWell Directory</h1>
          <p className="mt-1 text-on-surface-variant">{organizations.length} organizations</p>
        </div>
        <Link href="/admin/organizations/new" className={buttonVariants("primary", "md")}>
          <span className="material-symbols-outlined text-lg">add</span>
          New Organization
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-outline-variant text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Tier</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {organizations.map((org) => (
              <tr key={org.id}>
                <td className="px-5 py-4 font-semibold text-on-background">{org.name}</td>
                <td className="px-5 py-4 text-on-surface-variant">{org.category}</td>
                <td className="px-5 py-4">
                  <Badge tone={org.tier === "featured" ? "primary" : "neutral"}>{org.tier}</Badge>
                </td>
                <td className="px-5 py-4">
                  <Badge tone={org.published ? "confirmed" : "pending"}>
                    {org.published ? "Published" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <form action={toggleOrganizationPublishedAction}>
                      <input type="hidden" name="id" value={org.id} />
                      <button type="submit" className="text-xs font-semibold text-primary hover:text-secondary">
                        {org.published ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                    <Link href={`/admin/organizations/${org.id}`} className="text-xs font-semibold text-primary hover:text-secondary">
                      Edit
                    </Link>
                    <form action={deleteOrganizationAction}>
                      <input type="hidden" name="id" value={org.id} />
                      <ConfirmSubmitButton
                        message={`Delete ${org.name}? This can't be undone.`}
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
    </div>
  );
}
