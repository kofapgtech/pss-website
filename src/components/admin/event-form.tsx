import { Field, TextAreaField, SelectField, CheckboxField } from "@/components/admin/fields";
import { buttonVariants } from "@/components/ui/button";
import type { EventItem } from "@/lib/types";

export function EventForm({
  action,
  event,
  submitLabel = "Save Event",
}: {
  action: (formData: FormData) => void;
  event?: EventItem;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      <Field label="Title" name="title" defaultValue={event?.title} required />
      <TextAreaField label="Description" name="description" defaultValue={event?.description} required />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Date" name="date" type="date" defaultValue={event?.date} required />
        <Field label="Time" name="time" defaultValue={event?.time} placeholder="6:00 PM – 9:00 PM" required />
      </div>
      <Field label="Location" name="location" defaultValue={event?.location} required />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Category" name="category" defaultValue={event?.category} placeholder="Festival, Health, Arts & Culture…" required />
        <Field label="RSVP / ticket link" name="rsvpUrl" defaultValue={event?.rsvpUrl} placeholder="https://" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <SelectField
          label="Status"
          name="status"
          defaultValue={event?.status ?? "pending"}
          options={[
            { value: "pending", label: "Pending (hidden)" },
            { value: "published", label: "Published (visible)" },
          ]}
        />
        <div className="flex flex-col gap-3">
          <CheckboxField label="Virtual event" name="isVirtual" defaultChecked={event?.isVirtual} />
          <CheckboxField label="Feature on homepage & calendar" name="featured" defaultChecked={event?.featured} />
        </div>
      </div>
      <div>
        <button type="submit" className={buttonVariants("primary", "lg")}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
