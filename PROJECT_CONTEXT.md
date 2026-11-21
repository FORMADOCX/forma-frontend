## v0.8.8 — Catalog filters, sorting and URL contract (2026-11-21)

**Implemented:** One canonical CSV value per Django `attr.<code>` query parameter, including when a historical URL contains duplicate parameters. `parseCatalogQuery`, `catalogHref`, `applyCatalogFilters`, `clearCatalogFilters`, `removeCatalogFilter` and the server API client now share `normalizedAttributes`. Multiple choices within one attribute use CSV OR; separate attributes remain AND in Django. Legacy duplicate parameters are normalized on navigation; format query behavior is unchanged. Filter options are supplied by Django only, and displayed option counts are not treated as contextual results counts. The catalog uses `templates.count` for actual results and distinguishes API 400/503 failures from a valid zero-result response.

**UX:** Category and sorting dropdowns use client-side route navigation on selection; sort has no Apply button and resets page to 1. The desktop sidebar applies facets immediately; mobile retains a bottom sheet with Show results / Clear all and shares URL helpers. Active filter chips remove individual OR values; Clear all preserves q, category and sort. Search remains exclusively on Homepage, global search and Search route, not Templates/Category. No changes to Django, data sources, download security, EN/UK routing, SEO noindex, Admin-Only Publishing, mobile bottom navigation, or backend endpoints.

**Verification:** 154/154 automated source and query-contract tests passed using global TypeScript through `NODE_PATH`; check:structure passed. `npm ci --offline` failed ENOTCACHED (yocto-queue), so full typecheck/lint/build cannot be confirmed in this environment. The staging Django API could not be reached from this environment, so real filtered results and browser UI interactions are not verified. These remain acceptance steps before release.

## Current breadcrumb navigation update (2026-11-20)

**Implemented:** Category Detail always shows `Home / Category` (no category listing or parent step); Search shows `Home / query`, with a localized search title if the query is empty. Shared breadcrumbs keep UI and JSON-LD in sync. Template Detail rules and backend category selection remain unchanged. No extra parent API fetch on Category Detail. Admin-only publishing, staging noindex, EN/UK, and filters preserved.

**Checks:** 129/129 Node tests with environment TypeScript via `NODE_PATH`; structure check passed. npm ci offline failed `ENOTCACHED` on yocto-queue, preventing full typecheck/lint/build. Browser QA not run.

## v0.8.6 — Category hierarchy and contextual breadcrumbs (2026-11-20)

- Added shared `Breadcrumbs` (semantic list, current-page semantics, accessible SVG chevrons) and pure breadcrumb builders. One shared item array drives visible navigation and BreadcrumbList JSON-LD, including Home.
- Template Detail uses `Home / All Templates / Template` when the Detail DTO has no valid category, otherwise `Home / Selected Category / Template` regardless of whether that category is a top-level category or subcategory. Ancestors are deliberately omitted on template pages.
- Current public `TemplateDetail.categories` items contain only `slug` and localized `name`, and no primary marker. Multiple categories are deterministically selected by lexicographically smallest non-empty slug; the result does **not** claim to be the Django `TemplateCategory.is_primary` choice. The same selection drives related-content filtering. To respect an editorially defined primary category in the future, Django should expose `primary_category: {slug, name} | null` (or an equivalent `is_primary` marker) in the Template Detail DTO, using existing model data; frontend must adopt it only after backend contract verification.
- Category Detail uses the real `parent_slug` and resolves the published localized parent with the existing Category Detail API. Parent link is omitted when the lookup fails, returns a mismatching slug or a fallback language; category filters continue to be backend-scoped by `fixedCategory`.
- No backend or API contract changes, no new URLs, no new dependencies, no SEO indexing activation, no change to Admin-Only Publishing. Full QA still requires real Django v0.8.4-fix2 responses and browser checks.

## Latest frontend patch — v0.8.6 Quick Preview clickability (2026-11-20)

**Implemented in source:** The Quick Preview `dialog` is portaled to `document.body` to escape hover-panel `visibility`/`pointer-events` inheritance. The Template Detail Quick Preview trigger is removed; the full gallery, lightbox and controlled downloads remain. All other template cards retain their Quick Preview triggers (desktop/tablet only). Added dedicated regression tests; source changes do not modify API contracts.

**Verification:** 111/111 Node tests passed (using environment-provided TypeScript via `NODE_PATH`), structure check passed, TypeScript parser found 0 syntax errors across 68 TS/TSX files. `npm ci --offline` failed `ENOTCACHED` for yocto-queue; complete typecheck/lint/build and browser interaction remain unverified in this container.

## Frontend v0.8.6 UI polish (2026-11-20)

Implemented a minimal branded SVG/PNG icon set, functional header search icon, hidden empty featured sections, keyboard-only skip link, shared accessible document lightbox (real Django images only), loading indicator, native select styling, numbered URL-preserving pagination, interactive cursors, and image hover zoom. Admin-only publishing, EN/UK, noindex, CMS, backend API, and Next.js App Router maintained. Browser QA and live Django integration must be confirmed independently.

# FORMA Frontend — Development Context

Updated: 2026-11-18. Version: v0.6.0 dynamic catalogue filters. NOT production-ready.

## Accepted decisions

- Frontend is a separate Next.js + TypeScript repository, intended for Vercel; backend Django + DRF, deployed separately.
- Keep v0.1 minimalist design tokens/routes and SSR-first approach.
- Backend v0.2 `openapi.yaml` and `docs/FRONTEND_INTEGRATION.md` are the implementation contract. Checked-in OpenAPI is manually authored/provisional; backend must validate/generate canonical schema.
- EN at `/`, UK at `/uk` is provisional; domain has not been selected.

## v0.2.1 changes (2026-11-18)

- Reorganized Next.js route groups into independent EN/UK **root** layouts to render correct `<html lang>` without changing public paths or prior CSS tokens.
- Added locale-preserving language switch with search/filter query persistence for mirrored public routes; unknown paths fall back to the locale homepage. Backend fallback continues for records without actual localized data.
- Prepared HTTPS origin-validated canonical URLs and reciprocal `hreflang` only on paired static pages; dynamic entities remain without `hreflang` until both genuine translations can be verified.
- SEO launch remains hard-disabled (global `noindex`, robots disallow `/`, empty sitemap), independent of environment flag to prevent premature indexation.
- API fetch transport errors are mapped to 503, malformed JSON to 502; API 404 still flows to `notFound` on detail pages. No endpoint or backend contract changes.
- Reserved `src/lib/api/generated` boundary/documentation for later canonical OpenAPI-driven types. No codegen performed on provisional OpenAPI.
- Verification: 9/9 Node tests pass; structure guard passes; 49 TS/TSX syntax transpilation checks report 0 diagnostics. `npm run lint` fails (eslint not installed); `npm run typecheck` fails with missing Next/React/node types; `npm run build` fails (next not installed). No full build or live API/browser validation performed.

## Implemented in this iteration

- Typed server-side Django API client for categories (list/detail), templates (list/detail) and distinct quick-preview endpoint; 60-second fetch revalidation and HTTP error classification.
- Header receives published top-level categories; categories index, detail, template catalog and search use read-only backend responses.
- Catalog URL-based `q`, `category`, `sort`, `page`; preserves filters in pagination; 120-character text search cap; 1-based page indexing.
- Template detail displays description, license, attributes, category links; Quick Preview client dialog fetches restricted DTO via a new Next.js read-only route.
- EN/UK backend `lang` propagation and explicit fallback message when `language` differs.
- SEO metadata sourced from DTO on detail pages; launch noindex control, empty sitemap and non-indexed placeholders.
- Loading, error, empty and missing-slug states; kept v0.1 tokens and page route paths.
- Contract snapshots and 5 Node tests for query parsing/link preservation/contract paths.

## Verification performed

- `npm test`: 5/5 passing.
- `npm run check:structure`: pass.
- Syntax-only TS/TSX transpilation via globally available TypeScript: 48 files, 0 diagnostics. This is **not** an end-to-end TypeScript typecheck.
- `npm install`: blocked by DNS `EAI_AGAIN` accessing npm registry. Hence `npm run lint`, `npm run typecheck` and `npm run build` are unverified (dependencies unavailable).
- No live Django instance available; API integration is contract-based and not HTTP-verified.

## Gaps and follow-up

1. Run dependency installation, lint, tsc, build, Node tests and browser E2E in a network-enabled CI environment; fix discovered issues.
2. Validate backend's generated OpenAPI and run real API integration tests (404, 400, fallback language, pagination, unpublished data, CORS/network/cache).
3. Wire backend file/previews/download APIs only after they are implemented. No fake assets or download operations.
4. Browser-check locale-specific root HTML, preserved detail URLs and fallback translations with a running Next.js server.
5. Add full category hierarchy and pagination to the catalog filter beyond initial 100 categories.
6. Implement published sitemap and controlled indexing with canonical/reciprocal `hreflang` QA, real domain and editorial validation.
7. Add proper content-managed static pages, legal copy, accessibility review, error monitoring and E2E tests.

## v0.3.0 — real cover previews (2026-11-18)

- Diagnosed exact frontend regression: existing `TemplateCard` rendered a permanent unavailable message, API DTO types did not expose `cover_preview_url`, dialog/detail did not render an image, and `next.config.ts` did not allow Django image hosts.
- Added optional `cover_preview_url` to `TemplateList` inherited by quick-preview and detail DTOs. This is based on the user's newer backend behavior, NOT verified against the older provisional backend v0.2 OpenAPI snapshot.
- Shared `DocumentCover` uses Next Image for all three views with backend-origin/path validation; no fictitious images or downloads. Existing design tokens/routes preserved.
- Image remotePatterns configured for the configured production host, and both `localhost:8000` and `127.0.0.1:8000` in development. Local loopback images bypass optimization **per image** because of Next image SSRF protections; production remains optimized. No global image protection disabled.
- Node regression tests cover the user's example PNG URL, localhost aliases, production optimized rendering, untrusted URL rejection and three components. Existing tests preserved. Real browser requests to Django cannot be tested without running backend/Next environments.
- Explicit follow-up: validate current generated OpenAPI cover fields on list, quick-preview and detail; run dependency install, ESLint, full typecheck, Next build and browser tests in a network-enabled environment. Indexing remains disabled.

## v0.3.1 — accepted baseline / Preview Fix (2026-11-18)

- **Next releases must be based on v0.3.1, not v0.3.0.** User supplied `forma-frontend-v0.3.1-preview-fix.zip`; reviewed its client/server origin forwarding.
- Root cause of the v0.3.0 Quick Preview regression: the server-only `FORMA_API_URL` is unavailable in the browser, unlike in server-rendered catalogue cards. The explicitly passed `backendOrigin` prop resolves the mismatch without exposing credentials or trusting arbitrary image URLs.
- Preserve `TemplateCard` → `QuickPreview` → `DocumentCover` origin forwarding and `getPreviewSource` allowlist, local development aliases, and per-image bypass of optimization on loopback. Never rely on a server-only environment variable directly inside a browser client component.
- No Django endpoint/contract changes, mock images, downloads, redesign or SEO activation.
- Browser proof of real Quick Preview rendering with running Django and Next.js is **pending**. Record only actual executable checks in delivery notes.

## v0.4 — Template Detail integration (2026-11-18)

**Current implementation baseline: Frontend v0.4, derived from the verified v0.3.1 Preview Fix archive.** Backend v0.4 supplied `docs/FRONTEND_V04_CHANGES.md` and provisional `openapi.yaml` plus actual DRF serializers. New manually typed detail fields: `formats` with nullable download URLs, all real `previews` with file IDs and page dimensions, and `usage_instructions`. Backend remains unchanged.

- New `src/components/document-gallery.tsx` and `src/lib/document-gallery.ts` render real multi-page documents grouped by file ID, preserve backend file order and sort page numbers, and provide keyboard/pointer navigation. Styling extends the existing light design tokens.
- `src/lib/download-url.ts` validates exact backend origin and requested download route before exposing a link; `download_url=null` yields an inert unavailable message. Downloads remain Django-controlled streams with backend revalidation (404 and 429 possible). Cached detail metadata may lag up to 60 seconds.
- `src/components/catalog-data-pages.tsx` now displays gallery, localized full description, usage instructions, ready formats/file names/sizes, attributes, categories, and breadcrumbs; distinguishes 404/429/other detail failures.
- Dynamic metadata continues to use CMS SEO text and the configured site canonical. Global `noindex`, unverified entity hreflang omission, and the v0.3.1 Quick Preview public-origin prop forwarding are preserved.
- Tests: 22/22 Node tests passed; structure check passed; syntax transpilation 54 TS/TSX files without diagnostics. Full lint/typecheck/build unavailable because node_modules (ESLint, Next/React types and Next runtime) are missing. No browser, real Django, keyboard usability, or live download verification was performed.
- Follow-up: install dependencies and execute lint/typecheck/build and browser E2E; validate backend OpenAPI against live runtime and actual v0.4 responses; recheck URL handling behind reverse proxy, on production domain and Cloudflare R2; consider immediate no-cache detail metadata if publication/download availability requires stricter UI freshness. Do not enable indexing until SEO requirements are verified.


## Frontend v0.5 — Community Submissions (2026-11-18)

**Implemented in source:** extends frontend v0.4 preserving v0.3.1 client Quick Preview fix, gallery, controlled downloads, EN/UK routes and minimal design tokens. `/submit` and `/uk/submit` now load real published categories and use client-side validation plus real browser multipart POST to Backend v0.5 `/api/v1/submissions/`. Optional category selection and free-text suggestion supported. Handles 202 private quarantine receipts, backend 400, 413, 429 and 503/CORS/offline separately, with disabled unavailable UX. Does not implement status tracking, mock responses, or automatic publication.

**Decisions:** direct browser POST (not a Next/Vercel serverless proxy) to avoid serverless request body limits smaller than 20 MiB. Django exact-origin CORS must be configured for actual frontend hostname; backend origin provided by server component to browser (no access to `FORMA_API_URL` in client). In production only HTTPS backend permitted. Django remains authoritative on content checks, file limit, throttle, scanner/quarantine, authorization. Default local backend disables submissions with 503.

**Pending:** runtime-verified OpenAPI for v0.5, genuine Django/browser integration and manual accessibility/mobile QA, production CORS/origin validation, full npm lint/typecheck/build on installed dependencies. No production-ready claim. Indexing remains disabled.

**v0.5 checks:** 28/28 Node tests pass; structure passes; 56 TS/TSX transpile without syntax errors; isolated strict typecheck of submission helper passes. Full lint/typecheck/build blocked by missing dependencies; no live browser verification.

## Frontend v0.5.1 — ESLint patch and audit blocker (2026-11-18)

**Current source baseline v0.5.1**, based strictly on v0.5. Minimal fixes: named ESLint flat config, global ignore for generated `next-env.d.ts` and `.next` output, CommonJS `require` exception scoped to tests only, `const` category accumulator, explicit use of the kept SEO `_noindex` argument, and contract-test variable rename. No changes to API calls, Quick Preview origin forwarding, design, routing, gallery, downloads, or submission behavior. `indexingEnabled=false` persists.

Checks here: `npm test` 28/28 passed, `npm run check:structure` passed. `npm run lint` unavailable (`eslint: not found`); `npm run build` unavailable (`next: not found`); `npm run typecheck` unable to resolve Next/React/Node packages. `npm audit --json` fails with `ENOLOCK`: v0.5 archive lacks a lockfile. `npm install --package-lock-only` fails with `EAI_AGAIN` resolving npm registry. Reported 15 security advisories remain **unverified and unresolved**; production/dev classification cannot be asserted without a resolved lockfile. Do not claim production readiness. Next action on network-enabled Windows: install, commit the actual lockfile, capture complete audit report, apply measured fixes without forced major versions, and re-run full checks.

## Frontend v0.5.2 status — 2026-11-18

- **Base:** v0.5.1. Only CSS flex alignment (`align-items: end` -> `flex-end`), release number, CSS regression test and documentation were changed. Preserve Quick Preview v0.3.1 fix, template gallery/downloads and community submissions without alterations.
- **Local Windows evidence provided by user:** typecheck/lint/28 tests pass; build passes with Autoprefixer warning; Next.js installed is 15.5.29; full audit 15 vulnerabilities (1 moderate, 14 high), `--omit=dev` audit 2 (1 moderate, 1 high). These reflect the user's v0.5.1 environment, not re-verified v0.5.2 results.
- **Open security blocker:** original source ZIP lacks `package-lock.json`. Registry `EAI_AGAIN` prevents installing/resolving dependencies and auditing. No advisory-by-path classification, no verified patched dependency set and no claim of remediated vulnerabilities. See `docs/SECURITY_V052.md`.
- **Dependency policy:** no forced audit fix, no broad npm overrides, no unreviewed Next.js 16 upgrade. Establish exact dependency tree and distinguish ordinary PostCSS from vendored Next.js PostCSS before patching. Re-run build/lint/typecheck/audits and browser E2E with lockfile available.

## v0.6 — dynamic catalogue filters (2026-11-18)

- Baseline is Frontend v0.5.2, retaining v0.3.1 client Quick Preview backendOrigin prop, gallery, downloads, submissions, EN/UK, preview URL validation, muted design tokens and current routes.
- Backend v0.6.1 `docs/FRONTEND_V06_CHANGES.md` and serializers/views are the implementation source of truth. Added typed `FiltersResponse` + `CatalogFilter` + `FilterOption`; server fetch of `/filters/` and attribute/format serialization to `/templates/`. No fixed attribute keys.
- Shared Catalog powers All Templates, Search and category details; category-scoped catalog is embedded beneath existing category description and breadcrumbs. Desktop sidebar and accessible mobile dialog support single, multiple and boolean options. Count per option is supplied by backend.
- Filter URL is source of truth. Apply resets page to 1; sort/search preserve hidden filters; previous/next preserve query, category, format and attr keys; Clear removes format/attributes but preserves query, category, sort. Locale switch keeps query string. Unknown/duplicate attr values pass through to backend for rejection.
- Global noindex remains; metadata canonical never indexes query combinations.
- New tests raise suite from 29 to 39 passing. Local registry unavailable; lint/typecheck/build/audit not verified in current runtime. An adapted lockfile must be regenerated with verified checksums when npm registry access resumes; do not claim audit 0 on this new tree. Previous Windows result: Next 15.5.29 + postcss 8.5.23 override, `npm audit --omit=dev` 0 and 13 high dev-only findings.
- Open issues: actual Django v0.6.1 browser E2E, full Next build, audit, mobile focus/keyboard checks in browser, confirming category-tree filtering with real published data.

## v0.6.1 — category searchParams forwarding fix (2026-11-18)

- **Root cause:** Both EN and UK `categories/[slug]/page.tsx` accepted only `params`, so Next.js App Router `searchParams` was never passed into `CategoryDetailPage`. Its default `query={}` caused `Catalog` to lose incoming `format`, `attr.*`, `q`, `sort`, `page` and other query values; an XLSX filter could incorrectly display an unfiltered DOCX template.
- **Fix:** The two route pages now accept `searchParams: Promise<RawQuery>` as required by Next.js 15 and await it alongside route `params`, forwarding `query={query}` to `CategoryDetailPage`. That component already forwards the query to the shared Catalog. `Catalog` still enforces `fixedCategory=slug` after parsing, so user-supplied `category` cannot override the route context. `_rsc` is omitted by the existing query parser / API client allowlist.
- **Related narrow correction:** `page_size` now survives URL parsing, catalog pagination and search form round-trips and is passed into `getTemplates` (valid range 1–100, default 20 per v0.6.1 backend). Invalid sizes fall back to 20 in the frontend; backend remains authoritative.
- **Tests:** Added `tests/category-searchparams-v061.test.cjs` checking actual EN and UK route TSX AST/source forwarding through `CategoryDetailPage` into Catalog, `fixedCategory` priority, combined URL params, `_rsc` removal, localization symmetry and no-results UI. `npm test` 42/42; `npm run check:structure` passed.
- **Verification limits:** Full `npm run typecheck` fails due to missing Next/React/Node dependency types; `npm run lint` and `npm run build` cannot run because dependencies are not installed. Offline `npm audit --omit=dev --offline` returned zero, but this is not a fresh registry-backed advisory check. Local Windows v0.5.2 evidence previously established Next.js 15.5.29 with PostCSS override 8.5.23, production audit 0 and remaining 13 high dev tooling findings. Both override and lockfile are retained. No browser/Django integration test performed. No API/design/Quick Preview changes.

## Frontend v0.7 (provisional CMS/SEO integration, 2026-11-19)

- Base: v0.6.1, including async category `searchParams` forwarding, dynamic API filters, local Django preview origin fix, document galleries, controlled file download, and submission form. These modules were not rewritten.
- Added `src/lib/api/cms.ts` as a **defensive provisional adapter** for `GET /api/v1/pages/` and `GET /api/v1/pages/{slug}/`; status/publication field names and exact v0.7.1 DTO were **not** verified because the Backend v0.7.1 archive and `docs/FRONTEND_V07_CHANGES.md` were unavailable. v0.6.1 was the newest accessible backend archive. The CMS integration is **not certified**.
- Replaced content placeholders for About/Privacy/Terms with read-only CMS detail rendering. Added `/[slug]` EN and `/uk/[slug]` UK catch-all with reserved-slug guard. Safe restricted Markdown, exact CMS-only navigation, empty/error/404 behavior.
- Metadata uses API source values; reciprocal hreflang only for real paired translations. OG image origin restricted to configured HTTPS public site origin. JSON-LD breadcrumbs and WebSite added from real data. Indexing remains hard-disabled, robots disallows entire site, sitemap returns `[]` until explicit future release gate. No filtered/search entries.
- New tests: `tests/cms-seo-v07.test.cjs` (8 source/contract guard checks). 50/50 total passed. Structural check passed; TS/TSX syntax 63/63. Full lint/typecheck/build blocked by absent dependency installation (`npm ci --offline` ENOTCACHED). No browser test completed.
- Dependency security: retained Next 15 and PostCSS 8.5.23 override. Earlier Windows verification showed `npm audit --omit=dev` 0 at v0.5.2; **not re-verified** for this archive. 13 dev-tooling high findings may remain.
- **Open blockers before v0.7 production deployment:** obtain v0.7.1 archive and verified Swagger/FRONTEND_V07_CHANGES.md; confirm field names for localized CMS body, visibility, SEO, OG image, published-only results, page sizes, pagination, and fallback language; run full build/lint/typecheck, real browser CMS and SEO smoke tests; plan sitemap partitioning and explicit indexing launch gate. Do not enable indexing prematurely.

## Frontend v0.7.1 — CMS DTO contract correction (2026-11-19)

- Base: Frontend v0.7; preserve v0.6.1 category `searchParams` fix, v0.3.1 Quick Preview, dynamic catalog, gallery, downloads, submissions, and styles.
- **Fixed:** public CMS DTO uses `locale`, not `language`; Page List has `slug`, `locale`, `title`, `summary`, `available_translations`. Page Detail carries `show_in_navigation` and `show_in_footer`, and is fetched to decide footer links. Publicly accessible hidden-in-navigation pages remain routable.
- **Architecture:** do not assume Page List visibility flags. Footer uses detail `show_in_footer`, not navigation visibility. English fallback does not establish Ukrainian hreflang. No indexing activation.
- **Verification:** 57 source/contract-shaped fixture tests pass, structure check passes. Full lint/typecheck/build and fresh npm audit require dependency installation; live Django v0.7.1/Swagger unavailable in this environment.
- **Open follow-up:** compare fixtures against *exported* Backend v0.7.1 responses and Swagger. Request optional `show_in_footer` (and separately `show_in_navigation` when needed for header) in Page List DTO to eliminate per-page detail requests. This is a backend proposal, not an API change implemented by frontend.

## Frontend v0.7.2 — Windows portability and lint (2026-11-19)

- Baseline v0.7.1. Fixed `prefer-const` for mutable-array reference `cmsLinks` in `src/components/site-shell.tsx` (array contents still accumulated, no behavioral change).
- All CommonJS test files now load `typescript` via `require('typescript')`, resolved from project `devDependencies`; removed global Unix TypeScript absolute-path fallbacks. `npm ci` is mandatory before testing on Windows/Linux/CI. CMS DTO fixture tests retain real transpile + VM execution and mock HTTP response checking; not reduced to source-text matching.
- Added `tests/test-portability-v072.test.cjs` to reject hardcoded global paths and ensure CMS test invokes actual module code.
- Local packaging environment: `npm ci --offline` fails `ENOTCACHED` for `yocto-queue`; registry-enabled `npm ci` timed out. `npm test` with environment-only `NODE_PATH=$(npm root -g)` passed **59/59** using installed global TypeScript for verification, despite no project node_modules. This is NOT proof of a clean `npm ci` or default test run. `npm run check:structure` passed. Full typecheck/lint/build and fresh npm audit remain unverified here. PostCSS 8.5.23 Next override kept; indexing remains disabled. Obtain a clean `npm ci` and full CI/Windows checks before release.

## Frontend v0.8.0 — approved visual redesign (2026-11-19)

- Base: v0.7.2 (CMS DTO `locale`, Windows-portable TypeScript tests, category `searchParams` regression retained).
- Approved direction: Premium Editorial Document Library based on three supplied references (homepage, All Templates, The Clean Invoice detail).
- Implemented: shared restrained neutral/green tokens, serif editorial headings, universal no-auth header with search / EN-UK and mobile menu, split homepage hero populated by a published Django preview, dynamic featured categories/templates, editorial contribution CTA, responsive catalog cards and filters, two-column template detail, page thumbnail gallery, compact Quick Preview download links.
- All public page content remains API-backed; no seed/mock template content, invented categories, author, format, pages, or download counts. Homepage shows a clean unavailable state if no genuine cover is available.
- No user-facing account or authentication; Django Admin auth remains independent.
- `indexingEnabled=false` preserved; existing SEO, CMS Markdown sanitization, sitemap and translation rules unchanged. Next.js 15, PostCSS override 8.5.23 preserved.
- Known frontend API limitation: TemplateList DTO does not expose file format; cards display only DTO-supported information.
- Further QA: verify full production build and static routes with live Django, keyboard focus and visual behavior at 390/768/1024/1440/1920, actual preview/download and submissions states. Dev-tooling npm audit advisories from previous versions have not been certified resolved.
- Design-system source: `docs/DESIGN_SYSTEM.md`.
- Detail related section now uses only published real templates returned by category-filtered `GET /api/v1/templates/`; omission on failure is intentional.

## Frontend v0.8.1 — homepage and header corrections (2026-11-19)

- Removed provisional homepage hero document image and visual placeholder entirely. Hero remains editorial text/search/category navigation until an explicit CMS-managed hero API contract exists. No speculative backend field added.
- Replaced the glyph used for magnifier with a stable inline SVG; positioned the icon inside the hero search input with appropriate padding and no obstruction of input actions.
- Changed template cover aspect ratios to portrait (4:5 catalog; 3:4 featured homepage); real backend previews remain mandatory.
- Removed hardcoded About link from desktop/mobile header. Published CMS footer links remain controlled via Page Detail `show_in_footer`; About routes are still routable if published.
- All other API, SEO, locale, submissions, Quick Preview, gallery and download functionality preserved. Browser visual QA and full dependency-backed build remain pending until performed.

## Frontend v0.8.2 — approved homepage artwork and card interactions (2026-11-19)

- Added the two user-approved generated editorial assets: `public/images/forma-hero.webp` (decorative sample-document composition) and `public/images/forma-contribute.webp` (background image). Both are optimized WebP, shipped locally; **neither is a real template preview nor a CMS attachment**. Hero image integration with Django Admin remains future work pending a defined API contract.
- The homepage split hero uses only its new decorative artwork; Featured Templates and the catalogue continue to display only actual `cover_preview_url` from Django. Hero's search placeholder matches the design reference, and featured CTA reads “View All Templates”.
- Featured category cards use light mint, no icon, and single-line title with ellipsis for overflow. Category titles and links remain Django API data.
- Template summaries are shown on cards when present. Quick Preview button is hidden visually by default on hover-capable devices, and revealed in an absolutely positioned panel below the card on hover or focus-within, preventing layout shifts. On touch/no-hover devices the action remains visible in normal flow with a 44px touch target. Existing native dialog and backend Quick Preview data handling are unchanged.
- SEO and EN/UK, API requests, category searchParams, CMS pages, document previews/downloads and submissions are unchanged. No public login.
- Verification in this environment: `npm test` 75/75 passed, `npm run check:structure` passed, image assets verified; `npm run typecheck` cannot resolve installed Next/React/Node types; `npm run lint` cannot find ESLint; `npm run build` cannot find Next.js; `npm audit --omit=dev --offline` reported 0. Browser interaction/visual QA not executed.
- Next work: `npm ci` and full checks on Windows with network, browser visual/focus/touch QA, and future CMS hero image API integration. The previous 13 high dev-tooling audit findings are not claimed fixed.

## Frontend v0.8.3 — unified Quick Preview card hover (2026-11-19)

- Fixed the visual seam between the card and the hover-triggered Quick Preview action: one connected surface with aligned side borders, matching background, no separately floating shadow, and no motion gap.
- Kept the action absolutely positioned outside grid flow on hover-capable devices, preserving adjacent layout, and visible within the card on touch devices. Keyboard focus-within and reduced-motion handling retained.
- Added regression tests for continuous-card styling, flow independence, keyboard/touch behavior.
- No changes to Django APIs, template images, preview modal, metadata, SEO, or routes. Browser visual QA remains necessary.

## Frontend v0.8.4 — backend integration and origin safety (2026-11-19)

- Baseline v0.8.3 visuals/CSS/artwork retained unchanged. No backend code changed and no public authentication added.
- Root cause 1: `Attribute` TS type did not include backend option types and JSON arrays; detail stringified unexpected objects. Added `single_select`/`multi_select` JSON DTO and safe formatting with null/empty suppression; backend v0.6.1 serializer confirms code arrays, but v0.8.1 source/runtime NOT available.
- Root cause 2: private `FORMA_API_URL` used for browser media/downloads and submissions. Introduced explicit `NEXT_PUBLIC_API_URL` browser origin, strict Django route/origin validation and backend DTO URL normalization on server. Private origins never appear in production browser resources. Missing public origin disables those resources, not security. The backend still controls downloads; no storage/R2 links.
- CMS footer: Page List lacks visibility flags, so Detail calls required. Existing 60s fetch revalidation preserved, calls now concurrency-limited to 6. N+1 persists initially; backend suggestion: add navigation/footer flags to Page List.
- SEO noindex, EN/UK, categories `searchParams`, filters, Quick Preview, document gallery, submissions and CMS unchanged.
- See `docs/FRONTEND_V084_INTEGRATION.md` for verification and limitations. Production smoke tests and Django v0.8.1 contract verification still required. Prior 13 high dev-tooling advisories are not claimed fixed.

## Frontend v0.8.4 — CMS header navigation integration correction (2026-11-19)

- Confirmed root cause: `SiteShell` previously collected only `show_in_footer` links and rendered no CMS links in `Header`. Both desktop and mobile header navigation contained static links only.
- Added a server-only `getCmsNavigation(locale)` helper that fetches the published Page List candidates and each matching Page Detail **once**, building separate `headerLinks` (`show_in_navigation`) and `footerLinks` (`show_in_footer`). The flags are independent: header only, footer only, both, or neither; neither does not affect direct published-page URLs.
- Page List has no visibility flags. The Detail API is still necessary; detail calls run in bounded batches of six, and existing `getCmsPages`/`getCmsPage` fetch revalidation remains 60 seconds. No new API endpoints or backend changes. A future backend extension could add visibility flags, titles and sort order to Page List to avoid N+1.
- CMS locale and page titles must match requested EN/UK. English fallback details are excluded from Ukrainian navigation. Links use existing localized paths and the original header styling. Header navigation scrolls within its area if CMS links are numerous; mobile panel has bounded scroll height.
- Ordering uses optional valid integer `sort_order` if present in a Page Detail response, otherwise preserves backend Page List sequence. Exact inclusion of `sort_order` in Backend v0.8.1 response is not independently verified here.
- Regression tests execute `getCmsNavigation` against fake transport responses, including all visibility combinations, missing pages, locale, order, deduplication, pagination and call counts; desktop/mobile/Footer output is also executed with a lightweight JSX stub.
- Verification in packaging environment: 92/92 tests pass using an externally available TypeScript via `NODE_PATH`; structure check passes. `npm ci` could not complete with available network/cache. Full Next/React typecheck, ESLint and Next build unconfirmed here. No running Django or browser E2E executed. This is a correction within v0.8.4, not a new visual design.

## Frontend v0.8.4 — Windows lint-only test correction (2026-11-19)

- Local Windows Node 22.17.1 results reported by the user: `npm ci` OK (358 packages; 0 audit vulnerabilities), `npm run typecheck` OK, `npm test` 92/92; `npm run lint` reported two errors and two warnings limited to `tests/cms-header-v084.test.cjs` and `tests/integration-v084.test.cjs`.
- Replaced test-local `module` bindings with `compiledModule` (the dynamic CommonJS evaluation string remains `module` as required by runtime); removed unused `jsx` and replaced unused `sort_order` destructuring with property deletion on cloned fixture objects. Test behavior and production code are unchanged.
- Packaging environment after fix: 92/92 tests pass with external TypeScript through `NODE_PATH`, structure checks and both `node --check` checks pass. `npm ci --offline` remains blocked by `ENOTCACHED` (yocto-queue); lint/typecheck/build after the fix still require confirmation on an installed Windows checkout.


## Frontend v0.8.5 — Admin-Only Publishing MVP (2026-11-19)

**Approved current model:** published document files are uploaded only by the administrator in Django Admin. Public visitors browse, preview and download published templates without accounts. Community Submissions is deferred to the roadmap; there is no public upload form.

- Removed submission CTA from Homepage, submission links from mobile header/footer, and public submission form/client modules. `/submit` and `/uk/submit` explicitly call Next.js `notFound()` and return HTTP 404.
- Catch-all CMS slug guards still reserve `submit`; CMS navigation and sitemap explicitly omit legacy CMS `submit` slug to avoid reintroducing broken internal links. EN/UK locale switch no longer treats submit as a supported route.
- Removed obsolete community-banner image and submission-only CSS. No redesign: header, catalog, categories, cards, hero, filters, preview gallery, downloads and CMS presentation remain unchanged.
- Backend must independently reject public submission POST; this frontend-only change is not an API security control. Backend source was not changed.
- Testing: regression tests verify removal, route 404 source, navigation, sitemap, and the existing catalog/CMS behavior. Build/lint results reported only if actually run.

### v0.8.5 validation evidence

- `npm test`: 91/91 passed, running local test sources with environment TypeScript via `NODE_PATH` because `npm ci` cannot populate node_modules here. Some legacy submission tests were intentionally replaced by five Admin-Only regression checks.
- `npm run check:structure`: passed.
- `npm ci --offline --ignore-scripts --no-audit --no-fund`: failed `ENOTCACHED` (`yocto-queue@0.1.0`).
- `npm run typecheck`: fails because Next/Node/React modules and types are not installed. `npm run lint`: `eslint` not found. `npm run build`: `next` not found.
- `npm audit --omit=dev --offline`: 0 reported vulnerabilities on cached advisory data; **not a fresh online audit**.
- No live Django or browser E2E was executed. Django public POST `/api/v1/submissions/` must be independently disabled by backend deployment; client removal alone does not enforce that.

### v0.8.5 extraction and lint follow-up (2026-11-19)
- User Windows npm ci / TypeScript check / Next production compile succeeded; build also completed despite repeated ECONNREFUSED messages from offline local Django during prerendering.
- Two failing npm tests (95/97) resulted from **obsolete files remaining after overlay extraction**: `tests/submission-v05.test.cjs` was not included in v0.8.5 release. Fresh extraction has 91/91 passing tests.
- Removed unused HomePage `t` binding to address ESLint's single warning. No design or API changes.
- Required migration: unpack to an empty directory and transfer only environment configuration; never overlay an old source tree.

## Public GitHub documentation baseline (2026-11-20)

- Frontend v0.8.5 documentation is being prepared for `FORMADOCX/forma-frontend` with current Admin-Only Publishing described in English README, and historical release notes in CHANGELOG.
- Added `docs/ARCHITECTURE.md` and `docs/DEPLOYMENT.md` grounded in existing Next.js 15 / Django REST API code; current `noindex` is hard-disabled pending a separate verified SEO rollout.
- `.env.example` lists only safe local origin examples and the reserved indexing flag; `.gitignore` covers `.env.local`, `.vercel`, `.idea`, Next outputs and dependencies.
- Documentation changes do not constitute proof of a live Vercel deployment, target Django API integration, or browser E2E. Preserve current UI, API, SEO, no-account and Admin-Only behavior.

## Frontend v0.8.6 — Preview UX correction (2026-11-20)

- Current implementation: native right-side Quick Preview desktop dialog, loading/error states, trusted PNG and download URLs, no background interaction, explicit body scroll lock, focus restoration and AbortController cleanup. Mobile (<768px) hides Quick Preview and prevents the network request; existing card links navigate to Detail.
- Detail gallery presents complete PNG page without landscape frame aspect ratio, fixed max-height or `object-fit:cover`; fullscreen viewer and real multi-page thumbnails remain. Hero search SVG submit control is centered in its input. Geometric document-outline loading indicator uses viewport-aware centering and reduced-motion support.
- Approved .gitignore now covers Next.js, Vercel, JetBrains, VS Code, environment files, tests and transient artifacts. No dependencies, Django API, staging noindex or user-publishing rules changed.
- Local packaging tests: 108/108 test cases passed; structure checks passed; 68 TS/TSX parser checks passed. Offline prod audit shows 0 reported vulnerabilities based on cached advisories. `npm ci --offline` failed ENOTCACHED (`yocto-queue`); normal `npm ci` failed with npm exit-handler error. Consequently full typecheck/lint/build have not passed here due to missing Next/React/ESLint packages. Browser viewport QA and staging E2E not performed.

### v0.8.6 — Dropdown UI refinement

- Implemented `src/components/forma-select.tsx` as the shared custom accessible dropdown for catalog category/sort and filter format.
- Current query serialization is unchanged (named hidden inputs for GET controls, existing `applyCatalogFilters` for the sidebar). EN/UK switch and mobile navigation have consistent menu presentation; attribute checkboxes and radios remain as-is.
- Added regression coverage `tests/editorial-dropdown-v086.test.cjs`. Full browser/keyboard smoke testing and production build are required before deployment approval.


## Mobile app-like UX (2026-11-21)
- Based on the latest available category/search breadcrumbs build (package version 0.8.6).
- Added mobile-only Home/Templates/Search bottom navigation with current-route selection, EN/UK and safe-area padding.
- Existing native dialog-based catalog filters styled as a mobile bottom sheet without duplicating Django filter state/query logic.
- Mobile document cards use two columns above 359px; Template Detail orders title/summary before full real preview using CSS.
- Desktop rules, admin-only publishing, Django download/preview endpoints, and staging noindex remain unchanged.
- Verify on real devices: keyboard viewport resizing, scroll locking and access to bottom-sheet controls; automated browser QA is not claimed without execution.

- Mobile UX release version: v0.8.7 (based on v0.8.6 plus category/search breadcrumbs fixes).

## Mobile header and bottom navigation refinement (2026-11-21)
- Mobile hamburger `<details>` was removed from public Header at the user's request; primary mobile navigation is the three-item Home / Templates / Search bottom bar.
- Category and CMS navigation remains available through the existing localized footer; desktop header CMS links unchanged. This is a deliberate mobile discoverability tradeoff.
- Selected bottom navigation item now has solid forest-green `var(--accent)` background with white text/icons, replacing the underline. `aria-current=page` and focus affordances remain.
- No backend, SEO, routing or publishing changes. Browser QA remains outstanding until verified on devices.

## Catalog search UI simplification (2026-11-21)
- Removed visible `q` search input from `/templates` and `/categories/[slug]` catalog controls. `/search`, site header search and homepage hero search remain functional.
- A pre-existing `q` query parameter is carried as a hidden GET input on non-search catalog pages to preserve URL-filter/pagination semantics without showing a duplicate search field.
- Added a desktop three-column layout for catalog controls without search; mobile and tablet use existing responsive layout. No API/SEO changes.


### v0.8.8 test-only ESLint hotfix (2026-11-21)
- Renamed the local CommonJS VM `module` variable to `compiledModule` in `tests/mobile-experience-v086.test.cjs` to avoid `@next/next/no-assign-module-variable`.
- No application source, API contract, UI, or dependencies changed.
- 154/154 tests and structure checks passed in packaging environment with global TypeScript resolution; full ESLint/typecheck/build not verified because `npm ci --offline` lacks cached `yocto-queue`.
