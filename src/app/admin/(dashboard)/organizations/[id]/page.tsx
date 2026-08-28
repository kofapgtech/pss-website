import { notFound } from "next/navigation";
import { getOrganization } from "@/lib/data/organizations";
import { updateOrganizationAction, deleteOrganizationAction } from "@/lib/actions/organizations";
import { OrganizationForm } from "@/components/admin/organization-form";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const organization = getOrganization(id);
  if (!organization) notFound();

  const updateWithId = updateOrganizationAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-on-background">Edit Organization</h1>
        <form action={deleteOrganizationAction}>
          <input type="hidden" name="id" value={organization.id} />
          <ConfirmSubmitButton
            message={`Delete ${organization.name}? This can't be undone.`}
            className="text-sm font-semibold text-error hover:opacity-80"
          >
            Delete Organization
          </ConfirmSubmitButton>
        </form>
      </div>
      <OrganizationForm action={updateWithId} organization={organization} submitLabel="Save Changes" />
    </div>
  );
}
