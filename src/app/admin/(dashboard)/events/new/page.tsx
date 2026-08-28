import { EventForm } from "@/components/admin/event-form";
import { createEventAction } from "@/lib/actions/events";

export default function NewEventPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl font-bold text-on-background">New Event</h1>
      <EventForm action={createEventAction} submitLabel="Create Event" />
    </div>
  );
}
