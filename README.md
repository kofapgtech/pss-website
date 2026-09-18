# Pride South Side — Digital Hub

Website for Pride South Side, the South Side of Chicago's Black- and
Brown-led LGBTQI+ festival and community organization.

The site is plain static HTML (Tailwind CSS via CDN, no build step) with a
Supabase backend for the parts that need accounts and data: the **Lovewell
Membership Program**.

## Pages

| File | What it is |
|---|---|
| `index.html` | Home. Sections run in roadmap order: events → marketplace → Lovewell → media |
| `events.html` | Events & Community Calendar, plus the Submit Your Event form |
| `shop.html` | Pride South Side Marketplace — "coming soon" stub |
| `lovewell.html` | Lovewell Membership Program overview, benefits, and partner tiers |
| `join.html` | Sign up / log in / password reset |
| `hub.html` | Member Hub: community feed, comments, healthcare directory, profile |
| `media.html` | The Front Porch Media — "coming soon" stub |

Shared chrome (header, footer, Tailwind theme) is duplicated across the
HTML files on purpose so each page is a standalone static document; the
theme itself lives once in `assets/js/theme.js`.

## Lovewell membership

Membership is free and equals having an account. Signing up creates an
`auth.users` row; a trigger mints the matching `profiles` row.

Members can:

- post to the community feed and comment on other members' posts
- delete their own posts
- edit their display name, pronouns, neighborhood, and bio
- see the healthcare directory and member marketplace pricing

Logged-out visitors get the marketing pages, the public events calendar,
and the event-submission form. They cannot read the feed or the member
directory — that is enforced by Row Level Security, not by the UI.

### Backend

Supabase project **pride-south-side** (`jcskmaiqkdoxubfsdons`).
Connection values live in `assets/js/config.js`. The key there is the
*publishable* key, which is designed to ship in a browser — RLS is what
protects the data. **Never put the `service_role` key in this repo.**

Schema and policies are in `supabase/migrations/`. The RLS policies were
exercised against the live database with a 15-assertion test covering
sign-up, posting, cross-member tampering, and anonymous access; all
passed and the transaction was rolled back.

Supabase's security linter reports one remaining warning: `is_moderator()`
is executable by signed-in users. That is deliberate and required — the
RLS policies on `posts`, `post_comments` and `profiles` call it, and
policy expressions run as the querying role, so revoking the grant would
break them. The function takes no arguments and returns only whether the
*caller* is a moderator, so it exposes nothing. `anon`'s grant was
revoked.

### Moderation

`profiles.role` is one of `member`, `moderator`, `admin`. Moderators can
hide any post or comment (set `status` to `removed`) and edit profiles.
Promote someone by updating their `role` in the Supabase dashboard. There
is no moderation UI on the site yet.

## Local preview

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. Auth and data work against the live
Supabase project, so sign-ups from localhost create real accounts.

For the email confirmation and password-reset links to work in
production, add the deployed origin to **Authentication → URL
Configuration** in the Supabase dashboard.

## Hosting

Static hosting of the repo root. Deploying to GitHub Pages needs
**Settings → Pages → Source: Deploy from a branch** (or a workflow); no
build step is required either way.

## Status against the roadmap

| Roadmap item | State |
|---|---|
| Events listing / community calendar | Built, reads from `events`; table is empty so it shows "coming soon" |
| Festival as the main draw | Built and pinned on the homepage and events page |
| Festival photo/video reel | Placeholder slots — waiting on the photo import |
| Shop, prompts login at checkout | Stub. Guests see "Sign in to buy"; member pricing is modelled in the schema |
| Lovewell: become a member, log in | **Built and tested** |
| Lovewell: social community hub (posting) | **Built and tested** |
| Lovewell: marketplace discounts | Surfaced in the UI; applies once products exist |
| Lovewell: healthcare directory | Built, reads from `health_providers`; empty, shows "Healthcare providers coming soon!" |
| Lovewell: de-emphasised healthcare | Directory only, no clinical/reimbursement features |
| Partner tiers (Directory of Services, Storytelling) | Described on `lovewell.html`; `partner_orgs` table exists, no sign-up flow |
| Front Porch Media | Stub, as specified for the first iteration |

## Outstanding

- **Nothing has been imported from the live pridesouthside.org site yet.**
  The build session's network egress proxy blocked both
  `www.pridesouthside.org` and `static.wixstatic.com`. See
  `content/imported/README.md` for exactly what needs to land and the
  facts that still need verifying against the live site.
- No copy on this site was invented to fill space. Where content does not
  exist yet the page says so ("coming soon") rather than showing
  placeholder prose.
