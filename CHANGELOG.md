## 0.8.6 — Category and search breadcrumb refinement (2026-11-20)

- Category Detail now displays only `Home / Current Category`, regardless of category depth, without an unnecessary parent-category API lookup.
- EN/UK search results now display `Home / Search Query`; a missing query uses the localized Search page title. The query is safely encoded in the current breadcrumb URL.
- Visible breadcrumbs and `BreadcrumbList` JSON-LD continue to consume the same items; catalog filters, routes and staging noindex are unchanged.
- Added regression tests for category depth, EN/UK, empty and encoded searches, and unchanged Template Detail breadcrumbs.

## 0.8.6 — Contextual category breadcrumbs (2026-11-20)

- Reused real Django category names and slugs in Template Detail breadcrumbs; omitted parent category on template pages; category pages can include verified parent category.
- Added shared accessible breadcrumb component and matching `BreadcrumbList` JSON-LD sourced from the exact UI items, with EN/UK URLs.
- Chose a deterministic category slug for multi-category templates because the public DTO does not expose `TemplateCategory.is_primary`; documented the minimal future backend enhancement.
- Added regression tests. No changes to API routes, publication, SEO indexing, filtering or the document pipeline.

## 0.8.6 — Brand icon update (2026-11-20)
- Replaced App Router browser icons using the user-approved green FORMA symbol: SVG, PNG 16/32 and Apple touch 180.
- No change to routes, content, API, dependencies, or UI layout.

## 0.8.6 — Quick Preview clickability and Detail cleanup (2026-11-20)

- Portaled the Quick Preview native dialog to `document.body`, outside the card hover-action wrapper that applies `visibility: hidden` and `pointer-events: none` when hover ends. This keeps drawer links, image zoom, downloads and Close interactive after moving the pointer into the drawer.
- Removed the redundant Quick Preview button from Template Detail. Full document previews, gallery/lightbox and downloads remain on that page; related-template cards can still open Quick Preview.
- Added regressions for portal isolation and Detail behavior. Updated one legacy test and removed obsolete Detail-only button CSS. No API, dependencies, SEO or EN/UK changes.

## 0.8.6 — UI/UX polish

- Browser icons, clickable search icon, conditional featured sections, skip-to-content keyboard behavior.
- Real document lightbox with page navigation, native dialog, scroll lock and zoom; shared in Quick Preview and Detail.
- Shared loading state, unified native selects, numbered pagination, pointer states, subtle image zoom with reduced-motion support.
- API contracts, SEO/indexing, EN/UK and Admin-Only Publishing unchanged.

# Changelog

## 0.8.6 — Quick Preview drawer and full-page gallery correction (2026-11-20)

- Replaced centered Quick Preview dialog with accessible desktop right-side drawer; mobile cards open Template Detail without Quick Preview network requests.
- Removed fixed-ratio/fixed-height detail gallery clipping; kept real Django previews, thumbnails and the shared fullscreen lightbox.
- Centered the Hero search icon and added a geometric localized, reduced-motion-compatible loader with viewport-aware placement.
- Added regression tests and refreshed .gitignore according to the approved development toolchain. No API or dependency changes.

Historical release notes below describe earlier implementations; **the current v0.8.5 MVP is Admin-Only Publishing**. Older Community Submission work is retained for historical context only and is not shipped in the current public UI.

## 0.8.5 — Public repository documentation cleanup (2026-11-20)

- Replaced cumulative release-by-release README with current English usage, architecture, environment, deployment and project status documentation.
- Added `docs/ARCHITECTURE.md` and `docs/DEPLOYMENT.md`; clarified the split between internal/public Django origins and verified SEO launch policy.
- Improved `.gitignore` for Vercel, IntelliJ IDEA, generated files and local environment configuration; provided a safe `.env.example`.
- Retained the established Admin-Only Publishing model without changing application source code, routes, dependencies or API behavior.

## 0.8.5 — Admin-Only Publishing (2026-11-19)

- Removed public Community Submission UI, client submission code and navigation CTA.
- `/submit` and `/uk/submit` deliberately return Next.js 404; CMS navigation and sitemap exclude the reserved slug.
- Preserved public anonymous browsing, previews, controlled downloads, EN/UK and approved design. Submissions remain deferred in the roadmap.
- Corrected an unused variable in `pages.tsx`; formatted the `getTemplates` TypeScript declaration without changing runtime logic.

## 0.8.4 — CMS header navigation and integration (2026-11-19)

- Added independent CMS-controlled header/footer visibility using shared Page Detail requests, EN/UK and bounded request batches.
- Normalized allowlisted document preview/download URLs and split internal Django origin from public browser origin.
- Supported JSON single- and multi-select attribute values; added CMS/integration regression tests and Windows-compatible ESLint harness fixes.

## 0.8.3 — Template card interaction (2026-11-19)

- Joined the Quick Preview hover extension visually to its parent card without reflowing the grid.

## 0.8.4 — Django integration compatibility and browser-origin safety

- Fixed select/multi-select attribute DTO JSON types and safe detail formatting.
- Separated internal API origin from public preview/download/submission origin, normalized allowlisted Django DTO URLs.
- Kept CMS Page Detail footer visibility checks, bounded concurrency, and 60-second fetch cache.
- Added executable regression tests and integration/security report; preserved v0.8.3 CSS and layout.

## 0.8.2 — Homepage visual assets and card interaction

- Added approved hero artwork and contribute background as optimized local WebP images.
- Reintroduced the split homepage hero without inventing any CMS image field.
- Styled featured category tiles mint, without icons; titles remain single-line.
- Matched hero search placeholder and View All Templates CTA to approved mockup.
- Show actual template summaries and reveal Quick Preview below cards on hover/focus without reflow; touch has a visible action.
- Added five UI regression tests and updated previous hero-image expectations.
- Kept all existing backend/SEO/i18n behavior and PostCSS override.

## 0.8.1 — 2026-11-19

- Removed provisional hero document image; CMS-managed hero image postponed until a documented API contract.
- Replaced search magnifier glyph with aligned SVG.
- Changed homepage and catalog document previews to portrait layout.
- Removed hardcoded About from desktop and mobile header while preserving CMS footer and routes.
- Added regression tests for each change.

## 0.6.0 — 2026-11-18

- Added API-driven dynamic catalogue facets (single, multi, boolean) for catalogue/search/category pages.
- Added URL-driven format and `attr.*` query forwarding, mobile dialog, sidebar, facet counts, error states and nine regression tests.
- Preserved v0.5.2 PostCSS override; full package install and audit remain to be verified.

## 0.5.0 — 2026-11-18

- Connected EN/UK community submission pages to actual Backend v0.5 multipart endpoint.
- Added field limits, file UX validation, published category selection and localized field/server errors.
- Added 202 quarantine receipt, 400/413/429/503 and network/unavailable handling with accessible disabled states.
- Preserved v0.4 catalog/gallery/downloads and v0.3.1 Quick Preview origin handling.
- Added submission tests and deployment/CORS documentation; no mock APIs or changes to Django.

# Changelog

## 0.8.6 — Quick Preview drawer and full-page gallery correction (2026-11-20)

- Replaced centered Quick Preview dialog with accessible desktop right-side drawer; mobile cards open Template Detail without Quick Preview network requests.
- Removed fixed-ratio/fixed-height detail gallery clipping; kept real Django previews, thumbnails and the shared fullscreen lightbox.
- Centered the Hero search icon and added a geometric localized, reduced-motion-compatible loader with viewport-aware placement.
- Added regression tests and refreshed .gitignore according to the approved development toolchain. No API or dependency changes.

## 0.3.1 — 2026-11-18

- Adopted client-side Quick Preview image-origin fix as the current baseline.
- Pass the public Django backend origin explicitly from server-rendered `TemplateCard` into client `QuickPreview` and `DocumentCover`.
- Retain backend-origin and path validation; no global optimizer security bypass.
- Updated version and documentation. No backend API, routing, styling, or file API changes.
- Browser E2E validation with running local services remains outstanding.

## 0.3.0 — 2026-11-18

- Added real Django `cover_preview_url` rendering and a shared document cover component for catalogue, Quick Preview and detail.
- Added Next.js image host configuration and local development loopback support.

## 0.2.1 — 2026-11-18

- Refined locale root layouts, language switching, SEO noindex behavior and API error handling.

## 0.4.0 — 2026-11-18

- Preserved the v0.3.1 Quick Preview origin fix and the existing EN/UK design system/routes.
- Integrated Backend v0.4 full Template Detail previews, document file grouping, page navigation, localized usage instructions, formats and controlled download links.
- Added strict download URL validation and real-data empty/error/429 states; retained `noindex` and verified-origin canonical strategy.
- Added six detail integration regression tests and updated the old detail-cover test for the multi-page gallery.
- Next.js/React/ESLint dependencies were unavailable, so full build/lint/typecheck and browser integration remain pending.

## 0.5.1 — 2026-11-18

- Scoped ESLint fixes for generated Next.js definitions and CommonJS tests; named flat-config export, immutable category accumulator, SEO argument annotation and contract-test variable naming.
- No changes to frontend behavior, backend contracts, or visual design.
- Preserved 28 passing tests and successful structure check.
- **Security still pending:** original ZIP has no lockfile, npm audit cannot run (`ENOLOCK`), registry unavailable (`EAI_AGAIN`); reported 15 issues are not individually verified or fixed. Full lint/typecheck/build require a network-enabled dependency install.

## 0.5.2 — 2026-11-18

- Replaced `align-items:end` with `align-items:flex-end` in the flex-based catalogue controls to address the Autoprefixer compatibility warning while preserving visual alignment.
- Added a CSS compatibility regression test; no changes to API, UI components, or design tokens.
- Recorded security review and unresolved dependency findings in `docs/SECURITY_V052.md`; no unverified dependency override or major upgrade.

## 0.6.1 — 2026-11-18

- Fixed lost `searchParams` on EN/UK category-detail routes (Next.js 15 async page props), preserving filters through shared Catalog.
- Preserved `page_size` in catalog state and API requests; fixed route slug still overrides query category; `_rsc` not forwarded.
- Added category-route-to-catalog regression tests (42 total passing). Backend API and UI unchanged.

## 0.7.0 — Provisional CMS Pages / SEO foundation (2026-11-19)

- Added defensive read-only CMS page adapter, dynamic single-segment routes and existing static slug integration.
- Added restricted Markdown, CMS-derived footer navigation, API-derived metadata and conditional reciprocal language alternates.
- Added guarded sitemap source and real-data structured markup without enabling indexing.
- Added 8 checks; all 50 tests pass. **Backend v0.7.1 contract not supplied; integration remains unverified.**

## 0.7.1 — CMS DTO correction

- Read public CMS `locale` and `available_translations` fields; remove assumed navigation fields from Page List.
- Resolve footer visibility from public Page Detail and retain published pages accessible by direct URL even when hidden from navigation.
- Update SEO/renderer/sitemap references to real `locale` field. Add client-level contract regression tests and illustrative fixtures.
- No catalog, design-system, Django endpoint, or indexing changes.

## 0.7.2
- Fix `prefer-const` for CMS footer links.
- Remove global Unix TypeScript paths from all CommonJS tests; add portability regression guards.
- Preserve CMS contract fixture execution, existing features and PostCSS override.

## 0.8.0 — Premium Editorial visual redesign

- Implemented approved home/editorial hero, real-data featured category/template rows, contribution section, global navigation and responsive styling.
- Redesigned real document cards, template detail split layout and backend-driven thumbnail gallery; kept controlled file links and accessibility.
- Added reusable palette/type/spacing tokens and design documentation; no public auth or third-party UI libraries.
- Added visual architecture regression tests. No API or Django change.

## 0.8.3 — Unified hover card
- Make Quick Preview hover extension visually part of the card by removing its detached shadow and animation gap, aligning borders and background.
- Retain keyboard, touch and reduced-motion support; add hover-continuity regression tests.

## 0.8.4 — CMS header navigation correction
- Route published CMS pages into header and footer independently using their Detail visibility flags.
- Render dynamic links in both desktop and mobile header without introducing static About or changing URLs.
- Fetch each unique CMS detail once per SiteShell render; keep bounded concurrency and 60-second caching.
- Add execution-based visibility, sorting, locale, error and header/footer rendering tests.

## 0.8.4 — Windows lint-only test follow-up

- Fixed two `@next/next/no-assign-module-variable` errors and two unused-variable warnings in test harnesses without changing application source or tests’ executable assertions.


## Frontend v0.8.5 — Admin-Only Publishing MVP (2026-11-19)

**Approved current model:** published document files are uploaded only by the administrator in Django Admin. Public visitors browse, preview and download published templates without accounts. Community Submissions is deferred to the roadmap; there is no public upload form.

- Removed submission CTA from Homepage, submission links from mobile header/footer, and public submission form/client modules. `/submit` and `/uk/submit` explicitly call Next.js `notFound()` and return HTTP 404.
- Catch-all CMS slug guards still reserve `submit`; CMS navigation and sitemap explicitly omit legacy CMS `submit` slug to avoid reintroducing broken internal links. EN/UK locale switch no longer treats submit as a supported route.
- Removed obsolete community-banner image and submission-only CSS. No redesign: header, catalog, categories, cards, hero, filters, preview gallery, downloads and CMS presentation remain unchanged.
- Backend must independently reject public submission POST; this frontend-only change is not an API security control. Backend source was not changed.
- Testing: regression tests verify removal, route 404 source, navigation, sitemap, and the existing catalog/CMS behavior. Build/lint results reported only if actually run.

### v0.8.5 clean-extract lint follow-up (2026-11-19)
- Removed unused `t` binding from `HomePage` (`src/components/pages.tsx`); no UI changes.
- Windows logs exposed stale `tests/submission-v05.test.cjs` when an older project folder was overwritten instead of replaced. The source ZIP intentionally excludes this obsolete test and the removed submission form. Extract into a **new empty directory**; do not merge into an earlier frontend folder.
- Local clean archive checks: 91/91 Node tests and structure guard pass. Full typecheck/lint/build should be verified on Windows after fresh `npm ci`.

### v0.8.6 — Editorial dropdown consistency

- Added a shared keyboard-accessible `FormaSelect` for category, sorting, and format controls, retaining original URL parameters and filter semantics.
- Styled EN/UK language and mobile navigation menus as compact editorial dropdown surfaces.
- Preserved checkbox/radio groups for backend-defined multi-/single-select attributes.
- No backend APIs, package dependencies, security settings, or document preview logic changed.
