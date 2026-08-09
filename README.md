# Crown of Glory Glasgow — website

A static, multi-page website for RCCG Crown of Glory Glasgow, built to the
"Royal Warmth" brand spec (light, ivory-and-purple, regal but never cold).

Plain HTML/CSS with light vanilla JS. No frontend framework. A tiny
dependency-free Node build script assembles every page from **one** shared
header and footer, so the header/nav markup can never drift or accidentally
duplicate a CTA between pages (the old site's recurring "Give" button bug).

## Folder structure

```
.
├── build.js              # Build script — assembles pages, no dependencies
├── content/               # Per-page <main> content fragments (one file per page)
│   ├── home.html
│   ├── im-new.html
│   ├── about.html
│   ├── ministries.html
│   ├── sermons.html
│   ├── events.html
│   ├── blog.html
│   ├── give.html
│   └── contact.html
├── assets/
│   ├── css/style.css      # Full "Royal Warmth" design system (tokens, type, components)
│   └── js/main.js         # Mobile nav toggle, form validation, events view toggle
├── robots.txt
├── sitemap.xml
├── dist/                  # Generated output — do not hand-edit, run the build instead
│   ├── index.html
│   ├── im-new/index.html
│   ├── about/index.html
│   ├── ministries/index.html
│   ├── sermons/index.html
│   ├── events/index.html
│   ├── blog/index.html
│   ├── give/index.html
│   ├── contact/index.html
│   └── assets/…
└── README.md
```

The header (logo lockup, nav, single "Watch Live" CTA) and footer (four
columns + bottom bar) are defined once each, as functions inside `build.js`.
Every page is produced by wrapping a `content/*.html` fragment in that shared
header/footer plus a `<head>` with per-page title, meta description, and
Open Graph tags (see the `pages` array at the top of `build.js`).

## Running locally

**Do not open files under `/content` directly in a browser.** Those are bare
`<main>` fragments — no `<html>`, `<head>`, or stylesheet `<link>` at all —
so of course they render unstyled; they only become real pages once `build.js`
wraps them. The real, styled pages live in `/dist` after you build.

1. Build the static site:
   ```
   npm run build
   # equivalent to: node build.js
   ```
   This regenerates everything in `/dist` from `/content`, `/assets`,
   `robots.txt`, and `sitemap.xml`.

2. Open the site. Every generated page (`/dist/index.html`,
   `/dist/about/index.html`, …) links to its stylesheet, scripts, and other
   pages using **relative paths with an explicit `index.html`** (e.g.
   `../assets/css/style.css`, `../about/index.html`), so `/dist` works two ways:

   - **Straight from disk, no server** — just double-click
     `dist/index.html` (or drag it into a browser tab). Every link and asset
     resolves correctly under `file://` because nothing is root-absolute.
   - **From a local static server** (recommended for anything beyond a quick
     look — closer to how it'll actually be hosted):
     ```
     npm run serve
     # equivalent to: npx serve dist -p 8080
     # or: python3 -m http.server --directory dist 8080
     ```
     then visit `http://localhost:8080/`.

   `npm start` runs both steps (`build` then `serve`) in one command.

3. After any change to `content/*.html`, `build.js`, or files under
   `/assets`, re-run `npm run build` (or just `node build.js`) and
   refresh/re-serve `/dist`.

### Why relative paths matter here

Pages are written to `/dist/<slug>/index.html` (one folder deep) except the
homepage (`/dist/index.html`, at the root). `build.js` computes a `base`
prefix per page — `""` for the homepage, `"../"` for every other page — and
uses it for the stylesheet, script, and every internal link, including the
ones written inside `content/*.html` as easy-to-read root-absolute paths like
`href="/about/"` (a `rewriteContentLinks()` pass in `build.js` converts those
into the correct relative form automatically at build time — you never need
to hand-write relative paths in `/content`). This is also why the header/nav
and footer are generated functions rather than static HTML: the same
`header()`/`footer()` call produces different link paths depending on which
page is asking, from one definition.

## Editing content

- **Page copy/sections**: edit the relevant file in `/content`. These are
  HTML fragments (no `<html>`/`<head>`/`<header>`/`<footer>`) — just the
  `<main>` contents for that page.
- **Header, footer, nav, page `<title>`/meta description**: edit `build.js`
  (the `pages` array, and the `header()` / `footer()` / `layout()`
  functions). This is the single source of truth — never copy header/footer
  markup into a content file.
- **Design tokens (colours, type scale, spacing, components)**: edit
  `assets/css/style.css`. All colours are CSS custom properties defined
  once at the top of the file.

## Where a real backend/CMS would plug in

This build ships with no backend — forms are client-side validated only,
and sermons/events content is hand-authored HTML. To make it dynamic:

- **Forms** (`I'm New` → Plan Your Visit, `Contact` → prayer request /
  general enquiry, `Blog` → email subscribe): each `<form>` in `/content`
  has a placeholder `action` attribute (e.g. `/api/plan-your-visit`,
  `/api/contact`) and an HTML comment marking where to wire up a real
  handler. Point these at a form backend (Netlify Forms, Formspree, a
  serverless function, or your CMS's own endpoint) and replace the
  client-side-only success message in `assets/js/main.js` with a real
  `fetch()` submission.
- **Sermons** (`/sermons/`): the "Past Messages" grid and featured sermon
  block in `content/sermons.html` are static markup. Swap this for a loop
  over records from a CMS (e.g. sermon title, speaker, date, video URL) —
  the card markup and filter row (series/date/search) are already in place
  and just need real data and (for search/filter) a small client-side or
  server-side query.
- **Events** (`/events/`): same pattern — `content/events.html`'s list and
  calendar placeholder should be generated from a CMS/database of events
  (date, title, time, location, RSVP link) rather than hand-edited HTML.
- **Blog** (`/blog/`): `content/blog.html`'s featured post and post grid
  should be generated from a CMS collection (title, date, category,
  thumbnail, body).
- **Give** (`/give/`): the "Give online" and recurring-giving buttons are
  placeholder links (`href="#"`) — connect these to your payment
  processor's hosted checkout or embeddable widget (e.g. Stripe, GoCardless,
  a denomination-specific giving platform).

## Imagery

Every photo in the site is a labelled placeholder block (see `.placeholder`
in `assets/css/style.css`) with descriptive alt text, per the brand rule
against stock photography — "real congregation, no stock." Replace each
`.placeholder` `<div>` with a real `<img>` (keeping the alt text as a
starting point) as photography becomes available. Any placeholder standing
in for an identifiable photo of a child is flagged in the HTML with a
guardian-consent note — check before publishing a real photo in that slot.

## Accessibility

Semantic landmarks, a skip-to-content link, one `<h1>` per page, 17px+ body
text, AAA-contrast colour pairings, 44px minimum touch targets, and visible
focus states are all implemented directly in `assets/css/style.css` and the
page markup — see the brand spec for the full rationale.
