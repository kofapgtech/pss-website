import Link from "next/link";
import { getAllOrganizations } from "@/lib/data/organizations";
import { getAllEvents } from "@/lib/data/events";
import { getAllProducts, getAllVendors } from "@/lib/data/shop";
import { getAllStories } from "@/lib/data/stories";
import { getAllLeads } from "@/lib/data/leads";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const organizations = getAllOrganizations();
  const events = getAllEvents();
  const vendors = getAllVendors();
  const products = getAllProducts();
  const stories = getAllStories();
  const leads = getAllLeads();

  const pendingEvents = events.filter((e) => e.status === "pending").length;
  const newLeads = leads.filter((l) => l.status === "new").length;

  const stats = [
    { label: "Directory Organizations", value: organizations.length, href: "/admin/organizations", icon: "diversity_3" },
    { label: "PopOuts Events", value: events.length, sub: pendingEvents ? `${pendingEvents} pending` : undefined, href: "/admin/events", icon: "calendar_month" },
    { label: "WeShop Vendors / Products", value: `${vendors.length} / ${products.length}`, href: "/admin/shop", icon: "storefront" },
    { label: "Front Porch Stories", value: stories.length, href: "/admin/front-porch", icon: "movie" },
    { label: "New Leads", value: newLeads, sub: `${leads.length} total`, href: "/admin/leads", icon: "inbox" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-on-background">Dashboard</h1>
        <p className="mt-1 text-on-surface-variant">
          Manage LoveWell Phase 1 content — the Directory, PopOuts, WeShop, and Front Porch.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 transition-shadow hover:shadow-md"
          >
            <span className="material-symbols-outlined text-2xl text-primary">{stat.icon}</span>
            <div>
              <p className="font-heading text-2xl font-bold text-on-background">{stat.value}</p>
              <p className="text-xs font-semibold text-on-surface-variant">{stat.label}</p>
              {stat.sub && <p className="mt-0.5 text-xs text-secondary">{stat.sub}</p>}
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-on-background">Recent leads</h2>
          <Link href="/admin/leads" className="text-sm font-semibold text-primary hover:text-secondary">
            View all
          </Link>
        </div>
        {leads.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No leads submitted yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-outline-variant">
            {leads.slice(0, 6).map((lead) => (
              <div key={lead.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="text-sm font-semibold text-on-background">
                    {lead.name || lead.email} {lead.organization && `— ${lead.organization}`}
                  </p>
                  <p className="text-xs text-on-surface-variant">{lead.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="neutral">{lead.type}</Badge>
                  <span className="text-xs text-outline">{formatDateTime(lead.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
