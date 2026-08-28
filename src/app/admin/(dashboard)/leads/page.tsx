import { getAllLeads } from "@/lib/data/leads";
import { updateLeadStatusAction, deleteLeadAction } from "@/lib/actions/leads";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { formatDateTime } from "@/lib/format";
import type { Lead } from "@/lib/types";

const TYPE_LABELS: Record<Lead["type"], string> = {
  newsletter: "Newsletter",
  "partner-inquiry": "Partner Inquiry",
  "directory-upgrade": "Directory Upgrade",
  "vendor-application": "Vendor Application",
  "lovewell-join": "LoveWell Join",
  contact: "Contact",
};

const STATUS_TONE: Record<Lead["status"], "pending" | "primary" | "confirmed"> = {
  new: "pending",
  contacted: "primary",
  closed: "confirmed",
};

export default function AdminLeadsPage() {
  const leads = getAllLeads();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-on-background">Leads Inbox</h1>
        <p className="mt-1 text-on-surface-variant">
          {leads.length} submissions from newsletter, partner inquiry, directory upgrade, vendor
          application, and LoveWell join forms across the site.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-10 text-center text-on-surface-variant">
          No leads submitted yet. Once visitors fill out a form on the site, they&apos;ll show up here.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{TYPE_LABELS[lead.type]}</Badge>
                    <Badge tone={STATUS_TONE[lead.status]}>{lead.status}</Badge>
                    <span className="text-xs text-outline">{formatDateTime(lead.createdAt)}</span>
                  </div>
                  <p className="font-semibold text-on-background">{lead.name || "(no name)"}</p>
                  <p className="text-sm text-on-surface-variant">
                    {lead.email}
                    {lead.phone && ` · ${lead.phone}`}
                    {lead.organization && ` · ${lead.organization}`}
                  </p>
                  {lead.meta && <p className="mt-1 text-sm text-secondary">Interested in: {lead.meta}</p>}
                  {lead.message && <p className="mt-2 max-w-2xl text-sm text-on-surface">{lead.message}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <form action={updateLeadStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={lead.id} />
                    <select
                      name="status"
                      defaultValue={lead.status}
                      className="rounded-lg border border-outline-variant bg-surface px-2 py-1.5 text-xs focus-ring"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button type="submit" className="text-xs font-semibold text-primary hover:text-secondary">
                      Update
                    </button>
                  </form>
                  <form action={deleteLeadAction}>
                    <input type="hidden" name="id" value={lead.id} />
                    <ConfirmSubmitButton message="Delete this lead?" className="text-xs font-semibold text-error hover:opacity-80">
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
