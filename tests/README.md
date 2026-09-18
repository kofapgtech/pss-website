# Tests

Two suites. Both are read-only against real behaviour: the browser suite
stubs the network, and the SQL suites roll back.

## Browser acceptance tests

```sh
npm install      # playwright (dev dependency only)
npm test
```

`tests/lovewell.test.js` drives the real pages in headless Chromium with
`tests/stubs.js` standing in for supabase-js and Leaflet, so no network
and no live database are touched. It covers:

- sign up by email, and that the form carries display name, pronouns and
  neighborhood into user metadata
- sign up / sign in with Google and Apple, including the message shown
  while those providers are not yet configured in Supabase
- log in, the redirect to the hub, and password reset
- the hub gate: a logged-out visitor never sees member content
- creating posts, viewing posts, commenting, and the empty-feed state
- the healthcare directory: empty state, the four concern filters,
  stacking filters, no-match state, clearing filters, and map pins
- coupons: Apple Wallet button when a signed pass exists, the pending
  message when it does not, redeem links, and expiry filtering
- the vendor map and the non-participating vendor flag
- escaping of hostile member- and vendor-supplied text

Set `CHROME_PATH` if Chromium is somewhere other than the default.

## Row Level Security tests

`tests/rls/` holds SQL that runs against the live database, asserts by
raising a summary, and aborts so nothing persists. Run either file
through the Supabase SQL editor, `psql`, or the Supabase MCP tools. The
final `ERROR: P0001` is the expected rollback — read its message for the
PASS/FAIL table.

- `01_membership_and_posts.sql` — the sign-up trigger, posting,
  cross-member tampering, and what an anonymous visitor can read
- `02_directory_vendors_coupons.sql` — public vs member-only coupons,
  draft rows staying hidden, filter-by-concern queries, and the
  coordinate/validity constraints

Neither suite seeds data into the real tables.
