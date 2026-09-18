# Import slots — content from pridesouthside.org

Nothing has been imported yet. The session that built this site could not
reach `www.pridesouthside.org` or `static.wixstatic.com`: the remote
environment's egress proxy refused the connection
(`curl` returned `000`, `connect_rejected`).

Once those two domains are allowlisted in the environment's network
policy, the import can run. This file lists exactly what needs to land
and where, so nothing is lost.

## Photography

Every spot on the site that is waiting for a real photo renders as a
dashed `.photo-slot` box whose label names the photo it wants. Find them
all with:

```sh
grep -rn "import from pridesouthside.org" *.html
```

Drop the imported files in `assets/img/imported/` and replace the
surrounding `<div class="photo-slot …">` with an `<img>`.

## Copy and data still to verify

These facts were carried over from the previous build of this repo rather
than read from the live site, so confirm each one against
pridesouthside.org before launch:

- Festival date: **Sunday, July 5, 2026**
- Festival venue: **DuSable Black History Museum**, admission free
- "Pride South Side is a fiscal program of the Center on Halsted"
- The sponsor list on the homepage and its six outbound links
- The external links in the footer (`/vendor`, `/sponsors`, `/faqs`,
  `/donate`) and the festival RSVP link

## Structured data to load into Supabase

Tables are live and empty. Each renders a "coming soon" placeholder until
it has rows:

| Table | Fills | Placeholder shown while empty |
|---|---|---|
| `events` | Community calendar, homepage teaser | "Community events coming soon!" |
| `health_providers` | Healthcare directory in the Member Hub | "Healthcare providers coming soon!" |
| `marketplace_products` | Marketplace grid | "Shop coming soon!" |
| `partner_orgs` | Directory of Services tier | (not yet surfaced) |

Load them through the Supabase dashboard or the MCP tools — no seed data
is invented here on purpose.
