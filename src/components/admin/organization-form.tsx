import { Field, TextAreaField, SelectField, CheckboxField } from "@/components/admin/fields";
import { buttonVariants } from "@/components/ui/button";
import type { Organization } from "@/lib/types";

export function OrganizationForm({
  action,
  organization,
  submitLabel = "Save Organization",
}: {
  action: (formData: FormData) => void;
  organization?: Organization;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      <Field label="Organization name" name="name" defaultValue={organization?.name} required />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Category" name="category" defaultValue={organization?.category} required placeholder="e.g. Health & Wellness" />
        <SelectField
          label="Tier"
          name="tier"
          defaultValue={organization?.tier ?? "starter"}
          options={[
            { value: "starter", label: "Starter (free)" },
            { value: "featured", label: "Featured ($1,000/mo)" },
          ]}
        />
      </div>
      <TextAreaField label="Description" name="description" defaultValue={organization?.description} required />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Location" name="location" defaultValue={organization?.location} />
        <Field label="Website" name="website" defaultValue={organization?.website} placeholder="https://" />
      </div>
      <Field label="Contact email" name="contactEmail" defaultValue={organization?.contactEmail} type="email" />
      <Field
        label="Tags (comma-separated)"
        name="tags"
        defaultValue={organization?.tags.join(", ")}
        placeholder="Healthcare, Featured Partner"
      />
      <CheckboxField
        label="Published"
        name="published"
        defaultChecked={organization?.published ?? true}
        hint="Visible on the public LoveWell Directory page."
      />
      <div>
        <button type="submit" className={buttonVariants("primary", "lg")}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
