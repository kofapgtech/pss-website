# Pride South Side — LoveWell

The Phase 1 digital hub for **LoveWell**, a program of Pride South Side (PSS) organizing a
collective of LGBTQ+ serving and allied organizations across the South and Southwest Sides of
Chicago. Built with Next.js (App Router) and Tailwind CSS v4.

## What's here

| Section | Route | Description |
| --- | --- | --- |
| Home | `/` | Hero, three pillars, upcoming events, LoveWell teaser, Front Porch teaser |
| WeShop | `/shop` | Vendor & product marketplace (past festival vendors) |
| PopOuts | `/events` | Community events calendar, category filters |
| LoveWell Directory | `/directory` | Starter & Featured partner organization directory |
| The Front Porch | `/front-porch` | Media & storytelling hub (articles, video, audio) |
| LoveWell | `/lovewell` | Program overview, perks preview, free "join" lead capture |
| Partner With LoveWell | `/partner` | The four revenue tiers + partner inquiry form |
| Staff Admin | `/admin` | Password-protected CMS for all of the above, plus a leads inbox |

Every public page reads from small JSON "collections" in `/data`, and the admin CMS
(`/admin`) writes to those same files through server actions — so publishing an event,
upgrading a directory listing, or adding a WeShop product shows up on the live site
immediately, no redeploy needed.

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. The staff admin is at `/admin/login`.

### Admin credentials

Set these in `.env.local` (see `.env.local.example`):

```
ADMIN_PASSWORD=choose-a-real-password
ADMIN_SESSION_SECRET=a-long-random-string
```

Without a `.env.local`, the app falls back to a **dev-only** password (`lovewell-admin`) —
never rely on that fallback outside of local development.

## Content model

All content lives as JSON in `/data/*.json`:

- `organizations.json` — LoveWell Directory (starter vs. featured tier, category, tags)
- `events.json` — PopOuts events (status: `pending` / `published`, featured flag)
- `vendors.json` / `products.json` — WeShop marketplace
- `stories.json` — The Front Porch articles/video/audio
- `leads.json` — every newsletter signup, partner inquiry, directory upgrade request, vendor
  application, and LoveWell join submitted through the site (viewable in `/admin/leads`)

Each collection is pre-populated with **starter profiles** for Phase 1: real past PSS
sponsors/partners in the directory (marked "Starter Profile" pending confirmation before the
Sept 30 partner-finalized deadline), sample WeShop vendors/products, and sample Front Porch
stories — so the site has real density on day one and staff can pitch partners against live
traffic, per the Phase 1 brief.

### Events submissions go through email, not a form

Per how PSS actually intakes events today, the **"Submit an Event"** buttons on `/events` open
a pre-filled `mailto:` to `events@pridesouthside.org` rather than writing to the database —
staff triage submissions from that inbox and publish them in `/admin/events`. Update the
address in `src/app/events/page.tsx` (`SUBMIT_EVENT_MAILTO`) once the real intake inbox is
confirmed.

## Important: this is a filesystem-backed data layer

There's no database or CRM behind this yet — the admin CMS reads/writes plain JSON files on
disk (`src/lib/data/store.ts`). That's intentional for Phase 1 (backend/CRM was explicitly
undecided at build time) and it means:

- **It works out of the box**, with zero setup, for local development and for any deployment
  target with a persistent, writable filesystem (a VM/container running `npm run start`,
  Docker, etc.).
- **It will *not* persist writes on typical serverless hosts** (e.g. Vercel's default runtime)
  — their filesystem is read-only/ephemeral at request time. If you deploy there, the admin
  CMS will appear to save but changes won't survive the next deploy or cold start.

**When a real backend/CRM is chosen**, the swap is contained: every page and admin form goes
through the small read/write functions in `src/lib/data/*.ts` (e.g. `getPublishedEvents()`,
`saveEvents()`). Point those at the new datastore (Postgres, the CRM's API, Supabase, etc.)
and nothing else in the app needs to change. `src/lib/actions/*.ts` (the server actions behind
every admin form and public lead form) can stay as-is.

## Design system

Colors, type, radii, and spacing are lifted from the Stitch-generated design brief
(Bricolage Grotesque headings, Atkinson Hyperlegible Next body copy, a Progress-Pride-accented
indigo/pink/amber palette) and implemented as a Tailwind v4 `@theme` in
`src/app/globals.css`. Product/event/story imagery uses a self-hosted, deterministic gradient
placeholder system (`src/components/placeholder-tile.tsx`) instead of external image URLs, so
the site never depends on third-party image hosting and never shows a broken image.

## Roadmap notes (from the program brief)

- **Soft site launch:** September 8, 2026. **Partners finalized:** September 30, 2026.
- Phase 2 introduces a companion app for direct service connections — the `/lovewell` page
  is deliberately a marketing/preview page (not a real per-member account system) until then.
- Launch goal: 20 Directory of Services subscribers ($1,000/mo) within 4 weeks of launch —
  see `/partner` for all four revenue tiers (Directory, Storytelling, Event Placement, Service
  Referral).

## Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```
