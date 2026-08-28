import { OrganizationForm } from "@/components/admin/organization-form";
import { createOrganizationAction } from "@/lib/actions/organizations";

export default function NewOrganizationPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl font-bold text-on-background">New Organization</h1>
      <OrganizationForm action={createOrganizationAction} submitLabel="Create Organization" />
    </div>
  );
}
