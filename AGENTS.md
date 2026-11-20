
## Frontend v0.8.5 — Admin-Only Publishing MVP (2026-11-19)

**Approved current model:** published document files are uploaded only by the administrator in Django Admin. Public visitors browse, preview and download published templates without accounts. Community Submissions is deferred to the roadmap; there is no public upload form.

- Removed submission CTA from Homepage, submission links from mobile header/footer, and public submission form/client modules. `/submit` and `/uk/submit` explicitly call Next.js `notFound()` and return HTTP 404.
- Catch-all CMS slug guards still reserve `submit`; CMS navigation and sitemap explicitly omit legacy CMS `submit` slug to avoid reintroducing broken internal links. EN/UK locale switch no longer treats submit as a supported route.
- Removed obsolete community-banner image and submission-only CSS. No redesign: header, catalog, categories, cards, hero, filters, preview gallery, downloads and CMS presentation remain unchanged.
- Backend must independently reject public submission POST; this frontend-only change is not an API security control. Backend source was not changed.
- Testing: regression tests verify removal, route 404 source, navigation, sitemap, and the existing catalog/CMS behavior. Build/lint results reported only if actually run.

# FORMA frontend agent contract

Keep production-oriented Next.js + TypeScript App Router code; frontend and Django backend deploy independently. Use `docs/openapi.backend-v0.2.yaml` and `docs/FRONTEND_INTEGRATION.md` when implementing API consumers; the backend owns the contract and must validate its provisional schema. Never invent endpoints, response fields, templates, previews, file URLs, upload/download services or publisher workflow.

Preserve the existing minimal light design (`src/styles/tokens.css`), route structure and one font stack. Keep components accessible; indicate loading/empty/error states separately. Server-side reads belong in `src/lib/api/client.ts`; only Quick Preview's interaction uses a minimal server route proxy. Keep DTOs typed and respect backend fallback `language` rather than requested locale.

Keep public frontend pages `noindex` until production-approved domain, published metadata, localized content, canonical and sitemap are verified. Search and filter combinations must never generate spam index pages. Avoid indexing empty and API-error pages. `/uk` root `<html lang>` is a known gap; fix before production.

Before returning changes, attempt `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` and `npm run check:structure` and report **real** results, not assumed success. Update `PROJECT_CONTEXT.md` for implementation and remaining blockers.

## v0.4 integration guardrails

- v0.3.1 Preview Fix is the required baseline. Preserve `TemplateCard → QuickPreview → DocumentCover` explicit public `backendOrigin` forwarding; client components must not depend on `process.env.FORMA_API_URL`.
- Use Backend v0.4 `docs/FRONTEND_V04_CHANGES.md` and its actual serializers until generated OpenAPI is verified. Never infer private storage paths, download URLs, or preview pages.
- The detail page renders actual `previews` grouped by `file_id`; `formats[].download_url` may be null and must not produce an active link when null/untrusted. Do not expand the compact Quick Preview with detail-only data.
- Maintain allowlisted image URLs and per-image local loopback bypass without globally weakening the Next.js optimizer. Keep SEO indexing disabled pending production QA.


## v0.5 submission guardrails
- Base is v0.4 + v0.3.1 Quick Preview origin fix; preserve both.
- Use Backend v0.5 `docs/FRONTEND_V05_CHANGES.md` for submission fields/status codes; OpenAPI snapshot is provisional.
- Never claim a submission was published: 202 means quarantined; Windows/local backend intentionally responds 503.
- Keep browser multipart POST directly to the trusted configured Django origin to support 20 MiB on Vercel; configure exact Django CORS origins, not wildcard.
- Do not read server-only `FORMA_API_URL` in client components or bypass backend moderation, scanning, throttling, or feature flags.

## v0.5.1 dependency and lint guardrails

Keep the ESLint CommonJS exception scoped to `tests/**/*.cjs`; do not disable TypeScript or Next.js lint rules globally. Do not lint generated `next-env.d.ts` or `.next` outputs. Preserve the v0.3.1 Quick Preview client-origin forwarding and URL allowlist, v0.4 document gallery, and v0.5 multipart submission behavior. The security audit is **blocked** until a real dependency lockfile can be produced and the 15 reported advisories classified; don't silently assert that upgrading packages resolved them.


## Dynamic catalogue filters — v0.6 rules

- Use Backend v0.6.1 `docs/FRONTEND_V06_CHANGES.md`, not hardcoded attribute definitions. Filter metadata always comes from `GET /api/v1/filters/`; selected values go to `GET /api/v1/templates/` using `attr.<machine-key>` and comma-separated values.
- Preserve URL-state, pagination, category scope, search, format, sort and EN/UK query strings. API 400/404/429 must remain distinguishable. Never render fake template cards or filter counts.
- Keep client Quick Preview free of server-only `FORMA_API_URL` access; pass trusted origin from the server. Preserve protected image/download URL handling.
- Do not enable indexation, invent filter landing pages or add sitemap URLs for facets. Preserve PostCSS override pending audited migration.

## v0.6.1 regression guard

Both category page routes MUST accept Next.js 15 async `searchParams` and forward the awaited `query` into `CategoryDetailPage`, which passes it to the shared Catalog. Never fall back to an empty query on these pages. The route slug overrides URL `category`; preserve format, q, sort, page, page_size, attr.* and drop `_rsc`. Keep `tests/category-searchparams-v061.test.cjs` as a route-to-catalog regression check. No changes to API contract, design or image/Quick Preview security.

## v0.7 CMS guardrails

- Treat `src/lib/api/cms.ts` as a **provisional adapter** until Backend v0.7.1's exact `docs/FRONTEND_V07_CHANGES.md` and runtime OpenAPI are supplied and validated. Never claim verified contract alignment without checking those artifacts.
- Do not fabricate CMS body content, publication status, canonical URL, hreflang translation, sitemap entry, or preview image.
- Keep root EN/UK HTML lang, v0.3.1 client-preview origin props, and v0.6.1 async category searchParams forwarding intact.
- Keep global indexing disabled until an explicitly authorized SEO launch after editorial review. No filter combinations in sitemap.

### CMS integration invariant (v0.7.1)

Use `locale` in CMS Page List/Detail (never `language`). Page List does not include `show_in_footer`/`show_in_navigation`; fetch Page Detail to decide footer navigation using `show_in_footer`. Never infer page visibility from its inclusion in Page List. Do not generate UK hreflang when UK request returns English fallback. Preserve noindex until approved launch. Fixture tests use contract-shaped examples; verify against Django v0.7.1 before deployment.

## v0.7.2 test portability invariant

Tests must resolve `typescript` as the project's declared devDependency (`require('typescript')`), not a global installation, environment-specific absolute path, or fallback. Keep CMS DTO runtime-transpile/VM fixtures and cross-platform portability regression tests. Use `npm ci` on Windows/Linux/CI; do not count test runs with external NODE_PATH as an independently reproducible `npm ci` verification. Preserve CMS locale/detail footer behavior, dynamic filters, category async searchParams, protected preview/downloads, submissions, noindex, and PostCSS override.

## Frontend v0.8.0 UI invariants

Approved visual direction is **Premium Editorial Document Library**, not an alternative SaaS/dashboard design. See `docs/DESIGN_SYSTEM.md` and retain user-approved homepage, catalog, detail compositions. Public customer login/register/account pages and dependencies are explicitly out of scope. Never render mock documents, invented DOCX/XLSX/PDF badges from TemplateList (the DTO does not provide them), lifestyle hero images or made-up statistics. Use the actual backend cover/gallery and trusted download URL helpers. Preserve CMS Page List/Detail `locale` and navigation visibility semantics, async Next.js 15 category `searchParams`, URL-driven filters, noindex and EN/UK.

- v0.8.1: Keep homepage hero image-free until backend supplies a verified CMS hero-image DTO. Do not hardcode About in the public header; footer CMS links depend on detail visibility. Use portrait aspect ratios for real document cover images.


### v0.8.2 invariants
- The homepage hero and community banner use local decorative WebP assets; do NOT reuse these for catalogue cards or pretend they are actual document previews. Hero administration is a planned future backend contract, not implemented CMS API functionality.
- Category names and featured templates must remain API-backed. Category tile is mint, no icons, single-line truncation.
- Card descriptions come from `template.summary`. Quick Preview disclosure is reachable on keyboard focus and on touch; it must not reflow other grid items on hover. Keep the existing backend-controlled dialog, file URLs, and no-public-auth rule.
- Keep Next.js 15/PostCSS override and SEO noindex until separately approved changes.

### v0.8.3 invariant
Keep the Quick Preview extension visually joined to the template card; preserve focus-within, touch fallback and non-reflow behavior. Do not reintroduce a separate shadowed panel or mouse-only action.

## v0.8.4 integration guardrails (2026-11-19)

- Preserve approved v0.8.3 design and all catalog/filter/CMS/locale/SEO behaviors; there is **no public user login**.
- `FORMA_API_URL` is an internal Next server-to-Django origin and MUST NOT be passed to client components or serialized into public HTML. Use `getBrowserApiOrigin()` for browser-facing media, downloads and direct submissions. In production, configure HTTPS `NEXT_PUBLIC_API_URL`. The frontend normalizes only trusted Django preview/download routes from the API DTO; reject foreign origins, unknown routes and credentials, never link directly to R2.
- Detail `Attribute.value` is JSON; `single_select` emits one option code (or null), `multi_select` a list of codes. Use `formatAttributeValue` to display, not `String(value)`. No attributes may be fabricated in Quick Preview without backend contract support.
- CMS Page List still omits visibility flags. Fetch Page Detail for verified `show_in_footer`, respecting the existing 60-second fetch revalidation and bounded concurrency. Do not infer visibility from publication alone.
- Backend v0.8.1 source/Swagger unavailable in this iteration; v0.6.1 serializer is partial evidence only. Recheck actual v0.8.1 contract and production origin config before deploy. Read `docs/FRONTEND_V084_INTEGRATION.md`.

### v0.8.4 CMS navigation invariant

Do not hardcode CMS links into the header. `SiteShell` calls `getCmsNavigation(locale)` once and passes the independently resolved `headerLinks` to both desktop and mobile `Header` navigation; `footerLinks` go to `Footer`. Page List is for published candidates only; visibility flags are validated on Page Detail, not inferred. Preserve locale fidelity, bounded detail calls, the 60-second fetch cache, stable API ordering and direct URL access for pages omitted from both menus. No visual redesign, public login, or Django changes.

### v0.8.5 guardrail — current approved product model

Admin-Only Publishing: only Django Admin uploads templates. Never add submission forms, nav links, homepage CTA, or public upload flows for MVP. Both `/submit` locales explicitly return 404; keep `submit` excluded from CMS catch-all, sitemap, and CMS navigation. Prior v0.5 submission instructions are historical and superseded. Community Submissions are roadmap-only and require a new explicit approval before reactivation.
