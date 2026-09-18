#!/usr/bin/env node
/* Lovewell acceptance tests.
 *
 * Drives the real pages in a real browser against stubbed Supabase and
 * Leaflet, and checks the member journeys end to end:
 *
 *   sign up (email, Google, Apple) · log in · create posts · view posts
 *   · healthcare directory incl. empty state, concern filters and map
 *   · coupons, Apple Wallet passes and redeem links · vendor map
 *
 * Run with:  node tests/lovewell.test.js
 * Exits non-zero if any check fails.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { installStubs } = require('./stubs');
const F = require('./fixtures');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT || 8899);
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); res.end('not found'); return;
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(fs.readFileSync(file));
    });
    server.listen(PORT, () => resolve(server));
  });
}

/* Call log that survives a page navigation. */
const persistedCalls = (page) => page.evaluate(() => {
  try { return JSON.parse(sessionStorage.getItem('__calls') || '[]'); } catch (e) { return []; }
});

/* --- tiny assertion harness ----------------------------------------- */
let passed = 0;
const failures = [];
let group = '';

const section = (name) => { group = name; console.log('\n' + name); };
function check(label, cond, detail) {
  if (cond) { passed++; console.log('  \x1b[32mPASS\x1b[0m  ' + label); }
  else {
    failures.push(group + ' › ' + label + (detail ? '  (' + detail + ')' : ''));
    console.log('  \x1b[31mFAIL\x1b[0m  ' + label + (detail ? '  → ' + detail : ''));
  }
}

/* Network errors are expected: the sandbox blocks the Tailwind, Leaflet
   and Supabase CDNs. Only genuine script faults should fail a test. */
const IGNORABLE = /Failed to load resource|ERR_|net::|Failed to fetch|favicon/i;

(async () => {
  const server = await serve();
  const browser = await chromium.launch({ executablePath: CHROME });

  async function open(page_, opts = {}) {
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && !IGNORABLE.test(m.text())) errs.push('console: ' + m.text());
    });
    const cfg = { signedIn: false, tables: {}, oauthFails: false, ...opts };
    await page.addInitScript({
      content: `(${installStubs.toString()})(${JSON.stringify(cfg)})`
    });
    await page.goto(`http://localhost:${PORT}/${page_}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(700);
    return { ctx, page, errs };
  }

  const memberTables = {
    profiles: [F.ME], posts: F.FEED, care_categories: F.CATEGORIES,
    health_providers: F.PROVIDERS, vendors: F.VENDORS, coupons: F.COUPONS
  };

  // =================================================================
  section('Sign up — email');
  {
    const { ctx, page, errs } = await open('join.html');
    check('page loads without script errors', errs.length === 0, errs.join(' | '));
    await page.fill('#su-name', 'New Member');
    await page.fill('#su-pronouns', 'she/her');
    await page.fill('#su-hood', 'Woodlawn');
    await page.fill('#su-email', 'new@example.test');
    await page.fill('#su-password', 'correcthorse');
    await page.click('#panel-signup button[type=submit]');
    await page.waitForTimeout(400);

    const call = (await page.evaluate(() => window.__calls)).find((c) => c.op === 'signUp');
    check('submits a sign-up', Boolean(call));
    check('sends email and password', call && call.value.email === 'new@example.test' && call.value.password === 'correcthorse');
    check('carries display name into user metadata', call && call.value.options.data.display_name === 'New Member');
    check('carries pronouns and neighborhood', call && call.value.options.data.pronouns === 'she/her'
      && call.value.options.data.neighborhood === 'Woodlawn');
    await ctx.close();
  }

  section('Sign up — Google and Apple');
  {
    const { ctx, page, errs } = await open('join.html');
    check('both provider buttons are offered', await page.locator('[data-oauth]').count() === 2);
    check('Google button present', await page.isVisible('[data-oauth="google"]'));
    check('Apple button present', await page.isVisible('[data-oauth="apple"]'));

    await page.click('[data-oauth="google"]');
    await page.waitForTimeout(300);
    let calls = await page.evaluate(() => window.__oauth);
    check('Google button starts a Google OAuth flow', calls.length === 1 && calls[0].provider === 'google',
      JSON.stringify(calls));

    await page.click('[data-oauth="apple"]');
    await page.waitForTimeout(300);
    calls = await page.evaluate(() => window.__oauth);
    check('Apple button starts an Apple OAuth flow', calls.length === 2 && calls[1].provider === 'apple',
      JSON.stringify(calls));
    check('OAuth returns the member to the hub',
      calls[1].options.redirectTo.endsWith('/hub.html'), calls[1].options.redirectTo);
    check('no script errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }
  {
    /* Providers are not configured in Supabase yet, so the failure path
       is the one members will actually hit until credentials are added. */
    const { ctx, page } = await open('join.html', { oauthFails: true });
    await page.click('[data-oauth="apple"]');
    await page.waitForTimeout(300);
    const msg = await page.textContent('#oauth-status');
    check('unconfigured provider explains itself instead of dead-ending',
      /not available yet/i.test(msg), msg);
    check('and points at the email fallback', /email/i.test(msg), msg);
    await ctx.close();
  }

  section('Log in');
  {
    const { ctx, page } = await open('join.html?mode=signin');
    check('log-in panel is shown when asked for', await page.isVisible('#panel-signin'));
    await page.fill('#si-email', 'ada@example.test');
    await page.fill('#si-password', 'hunter2hunter2');
    await page.click('#panel-signin button[type=submit]');
    await page.waitForTimeout(600);

    /* A successful log-in navigates to the hub, so read the call log from
       sessionStorage rather than the discarded page context. */
    const call = (await persistedCalls(page)).find((c) => c.op === 'signIn');
    check('submits credentials', Boolean(call) && call.value.email === 'ada@example.test',
      JSON.stringify(call));
    check('successful log-in lands on the hub', page.url().endsWith('/hub.html'), page.url());
    await ctx.close();
  }
  {
    const { ctx, page } = await open('join.html?mode=signin');
    await page.fill('#si-email', 'ada@example.test');
    await page.click('#forgot-password');
    await page.waitForTimeout(400);
    check('password reset can be requested',
      (await persistedCalls(page)).some((c) => c.op === 'reset'));
    check('reset confirms without leaking whether the account exists',
      /on its way/i.test(await page.textContent('#signin-status')));
    await ctx.close();
  }
  {
    const { ctx, page } = await open('hub.html');
    check('signed-out visitor is gated out of the hub',
      await page.evaluate(() => !document.getElementById('hub-gate').hidden));
    check('member content stays hidden',
      await page.evaluate(() => document.getElementById('hub-content').hidden));
    await ctx.close();
  }

  section('Create and view posts');
  {
    const { ctx, page, errs } = await open('hub.html', { signedIn: true, tables: memberTables });
    check('signed-in member reaches the hub',
      await page.evaluate(() => !document.getElementById('hub-content').hidden));
    check('no script errors', errs.length === 0, errs.join(' | '));

    const feed = await page.textContent('#feed');
    check('existing post is shown', feed.includes('Block party on 47th'));
    check('post author is shown', feed.includes('Ada Test'));
    check('author pronouns are shown', feed.includes('(they/them)'));
    check('comments are shown', feed.includes('See you there!'));
    check('commenter is named', feed.includes('Bo Neighbor'));

    await page.fill('#post-body', 'My first post');
    await page.click('#post-form button[type=submit]');
    await page.waitForTimeout(400);
    const ins = (await page.evaluate(() => window.__calls))
      .find((c) => c.op === 'insert' && c.table === 'posts');
    check('member can create a post', Boolean(ins), JSON.stringify(ins));
    check('post is attributed to the member', ins && ins.value.author_id === 'me-1');
    check('post body is sent', ins && ins.value.body === 'My first post');

    await page.fill('#feed input[type=text]', 'Nice!');
    await page.click('#feed button[type=submit]');
    await page.waitForTimeout(400);
    const c = (await page.evaluate(() => window.__calls))
      .find((x) => x.op === 'insert' && x.table === 'post_comments');
    check('member can comment on a post', Boolean(c) && c.value.post_id === 'p1');
    await ctx.close();
  }
  {
    const { ctx, page } = await open('hub.html',
      { signedIn: true, tables: { profiles: [F.ME], posts: [] } });
    check('empty feed invites the first post',
      (await page.textContent('#feed')).includes('be the first'));
    await ctx.close();
  }

  section('Healthcare directory — empty');
  {
    const { ctx, page, errs } = await open('hub.html', {
      signedIn: true,
      tables: { profiles: [F.ME], posts: [], care_categories: F.CATEGORIES, health_providers: [] }
    });
    await page.click('#tab-care');
    await page.waitForTimeout(500);
    check('care tab opens', await page.evaluate(() => !document.getElementById('panel-care').hidden));
    check('empty directory says so',
      (await page.textContent('#providers')).includes('Healthcare providers coming soon!'));
    check('filters still render while empty', await page.locator('[data-concern]').count() === 4);
    check('map notes that locations are pending',
      (await page.textContent('#care-map-note')).includes('coming soon'));
    check('no script errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  section('Healthcare directory — list, filters, map');
  {
    const { ctx, page, errs } = await open('hub.html', { signedIn: true, tables: memberTables });
    await page.click('#tab-care');
    await page.waitForTimeout(500);

    check('every provider is listed', await page.locator('[data-provider]').count() === 3);
    check('count is reported', (await page.textContent('#care-count')).includes('3 providers'));

    const chips = await page.locator('[data-concern]').allTextContents();
    check('all four concerns are offered as filters', chips.length === 4, chips.join(', '));
    check('concerns are the specified ones',
      ['PrEP prescribers', 'STI Testing', 'Gender Affirming Care', 'Family Therapist']
        .every((c) => chips.includes(c)), chips.join(', '));

    // One filter.
    await page.click('[data-concern="prep-prescribers"]');
    await page.waitForTimeout(300);
    let names = await page.locator('[data-provider] h3').allTextContents();
    check('filtering by PrEP narrows the list', names.length === 2, names.join(', '));
    check('filter keeps only matching providers',
      names.includes('Clinic One') && names.includes('Clinic Three'), names.join(', '));
    check('filter chip reports its pressed state',
      await page.getAttribute('[data-concern="prep-prescribers"]', 'aria-pressed') === 'true');

    // Two filters combine (AND, not OR).
    await page.click('[data-concern="gender-affirming-care"]');
    await page.waitForTimeout(300);
    names = await page.locator('[data-provider] h3').allTextContents();
    check('stacking filters narrows further', names.length === 1 && names[0] === 'Clinic Three',
      names.join(', '));

    // Map reflects the filtered set, and Clinic Three has no coordinates.
    let markers = await page.evaluate(() => window.__markers.length);
    check('unmapped provider produces no pin', markers === 0, 'markers: ' + markers);
    check('map explains why it is empty',
      (await page.textContent('#care-map-note')).includes('mapped location'));

    // A filter with no matches.
    await page.click('[data-concern="sti-testing"]');
    await page.waitForTimeout(300);
    check('impossible filter combination reports no matches',
      (await page.textContent('#providers')).includes('No matches'));

    // Clear.
    await page.click('#care-clear');
    await page.waitForTimeout(300);
    check('clearing filters restores the full list',
      await page.locator('[data-provider]').count() === 3);
    check('clearing resets the chips',
      await page.getAttribute('[data-concern="prep-prescribers"]', 'aria-pressed') === 'false');

    markers = await page.evaluate(() => window.__markers.length);
    check('mapped providers are pinned', markers === 2, 'markers: ' + markers);
    const pins = await page.evaluate(() => window.__markers.map((m) => m.__latlng));
    check('pins use the providers’ coordinates',
      JSON.stringify(pins) === JSON.stringify([[41.88, -87.63], [41.81, -87.61]]), JSON.stringify(pins));
    check('map reports how many locations it shows',
      (await page.textContent('#care-map-note')).includes('2 locations'));
    check('provider card offers directions',
      await page.locator('[data-provider] a:has-text("Directions")').count() === 2);
    check('no script errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  section('Coupons, Apple Wallet and redemption');
  {
    const { ctx, page, errs } = await open('hub.html', { signedIn: true, tables: memberTables });
    await page.click('#tab-discounts');
    await page.waitForTimeout(500);
    check('discounts tab opens',
      await page.evaluate(() => !document.getElementById('panel-discounts').hidden));

    check('expired coupon is not shown', await page.locator('[data-coupon]').count() === 2,
      String(await page.locator('[data-coupon]').count()));
    check('live coupons are shown',
      (await page.textContent('#coupons')).includes('Coupon With Wallet Pass'));
    check('coupon shows its discount', (await page.textContent('#coupons')).includes('10% off'));
    check('coupon shows its code', (await page.textContent('#coupons')).includes('TESTCODE'));
    check('coupon names the vendor', (await page.textContent('#coupons')).includes('Vendor One'));

    // Apple Wallet.
    const wallet = page.locator('[data-wallet="c-1"]');
    check('Add to Apple Wallet offered when a pass exists', await wallet.count() === 1);
    check('Wallet button points at the .pkpass',
      (await wallet.getAttribute('href')) === 'https://example.test/pass-1.pkpass');
    check('Wallet button downloads rather than navigates',
      (await wallet.getAttribute('download')) !== null);
    check('coupon without a pass offers no Wallet button',
      await page.locator('[data-wallet="c-2"]').count() === 0);
    check('coupon without a pass says one is coming',
      (await page.textContent('[data-wallet-pending="c-2"]')).includes('coming soon'));

    // Redeem links.
    check('redeem link present on each live coupon',
      await page.locator('[data-redeem]').count() === 2);
    check('redeem link points at the vendor URL',
      (await page.getAttribute('[data-redeem="c-1"]', 'href')) === 'https://example.test/redeem-1');
    check('no script errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }
  {
    const { ctx, page } = await open('hub.html',
      { signedIn: true, tables: { profiles: [F.ME], posts: [], coupons: [], vendors: [] } });
    await page.click('#tab-discounts');
    await page.waitForTimeout(500);
    check('no coupons → "coming soon"',
      (await page.textContent('#coupons')).includes('Member discounts coming soon!'));
    check('no vendors → "coming soon"',
      (await page.textContent('#vendors')).includes('Participating vendors coming soon!'));
    await ctx.close();
  }

  section('Vendor map');
  {
    const { ctx, page, errs } = await open('hub.html', { signedIn: true, tables: memberTables });
    await page.click('#tab-discounts');
    await page.waitForTimeout(500);
    check('vendors are listed', await page.locator('[data-vendor]').count() === 2);
    check('vendor count is reported', (await page.textContent('#vendor-count')).includes('2 vendors'));
    check('non-participating vendor is flagged',
      (await page.textContent('[data-vendor="v-2"]')).includes('Not currently offering'));

    const pins = await page.evaluate(() => window.__markers.map((m) => m.__latlng));
    check('mapped vendor is pinned', pins.length === 1, JSON.stringify(pins));
    check('pin uses the vendor coordinates',
      JSON.stringify(pins[0]) === JSON.stringify([41.816, -87.617]), JSON.stringify(pins));
    check('map reports its location count',
      (await page.textContent('#vendor-map-note')).includes('1 location'));
    check('no script errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  section('Safety');
  {
    const evil = [{
      id: 'p9', body: '<img src=x onerror=alert(1)>', status: 'published',
      created_at: new Date().toISOString(), author_id: 'me-1',
      author: { id: 'me-1', display_name: '<script>alert(2)<\/script>' }, post_comments: []
    }];
    const hostileVendor = [{ id: 'v-9', name: '<img src=x onerror=alert(3)>',
      address: '1 Test St', latitude: 41.8, longitude: -87.6,
      is_participating: true, status: 'published' }];
    const { ctx, page, errs } = await open('hub.html', {
      signedIn: true,
      tables: { profiles: [F.ME], posts: evil, vendors: hostileVendor, coupons: [],
                care_categories: F.CATEGORIES, health_providers: [] }
    });
    check('hostile post content is escaped',
      await page.evaluate(() => document.querySelectorAll('#feed img, #feed script').length) === 0);
    check('hostile text is preserved verbatim',
      (await page.textContent('#feed')).includes('onerror=alert(1)'));

    await page.click('#tab-discounts');
    await page.waitForTimeout(400);
    check('hostile vendor name is escaped',
      await page.evaluate(() => document.querySelectorAll('#vendors img, #vendors script').length) === 0);
    check('no script errors from hostile content', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  await browser.close();
  server.close();

  console.log('\n' + '─'.repeat(60));
  if (failures.length) {
    console.log(`\x1b[31m${failures.length} failed\x1b[0m, ${passed} passed\n`);
    failures.forEach((f) => console.log('  ✗ ' + f));
    process.exit(1);
  }
  console.log(`\x1b[32mAll ${passed} checks passed\x1b[0m`);
})().catch((e) => { console.error(e); process.exit(1); });
