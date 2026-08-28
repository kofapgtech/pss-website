import Link from "next/link";
import { getAllEvents } from "@/lib/data/events";
import { deleteEventAction, toggleEventStatusAction } from "@/lib/actions/events";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { formatEventDate } from "@/lib/format";

export default function AdminEventsPage() {
  const events = getAllEvents();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-on-background">PopOuts Events</h1>
          <p className="mt-1 text-on-surface-variant">{events.length} events</p>
        </div>
        <Link href="/admin/events/new" className={buttonVariants("primary", "md")}>
          <span className="material-symbols-outlined text-lg">add</span>
          New Event
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-outline-variant text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="px-5 py-4 font-semibold text-on-background">
                  {event.title}
                  {event.featured && <Badge tone="tertiary" className="ml-2">Featured</Badge>}
                </td>
                <td className="px-5 py-4 text-on-surface-variant">{formatEventDate(event.date)}</td>
                <td className="px-5 py-4 text-on-surface-variant">{event.category}</td>
                <td className="px-5 py-4">
                  <Badge tone={event.status === "published" ? "confirmed" : "pending"}>{event.status}</Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <form action={toggleEventStatusAction}>
                      <input type="hidden" name="id" value={event.id} />
                      <button type="submit" className="text-xs font-semibold text-primary hover:text-secondary">
                        {event.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                    <Link href={`/admin/events/${event.id}`} className="text-xs font-semibold text-primary hover:text-secondary">
                      Edit
                    </Link>
                    <form action={deleteEventAction}>
                      <input type="hidden" name="id" value={event.id} />
                      <ConfirmSubmitButton
                        message={`Delete "${event.title}"? This can't be undone.`}
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
