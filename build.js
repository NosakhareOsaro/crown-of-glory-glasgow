#!/usr/bin/env node
/*
 * Crown of Glory Glasgow — static site build script.
 *
 * Why this exists: header/footer/nav markup must live in exactly ONE place
 * so a copy-paste slip can never re-introduce a duplicate "Give" CTA in the
 * header (that was a real bug on the old site). This script assembles every
 * page from one header() and one footer() function plus a per-page content
 * fragment in /content, and writes fully static HTML to /dist.
 *
 * No dependencies. Run with: node build.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, "content");
const DIST_DIR = path.join(ROOT, "dist");
const SITE_URL = "https://www.crownofgloryglasgow.church"; // placeholder production URL

/* ------------------------------------------------------------------ */
/* Page registry                                                       */
/* ------------------------------------------------------------------ */

const pages = [
  {
    slug: "",
    dir: "",
    nav: "Home",
    file: "home",
    title: "Crown of Glory Glasgow | Welcome home this Sunday",
    description:
      "Crown of Glory Glasgow (RCCG) is a warm, family church in Glasgow's West End. Join us Sunday 10:30am — come as you are, belong from your first visit.",
  },
  {
    slug: "im-new",
    dir: "im-new",
    nav: "I'm New",
    file: "im-new",
    title: "I'm New | Crown of Glory Glasgow",
    description:
      "Planning your first visit to Crown of Glory Glasgow? Here's what to expect — parking, the service, kids' provision, and how to say hello.",
  },
  {
    slug: "about",
    dir: "about",
    nav: "About",
    file: "about",
    title: "About Us | Crown of Glory Glasgow",
    description:
      "Learn the story, leadership, and beliefs of Crown of Glory Glasgow (RCCG) — a family church gathering in Glasgow's West End.",
  },
  {
    slug: "ministries",
    dir: "ministries",
    nav: "Ministries",
    file: "ministries",
    title: "Ministries | Crown of Glory Glasgow",
    description:
      "Get connected at Crown of Glory Glasgow — explore our choir, ushering, media, children's, youth, welfare, and fellowship ministries.",
  },
  {
    slug: "sermons",
    dir: "sermons",
    nav: "Sermons",
    file: "sermons",
    title: "Sermons | Crown of Glory Glasgow",
    description:
      "Watch and catch up on messages from Crown of Glory Glasgow — our sermon library of past and present Sunday services.",
  },
  {
    slug: "events",
    dir: "events",
    nav: "Events",
    file: "events",
    title: "Events | Crown of Glory Glasgow",
    description:
      "See what's coming up at Crown of Glory Glasgow — upcoming services, prayer nights, and community events in Glasgow.",
  },
  {
    slug: "blog",
    dir: "blog",
    nav: "Blog",
    file: "blog",
    title: "News & Blog | Crown of Glory Glasgow",
    description:
      "News, testimonies, and devotionals from the Crown of Glory Glasgow family — stories from our church community.",
  },
  {
    slug: "give",
    dir: "give",
    nav: "Give",
    file: "give",
    title: "Give | Crown of Glory Glasgow",
    description:
      "Support the ministry of Crown of Glory Glasgow — give online, by bank transfer, or toward our building fund, securely and simply.",
  },
  {
    slug: "contact",
    dir: "contact",
    nav: "Contact",
    file: "contact",
    title: "Contact & Prayer Request | Crown of Glory Glasgow",
    description:
      "Get in touch with Crown of Glory Glasgow — send a prayer request, plan a visit, or ask a general question. We'd love to hear from you.",
  },
];

/* ------------------------------------------------------------------ */
/* Relative link helpers                                               */
/*                                                                      */
/* Every page is written as /slug/index.html (or /index.html for home). */
/* Links are built RELATIVE to that page — with an explicit index.html  */
/* filename — so the site works both double-clicked from disk (file://) */
/* and served from any static host, with no root-absolute "/" paths.    */
/* Since only two depths exist (home at the root, everything else one    */
/* folder down), "base" is either "" or "../".                          */
/* ------------------------------------------------------------------ */

function baseFor(dir) {
  return dir ? "../" : "";
}

// Relative href, from a page at `base`, to another page identified by its slug.
function pageHref(base, targetSlug) {
  return targetSlug === "" ? `${base}index.html` : `${base}${targetSlug}/index.html`;
}

/* ------------------------------------------------------------------ */
/* Crown mark (inline SVG, thin stroke, three dot finials)             */
/* ------------------------------------------------------------------ */

function crownSVG(className) {
  return `<svg class="${className}" viewBox="0 0 48 40" width="36" height="30" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true" focusable="false">
    <path d="M6 33 L6 17 L16 25 L24 12 L32 25 L42 17 L42 33 Z" />
    <line x1="6" y1="33" x2="42" y2="33" />
    <circle cx="6" cy="13" r="2.5" />
    <circle cx="24" cy="8" r="2.5" />
    <circle cx="42" cy="13" r="2.5" />
  </svg>`;
}

/* ------------------------------------------------------------------ */
/* Header (single source of truth — one Watch Live CTA, never repeated)*/
/* ------------------------------------------------------------------ */

// Primary nav keeps only what a first-time visitor or regular attender needs
// one click away. Home is reachable via the logo (standard pattern), and
// Ministries/Blog — lower-traffic, browse-later pages — live in a "More"
// disclosure so the bar never has to squeeze 9 items + a CTA into one row.
const PRIMARY_NAV_SLUGS = ["im-new", "about", "sermons", "events", "give", "contact"];
const MORE_NAV_SLUGS = ["ministries", "blog"];

function pageBySlug(slug) {
  return pages.find((p) => p.slug === slug);
}

function header(activeSlug, base) {
  const navLinks = PRIMARY_NAV_SLUGS.map((slug) => {
    const p = pageBySlug(slug);
    const href = pageHref(base, p.slug);
    const current = p.slug === activeSlug ? ' aria-current="page"' : "";
    return `<li><a href="${href}"${current}>${p.nav}</a></li>`;
  }).join("\n        ");

  const moreIsActive = MORE_NAV_SLUGS.includes(activeSlug);
  const moreLinks = MORE_NAV_SLUGS.map((slug) => {
    const p = pageBySlug(slug);
    const href = pageHref(base, p.slug);
    const current = p.slug === activeSlug ? ' aria-current="page"' : "";
    return `<li><a href="${href}"${current}>${p.nav}</a></li>`;
  }).join("\n            ");

  return `<header class="site-header">
    <div class="container">
      <a class="logo-lockup" href="${pageHref(base, "")}">
        ${crownSVG("logo-lockup__crown")}
        <span class="logo-lockup__text">
          <span class="logo-lockup__kicker">RCCG</span>
          <span class="logo-lockup__name">Crown of Glory</span>
        </span>
      </a>

      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open menu">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
          <line x1="2" y1="5" x2="20" y2="5" />
          <line x1="2" y1="11" x2="20" y2="11" />
          <line x1="2" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      <nav class="nav-primary" id="primary-navigation" aria-label="Primary">
        <ul class="nav-primary__list">
        ${navLinks}
        <li>
          <details class="nav-dropdown"${moreIsActive ? " open" : ""}>
            <summary${moreIsActive ? ' aria-current="page"' : ""}>
              More
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>
            </summary>
            <ul class="nav-dropdown__panel">
            ${moreLinks}
            </ul>
          </details>
        </li>
        </ul>
        <a class="watch-live" href="${pageHref(base, "sermons")}">
          <span class="watch-live__dot" aria-hidden="true"></span>
          Watch Live
        </a>
      </nav>
    </div>
  </header>`;
}

/* ------------------------------------------------------------------ */
/* Footer (single source of truth)                                     */
/* ------------------------------------------------------------------ */

function footer(base) {
  return `<footer class="site-footer">
    <div class="container footer-top">
      <div class="footer-col">
        <a class="logo-lockup" href="${pageHref(base, "")}">
          ${crownSVG("logo-lockup__crown")}
          <span class="logo-lockup__text">
            <span class="logo-lockup__kicker">RCCG</span>
            <span class="logo-lockup__name">Crown of Glory</span>
          </span>
        </a>
        <p class="body-small mt-3" style="color: var(--on-purple-soft);">A family church in Glasgow's West End. You belong here.</p>
      </div>

      <div class="footer-col">
        <h4>Explore</h4>
        <ul>
          <li><a href="${pageHref(base, "")}">Home</a></li>
          <li><a href="${pageHref(base, "about")}">About</a></li>
          <li><a href="${pageHref(base, "ministries")}">Ministries</a></li>
          <li><a href="${pageHref(base, "sermons")}">Sermons</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Connect</h4>
        <ul>
          <li><a href="${pageHref(base, "events")}">Events</a></li>
          <li><a href="${pageHref(base, "blog")}">Blog</a></li>
          <li><a href="${pageHref(base, "contact")}">Prayer Request</a></li>
          <li><a href="${pageHref(base, "im-new")}">I'm New</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Give &amp; Contact</h4>
        <ul>
          <li><a href="${pageHref(base, "give")}">Give Online</a></li>
          <li><a href="${pageHref(base, "contact")}">Contact Us</a></li>
        </ul>
        <h4 class="mt-4">Follow Us</h4>
        <div class="social-row">
          <a href="#" aria-label="Crown of Glory Glasgow on Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M15 8h2V5h-2a4 4 0 0 0-4 4v2H9v3h2v7h3v-7h2.5l.5-3H14V9a1 1 0 0 1 1-1Z"/></svg>
          </a>
          <a href="#" aria-label="Crown of Glory Glasgow on Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.2"/><circle cx="16.2" cy="7.8" r="0.6" fill="currentColor" stroke="none"/></svg>
          </a>
          <a href="#" aria-label="Crown of Glory Glasgow on YouTube">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="3"/><path d="M10.5 9.5 15 12l-4.5 2.5Z" fill="currentColor" stroke="none"/></svg>
          </a>
          <a href="#" aria-label="Crown of Glory Glasgow on X">
            <svg width="14" height="14" viewBox="0 0 1200 1227" fill="currentColor" stroke="none" aria-hidden="true"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/></svg>
          </a>
        </div>
      </div>
    </div>

    <div class="container footer-bottom">
      <div class="footer-bottom__group">
        <span>Where we currently gather: Ashgrove Community Hall, West End, Glasgow, G11 6UN</span>
        <span>Sun 10:30am · Prayer Fri 7pm · Bible Study Tue 7pm</span>
      </div>
      <span>&copy; ${new Date().getFullYear()} RCCG Crown of Glory Glasgow. All rights reserved.</span>
    </div>
  </footer>`;
}

/* ------------------------------------------------------------------ */
/* Layout                                                               */
/* ------------------------------------------------------------------ */

// Content fragments in /content author their internal links AND image paths
// as root-absolute ("/about/", "/assets/images/x.jpg", "/") because that's
// the readable form to write by hand. Rewrite those into page-relative form
// so the built page works under file://, and — just as importantly — under
// any subpath deployment (e.g. GitHub Pages project sites, which serve from
// /repo-name/ rather than /). A root-absolute src="/assets/…" silently
// resolves to the wrong host-root URL in that case; only base+"assets/…"
// resolves correctly regardless of what path prefix the site is served
// under. Anchors (#faq), external links (http…), and form actions
// (action="/api/…") are left untouched.
function rewriteContentLinks(html, base) {
  const knownSlugs = new Set(pages.map((p) => p.slug).filter(Boolean));
  const withPageLinks = html.replace(/href="\/([a-z0-9-]*)\/?"/g, (match, slug) => {
    if (slug !== "" && !knownSlugs.has(slug)) return match; // not a page link — leave as-is
    return `href="${pageHref(base, slug)}"`;
  });
  return withPageLinks.replace(/src="\/assets\/([^"]+)"/g, (match, assetPath) => {
    return `src="${base}assets/${assetPath}"`;
  });
}

function layout({ slug, dir, title, description, content }) {
  const base = baseFor(dir);
  const canonical = `${SITE_URL}/${dir ? dir + "/" : ""}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${canonical}" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Crown of Glory Glasgow" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${SITE_URL}/assets/og-image.jpg" />
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 40'%3E%3Cpath d='M6 33 L6 17 L16 25 L24 12 L32 25 L42 17 L42 33 Z' fill='none' stroke='%233D2B56' stroke-width='2.5' stroke-linejoin='round'/%3E%3Ccircle cx='6' cy='13' r='3' fill='%23C9A24B'/%3E%3Ccircle cx='24' cy='8' r='3' fill='%23C9A24B'/%3E%3Ccircle cx='42' cy='13' r='3' fill='%23C9A24B'/%3E%3C/svg%3E" />

  <!-- Google Fonts: absolute https:// URLs — these resolve the same whether
       the page is opened via file:// or served locally; they just need
       internet access, same as any CDN-hosted font. -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600&family=Inter:wght@400;500&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="${base}assets/css/style.css" />
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>

  ${header(slug, base)}

  <main id="main-content" tabindex="-1">
${rewriteContentLinks(content, base)}
  </main>

  ${footer(base)}

  <script src="${base}assets/js/main.js" defer></script>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ */
/* Build                                                                */
/* ------------------------------------------------------------------ */

function build() {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Copy static assets as-is
  copyDir(path.join(ROOT, "assets"), path.join(DIST_DIR, "assets"));
  for (const staticFile of ["robots.txt", "sitemap.xml"]) {
    const src = path.join(ROOT, staticFile);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(DIST_DIR, staticFile));
    }
  }

  for (const page of pages) {
    const contentPath = path.join(CONTENT_DIR, `${page.file}.html`);
    const content = fs.readFileSync(contentPath, "utf8");
    const html = layout({
      slug: page.slug,
      dir: page.dir,
      title: page.title,
      description: page.description,
      content,
    });

    const outDir = page.dir ? path.join(DIST_DIR, page.dir) : DIST_DIR;
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
    console.log(`built /${page.dir ? page.dir + "/" : ""}`);
  }

  console.log(`\nDone. ${pages.length} pages written to /dist`);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

build();
