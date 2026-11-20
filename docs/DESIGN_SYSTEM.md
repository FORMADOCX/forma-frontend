# FORMA v0.8.0 — Premium Editorial Document Library

## Approved visual direction

The three user-approved references define composition for Homepage, All Templates and The Clean Invoice detail page. References are **not** data sources; only published Django data and actual document previews are rendered. No lifestyle placeholder, made-up download count, fake file format, or user authentication.

## Design tokens

Tokens are centralized in `src/styles/tokens.css` and composed in `src/app/globals.css`.

| Token | Value | Intended use |
| --- | --- | --- |
| `--paper` | `#f9faf9` | Page background |
| `--surface` | `#fff` | Inputs, cards, forms |
| `--soft` | `#f0f2f1` | Quiet gallery / empty state |
| `--ink` | `#182021` | Main content |
| `--muted` | `#59616a` | Supporting text |
| `--border` | `#dfe3e5` | Hairlines / card outlines |
| `--accent` | `#365c45` | CTA, focus, active state |
| `--font-editorial` | Georgia, Times New Roman, serif | H1 and editorial section headings |
| `--font` | Arial, Helvetica, sans-serif | Navigation, cards, body, controls |
| `--container` | 1500px | Max content width |

System fonts are used intentionally to avoid third-party font loading. Interactive focus uses a visible green outline. There are no third-party UI frameworks or animation libraries.

## Component system

- `Header`, `Footer`: universal navigation, compact search, EN/UK switch, accessible mobile `<details>` menu. No account UI.
- `SearchForm`: native GET form used both in the header and editorial hero.
- `TemplateCard` + `DocumentCover`: clickable detail preview + Quick Preview. Cover URLs are accepted only by existing trusted preview URL validation.
- `Catalog` + `CatalogFilters`: URL-driven API filtering. Responsive grid, native single/multi/boolean inputs, mobile dialog with Apply/Clear and focus return.
- `DocumentGallery`: backend document page images with thumbnail buttons, arrow navigation, Home/End, a live page counter and native image aspect ratios.
- `TemplateDetailPage`: genuine file download links validated against the configured backend, real metadata and grouped sections.
- `QuickPreview`: native dialog with real cover, compact DTO fields, trusted available download actions, Escape / native scroll locking / focus return.
- `CmsPageView`, `SafeMarkdown`, `SubmissionForm`: preserved accessibility and backend-driven states.

## Responsive rules

- 1920/1440px: split editorial hero with decorative approved artwork, up to five portrait homepage featured cards and categories.
- 1024px: tightened header, two-column result cards; detail remains split if space allows.
- 768px: compact mobile navigation; hero/detail stack, native filters dialog, results use two columns.
- 390px: one-column catalog results and detail, two-column compact home featured cards, horizontally scrollable thumbnail strip, full-width CTAs.

Breakpoints in CSS: 1250, 1024, 768, and 520 px. These are implementation rules, **not proof of visual browser tests** at specific viewport sizes.

## Document image policy

- Homepage uses the approved decorative editorial hero asset (`/images/forma-hero.webp`) as a local WebP, **not** as an actual template preview. Future CMS hero media requires a verified backend contract; catalog document images always come from Django.
- No stock image or invented document cover.
- Next.js Image receives a known intrinsic width/height; gallery receives exact dimensions when supplied by backend.
- Trust rules for preview and download origins remain in `src/lib/preview-image.ts` / `src/lib/download-url.ts`.
- Catalog summary DTO has no formats, so cards do not invent file types. Format details appear where available from Quick Preview / Detail.

## SEO, localization and limitations

The preexisting metadata, structured data, sitemap and `indexingEnabled=false` policy are unchanged. Both locale route trees remain intact, including category `searchParams` forwarding and the CMS `locale` DTO. CMS footer uses verified Detail visibility. No login, register, accounts or client authentication.

Visual checks at 390, 768, 1024, 1440, 1920 px and Django live integration remain required before release. Full test/build status is recorded in `PROJECT_CONTEXT.md`.

Related templates on Detail are fetched from the **same published category** via `GET /api/v1/templates/`; the current template is excluded. When the related request fails or returns no other published templates, the section is omitted rather than fabricated.

## v0.8.2 homepage assets and progressive disclosure

- `forma-hero.webp` is a 2:1 decorative illustration shown beside the homepage headline; alt is empty because it contains sample document design rather than actual downloadable products.
- `forma-contribute.webp` is an understated 3:1 background, with readable text and CTA over its uncluttered center; assets are bundled in `/public/images/`.
- Featured category tiles have a pale mint `#edf5ef` background with text on one line (`text-overflow:ellipsis`) and no icons.
- Template-card summaries render from `TemplateList.summary` if present. On hover-capable desktops the Quick Preview action is located in an absolutely positioned panel BELOW the card (no reflow), revealed by `:hover` or `:focus-within`; on touch it is in document flow, visible by default, and at least 44px tall. The modal itself is unchanged.
- Hero search placeholder: “Search templates (e.g., invoice, report, proposal)”. Featured template CTA: “View All Templates”. The global header retains no static About link.

## Admin-only MVP (v0.8.5)
The former Community Submission strip is removed. Keep Homepage hero/category/featured geometry unchanged; do not show a decorative upload CTA. Only genuine Django document previews belong in the catalog.
