# Pride South Side — Digital Hub

Static website for Pride South Side, the South Side of Chicago's Black- and
Brown-led LGBTQI+ festival and community organization. Built around three
pillars: **Buy South Side** (vendor shop), the **Community Events Calendar**,
and **Lovewell** (loyalty + healthcare access).

## Pages

- `index.html` — Home: hero, festival details, shop/events/Lovewell previews, Front Porch Media, sponsors, mailing list
- `shop.html` — Buy South Side vendor marketplace
- `events.html` — Community calendar, festival highlight, Front Porch Stages
- `lovewell.html` — Lovewell program overview, waitlist signup, member Hub preview

No build step is required — every page is plain HTML using the Tailwind CSS
CDN build and Google Fonts (Bricolage Grotesque + Atkinson Hyperlegible Next).

## Local preview

Open any HTML file directly in a browser, or serve the folder locally:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Hosting (GitHub Pages)

`.github/workflows/deploy.yml` deploys the site to GitHub Pages on every push
to `main`. One-time setup: in the repo's **Settings → Pages**, set **Source**
to **GitHub Actions**. After that, every push to `main` publishes automatically.

## Notes / follow-ups

- Product, event, and hero photography currently use placeholder images from
  the original design mockups. Swap in real photography before treating this
  as production-final.
- The mailing list and Lovewell waitlist forms are front-end only (no backend
  yet) — wire them up to an email service or CRM when one is chosen.
- RSVP, Donate, Health Survey, Vendor Application, and Submit-an-Event links
  point to the organization's existing live pages/forms on pridesouthside.org.
