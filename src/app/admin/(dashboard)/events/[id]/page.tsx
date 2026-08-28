import { notFound } from "next/navigation";
import { getEvent } from "@/lib/data/events";
import { updateEventAction, deleteEventAction } from "@/lib/actions/events";
import { EventForm } from "@/components/admin/event-form";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) notFound();

  const updateWithId = updateEventAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-on-background">Edit Event</h1>
        <form action={deleteEventAction}>
          <input type="hidden" name="id" value={event.id} />
          <ConfirmSubmitButton
            message={`Delete "${event.title}"? This can't be undone.`}
            className="text-sm font-semibold text-error hover:opacity-80"
          >
            Delete Event
          </ConfirmSubmitButton>
        </form>
      </div>
      <EventForm action={updateWithId} event={event} submitLabel="Save Changes" />
    </div>
  );
}
