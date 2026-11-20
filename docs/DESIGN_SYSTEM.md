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
- `QuickPreview`: right-side desktop native dialog drawer with a real cover, compact DTO fields, trusted download actions, Escape/backdrop/Close, scroll locking and focus return; disabled on mobile (cards link to full details).
- `CmsPageView` and `SafeMarkdown`: CMS content and backend-driven states. Public submission forms are removed under Admin-Only Publishing.

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
- The former Community Submission background is not included in the current Admin-Only MVP.
- Featured category tiles have a pale mint `#edf5ef` background with text on one line (`text-overflow:ellipsis`) and no icons.
- Template-card summaries render from `TemplateList.summary` if present. On hover-capable desktops the Quick Preview action is located in an absolutely positioned panel BELOW the card (no reflow), revealed by `:hover` or `:focus-within`; on mobile (<=767px) the Quick Preview trigger is omitted from presentation and template links lead directly to Detail. The desktop preview uses a right-side drawer.
- Hero search placeholder: “Search templates (e.g., invoice, report, proposal)”. Featured template CTA: “View All Templates”. The global header retains no static About link.

## Admin-only MVP (v0.8.5)
The former Community Submission strip is removed. Keep Homepage hero/category/featured geometry unchanged; do not show a decorative upload CTA. Only genuine Django document previews belong in the catalog.

## v0.8.6 interaction refinements

- Browser brand icon: App Router `src/app/icon.svg` and PNG companions.
- Search magnifier is a real form submit control, also accessible with keyboard.
- Featured sections are not rendered when their API result is empty; errors remain distinguishable.
- Skip link appears on keyboard focus only.
- `DocumentLightbox` reuses trusted Django preview sources in native modal dialogs, with pagination and magnification up to 300%; source resolution limits actual fidelity.
- `LoadingIndicator` is used for route and Quick Preview loading states.
- Catalog selects remain native. Pagination links preserve query and filter parameters.
- Hover image scale 1.03, 250ms; all animations disabled or reduced under reduced-motion preferences.

## v0.8.6 preview and viewing correction (2026-11-20)

- Desktop Quick Preview is a native `<dialog>` right-side drawer. It uses the trusted Django PNG cover, abortable requests, real download URLs, localized summary and full-detail link. The dialog is top-layer: no decorative overlay intercepts controls.
- Under 768px, card Quick Preview controls are hidden and the component guards against accidental API fetches; the template image and title still navigate to Template Detail. Tablet widths from 768px use a wider proportional drawer.
- The main Document Gallery page is shown at intrinsic aspect ratio with `height:auto`, `object-fit:contain`, and no fixed maximum height or landscape aspect container. Thumbnails and the existing `DocumentLightbox` remain.
- Page-level loading uses a geometric document outline and a viewport-aware content region. Reduced-motion users see a static indicator, with localized screen-reader status.
- Search magnifier is centered within the input, remains clickable, and shares native GET form submission with Enter.
- Native dialogs are responsive, but browser visual QA with the staging API is still required at 390, 768, 1024, 1440 and 1920px. No improvement to the source resolution of backend PNG images is claimed.
