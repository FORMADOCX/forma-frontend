
## Frontend v0.8.5 — Admin-Only Publishing MVP (2026-11-19)

**Approved current model:** published document files are uploaded only by the administrator in Django Admin. Public visitors browse, preview and download published templates without accounts. Community Submissions is deferred to the roadmap; there is no public upload form.

- Removed submission CTA from Homepage, submission links from mobile header/footer, and public submission form/client modules. `/submit` and `/uk/submit` explicitly call Next.js `notFound()` and return HTTP 404.
- Catch-all CMS slug guards still reserve `submit`; CMS navigation and sitemap explicitly omit legacy CMS `submit` slug to avoid reintroducing broken internal links. EN/UK locale switch no longer treats submit as a supported route.
- Removed obsolete community-banner image and submission-only CSS. No redesign: header, catalog, categories, cards, hero, filters, preview gallery, downloads and CMS presentation remain unchanged.
- Backend must independently reject public submission POST; this frontend-only change is not an API security control. Backend source was not changed.
- Testing: regression tests verify removal, route 404 source, navigation, sitemap, and the existing catalog/CMS behavior. Build/lint results reported only if actually run.

# FORMA Frontend v0.8.4

Compatibility and security corrections on approved v0.8.3 visuals. See [`docs/FRONTEND_V084_INTEGRATION.md`](docs/FRONTEND_V084_INTEGRATION.md) for verified sources, deployment setup, limitations, and tests.

**Backend environment:** `FORMA_API_URL` is the internal, server-only Django origin. `NEXT_PUBLIC_API_URL` is the browser-accessible Django origin: mandatory public HTTPS in production for real document images, downloadable files and submissions, but may point to localhost in development. Set both in `.env.local` / deployment configuration. No user login. Search, CMS, SEO and the v0.8.3 design are unchanged. `FORMA_ENABLE_INDEXING=false` remains required.

# FORMA Frontend v0.5.0

Next.js 15 App Router / TypeScript frontend, deployed independently from the Django REST backend. This is an API-integrated **source implementation**, not a verified production build. It extends the v0.1 foundation without replacing its color tokens, font system or existing public route paths.

## Setup

Requires Node 20.9+ and access to npm registry.

```bash
npm install
cp .env.example .env.local
# Set FORMA_API_URL to the backend origin, e.g. https://api.yourdomain.tld (no /api/v1 suffix)
npm run dev
```

On Vercel configure `FORMA_API_URL` as a server-side environment variable. No client API token required for public read-only resources. The backend must be externally reachable from Vercel and permit server-side connections. The internal origin must be reachable by Next.js. A private origin is supported when reachable from the deployment network and a separate public HTTPS origin is configured. **The server-only internal origin must not be exposed to browsers; public document/media routes require a separate allowlisted browser-accessible origin.**

Validation:

```bash
npm run lint
npm run typecheck
npm run build
npm test
npm run check:structure
```

## Contract and API integration

- Received `forma-backend-v0.2 (1).zip` and extracted `openapi.yaml` and `docs/FRONTEND_INTEGRATION.md` as read-only snapshots under `docs/`. Backend v0.2 authors mark its checked-in OpenAPI as **provisional and manually authored**, pending generation/validation in the Django runtime; confirm against the deployed API before launch.
- `src/lib/api/types.ts`: typed response DTOs following that contract (handwritten, not automatically code-generated; code generation requires a validated canonical OpenAPI).
- `src/lib/api/client.ts`: server-only REST reads for `/api/v1/categories/`, `/categories/{slug}/`, `/templates/`, `/templates/{slug}/`, `/templates/{slug}/quick-preview/`; revalidate 60 seconds, no server tokens or file paths. Errors are differentiated from empty results.
- `src/app/api/quick-preview/route.ts`: frontend-side **read-only proxy** (not a new Django endpoint) for the interactive dialog; validates slug / locale and forwards to the documented Django quick-preview endpoint.
- `/templates` and `/search` read backend pagination and preserve `q`, `category`, `sort`, `page` across navigation. DRF title sorting uses editorial English for both locales.
- `/categories` lists published category DTOs, category detail links to filtered template listing. Header shows up to 3 first-page top-level categories; a later release should support a hierarchical menu.
- `/templates/[slug]` renders real summary, description, license, categories, attributes and localized SEO metadata. `/uk` has corresponding routes. The public `language` field reports actual fallback language; it is not inferred from `lang` request.
- v0.3 supports the backend-provided optional `cover_preview_url` in catalog, Quick Preview and detail; the previously supplied v0.2 contract did not contain this field. Confirm the field on all 3 API representations against the currently running backend and regenerate canonical OpenAPI before release. No uploads or downloads are implemented.

## SEO and localization (v0.2.1; unchanged in v0.3)

- The App Router now uses **two root layout groups**: `src/app/(en)/layout.tsx` emits `<html lang="en">` and `src/app/(uk)/layout.tsx` emits `<html lang="uk">`. Route-group names do not affect public URLs: English remains at `/`, Ukrainian at `/uk`.
- `LocaleSwitch` preserves mirrored route paths (including category/template detail slugs) and GET search/filter/page parameters. Unknown routes switch to the locale homepage. A corresponding route is not proof that a fully translated backend record exists: the existing API fallback remains in effect and the UI announces it.
- `src/lib/seo.ts` prepares host-validated HTTPS canonical URLs and reciprocal EN/UK `hreflang` for **known paired, static routes** when `NEXT_PUBLIC_SITE_URL` is configured. Dynamic templates/categories only emit locale-specific canonical URLs; reciprocal `hreflang` remains **off** until backend can prove both exact-language, published variants. This avoids misrepresenting fallback content as localized translations.
- SEO launch is **hard-disabled** regardless of `FORMA_ENABLE_INDEXING`: `robots.txt` disallows all, every page has `noindex`, sitemap stays empty. An indexing rollout requires verified domains, published sitemap, QA-approved content and verified locale parity, implemented and tested as a separately reviewed change. Existing `FORMA_ENABLE_INDEXING` is currently a reserved flag with no activation effect.
- Detail routes map backend HTTP 404 to Next.js `notFound()`, while network failures return unavailable states; the API client classifies network errors as 503 and invalid JSON as 502, preserving server HTTP statuses. Actual locale fallback is determined exclusively from the backend `language` response field.
- Types are manually maintained from the provisional v0.2 backend OpenAPI snapshot. `src/lib/api/generated/README.md` documents a future verified-schema codegen boundary; this release adds **no generator dependency** and makes **no backend contract changes**.

## Manual verification after dependencies are available

Inspect the rendered HTML document for `/` and `/uk`, confirm `html[lang]` attributes, test language switching on detail/search pages (including query parameters), and verify fallback, missing-slug and API-offline states against a live Django server. Test that all pages are `noindex`, `robots.txt` disallows indexing, sitemap is empty and there is no `hreflang` on a dynamic record without verified translations. These browser/runtime checks have **not** been executed in this environment.

## Real document previews (v0.3)

The v0.2.1 `TemplateCard` hardcoded **Document preview unavailable**, its DTOs omitted `cover_preview_url`, and no `next.config.ts` image allowlist existed. All 3 rendering surfaces now use `DocumentCover` with the optional `cover_preview_url` returned by Django. The fallback text appears only when the URL is missing or not trusted; no generated or fake image is used. `Image` retains responsive sizing and containment within the existing document frame.

For local development, configure `.env.local` with `FORMA_API_URL=http://127.0.0.1:8000` (or `http://localhost:8000`). Run Django and Next.js **on the same machine as the browser**. Both host spellings are permitted on port 8000 in development; the exact backend hostname configured in `FORMA_API_URL` is used in production. Remote image optimization is kept on for production backend images. Because the Next.js optimizer protects against local/private IP access, only local development loopback preview images are passed to `<Image unoptimized>`; **no global `images.unoptimized`, `dangerouslyAllowLocalIP` or wildcard remote host is set**. A browser may access loopback hosts even though server-side optimized fetching is blocked. A hosted frontend cannot reach a developer's `127.0.0.1` browser API; use an externally reachable HTTPS backend in deployment.

`next.config.ts` derives the allowed remote image host/port from `FORMA_API_URL` (or the legacy `NEXT_PUBLIC_API_URL`). Restart the Next dev server after changing this value. The image rendering helper accepts only the trusted backend origin and `/api/v1/templates/.../previews/{number}/` paths; local host aliases are development-only. For a production domain set `FORMA_API_URL=https://your-real-backend-domain` and verify URLs returned by Django use the same externally accessible origin. The client does not fetch private document files or expose a download API. If future preview URLs use a CDN/different path, review the allowlist and contract explicitly rather than adding a wildcard.

To verify locally: open `/templates` after publishing a template with a generated cover; inspect the card's PNG, open Quick Preview and inspect its cover, then navigate to `/templates/the-clean-invoice` for the detail cover. If the image is missing, inspect the GET responses for each DTO, check `cover_preview_url` and network image HTTP status, and confirm the preview origin matches the configured Django host. Test `/uk/templates` likewise, test a template without a cover and a 404/missing record. The supplied environment had no running Django/Next instance, so end-to-end browser rendering could not be confirmed here.

## Known limitations and tests

Backend URL is not configured here, and no live Django server was available to exercise HTTP requests. The environment has no installed Next.js/React/ESLint dependencies (previous npm registry resolution returned `EAI_AGAIN`), so the attempted `npm run build`, `npm run lint` and `npm run typecheck` cannot be validated here. In v0.3.0, `npm test` passes **14/14**, `npm run check:structure` passes, and standalone TypeScript syntax transpilation is reported separately in the delivery notes. These do not replace full lint/typecheck/build. No E2E or browser accessibility tests were run. See `PROJECT_CONTEXT.md` for the remaining work.

## v0.3.1 — Quick Preview origin fix (2026-11-18)

**Current frontend baseline: v0.3.1**, superseding v0.3.0. Preserve this fix during subsequent work.

The catalogue renders on the Next.js server, but Quick Preview fetches its DTO in a browser-side Client Component. In v0.3.0 `getPreviewSource()` could not access the server-only `FORMA_API_URL` in the browser, so it rejected an otherwise valid `cover_preview_url`. In v0.3.1 the server-rendered `TemplateCard` passes the configured **public backend origin only** as `backendOrigin` to `QuickPreview`, which supplies it to `DocumentCover` and `getPreviewSource`. Do not regress to reading `FORMA_API_URL` from browser components. No secrets should be passed through this prop.

The approved backend origin and `/api/v1/templates/.../previews/{number}/` path are still validated. Dev-only loopback aliases and image-specific optimization bypass remain; Next.js global image protections are not disabled. The backend contract, routes, design tokens, SEO restrictions and existing API integration remain unchanged.

**Verification status:** the automated tests exercise the helper and source wiring; a manual browser check with running Django and Next.js is still required. Open a real image in the catalogue, Quick Preview dialog, and template detail, inspect the image request in browser DevTools, then test missing/invalid cover values.

See `CHANGELOG.md` and `docs/QUICK_PREVIEW_FIX.md`.

## v0.4 — Template Detail (Backend v0.4)

Baseline: **v0.3.1 Preview Fix**. The existing API client, EN/UK route layout, visual tokens, catalogue, and browser-side Quick Preview origin forwarding are preserved. Contract source: Backend v0.4 `docs/FRONTEND_V04_CHANGES.md` and `apps/api/catalog_serializers.py`; `openapi.yaml` is provisional and has not been runtime-validated.

`GET /api/v1/templates/{slug}/?lang=en|uk` now supplies `description`, `usage_instructions`, `formats: [{id,format,filename,byte_size,download_url}]`, and `previews: [{file_id,page,width,height,url}]`. Types are maintained in `src/lib/api/types.ts`, within the existing future OpenAPI codegen boundary. The detail route renders all actual preview pages, groups by `file_id`, sorts page numbers within each file, and preserves API format order. Keyboard navigation: focus the document image region; use Left/Right or Home/End; button controls and file selectors are also keyboard-accessible. Missing/invalid page URLs are not replaced with fictional images. File metadata is shown for each API file; a download link is rendered only when `download_url` is present and its origin and exact route match the configured backend. A null, untrusted, or absent URL produces an unavailable label without an active control. Download responses are streamed by Django; the frontend never accesses private storage keys, intermediates binary files, or invents URLs.

Localized descriptions and usage instructions come from Django translations; `language` drives the existing fallback notice. Empty descriptions, instructions, file lists, and previews are handled independently. API 404 calls Next `notFound()`; API 429 is surfaced as a localized rate-limit message, and other API failures show an unavailable message. Quick Preview remains compact and does not request detail's full gallery or copy. API SEO title/description/Open Graph fields inform metadata; canonical URLs remain on the configured site origin and are not overwritten with unverified foreign CMS URLs. All routes remain `noindex`, and API entity pages do not fabricate reciprocal hreflang. No Django code was changed.

Local configuration remains `FORMA_API_URL=http://127.0.0.1:8000` in `.env.local` (or `http://localhost:8000`). For production specify the actual externally reachable HTTPS backend origin. **Do not read server-only `FORMA_API_URL` in a client component**: `DocumentGallery` receives the public `backendOrigin` from its server-rendered parent, just as v0.3.1 `QuickPreview` does. The same `getPreviewSource` checks the Django origin and preview route. Development loopback images bypass the image optimizer per-image; global image optimization safeguards remain in place.

Manually test after dependencies are installed and both servers run: open a published template in `/templates/{slug}` and `/uk/templates/{slug}`, step through all PNG pages and file tabs with mouse and keyboard, check preview order/alt text, download an enabled file, disable downloads on Django and verify the link disappears after cache revalidation, and verify 404/429/empty/fallback states. **Download metadata is cached up to 60 seconds by the existing API client**, so Django remains the final authorization/status check for every download. A disabled link may remain visible briefly until the API cache refreshes, but the backend rejects the request. Real browser E2E and live Django integration have not been run in this environment.

Tests here: Node test suite **22/22 passed**; structure check passed; TS/TSX syntax transpilation **54 files, zero diagnostics**. `npm run lint`: `eslint: not found`; `npm run build`: `next: not found`; `npm run typecheck`: could not resolve Next/React/Node types because dependencies were not installed. These checks must run in CI after `npm install`; syntax transpilation does not establish correct typechecking or a successful build.


## v0.5 — Community Submissions (Backend v0.5)

Contract snapshot: `docs/FRONTEND_V05_CHANGES.md` (from `forma-backend-v0.5.zip`) and `apps/submissions/api.py`. The checked-in older OpenAPI snapshot is **not** the canonical v0.5 contract; runtime verification and regeneration remain pending.

The existing `/submit` and `/uk/submit` routes render a **real client-side multipart form** (`src/components/submission-form.tsx`). Required: title (240), description (5000), author_name (160), author_email (254), file (DOCX/XLSX/PDF, nonempty, at most 20 MiB). Optional: portfolio_url (500), category (published slug, 160), suggested_category (160). All lengths are maximum characters. Categories are loaded from the existing published-categories read API; if unavailable, the optional suggestion stays usable. No moderator-controlled fields are posted.

On submit the browser sends FormData directly to the documented `POST /api/v1/submissions/` on the backend origin supplied by the server-rendered SubmitPage. **Do not set the multipart Content-Type manually**: the browser adds the boundary. The frontend does not stream bytes via Next.js serverless functions, which may have request-size limits smaller than 20 MiB on Vercel. `FORMA_API_URL` remains server-only and is never read by client components, preserving the v0.3.1 Quick Preview fix. The submission endpoint origin must be a configured HTTPS backend in production; HTTP loopback is allowed only in development. The origin is not a secret.

**CORS requirement:** for a local frontend at `http://localhost:3000`, configure Django `CORS_ALLOWED_ORIGINS=http://localhost:3000` (add `http://127.0.0.1:3000` if used). In production configure the exact deployed frontend HTTPS origin in Django; `CORS_ALLOW_CREDENTIALS` stays false. The form does not send cookies. A network/CORS failure renders the unavailable state; backend host must be reachable from the **visitor's browser**, not only Next's server. Do not enable wildcard CORS or disable upload safety gates to make the form work.

State mapping: `202 {id,status:'quarantined'}` → receipt for private quarantine (never publication); `400` → mapped server field messages; reverse-proxy `413` → file size error; `429` → rate limit; `503`, network/CORS failure, unexpected or malformed response → unavailable. Client checks provide early UX feedback, but Django verifies content structure, file limits, published categories, throttle and quarantine. On `503` the form is disabled for the session until reload; no fake success or automatic retry. The feature is **default OFF** on backend. On Windows local Django deliberately returns 503 regardless of public submission feature flags. **Do not bypass backend gates to test 202.** A Django production deployment must have truly isolated scanning, antivirus, networking and explicitly enabled submission feature flags before intake can be enabled.

The public API exposes no submission list, details or tracking endpoint. Receipt IDs are not a tracking capability. Submissions may be rejected during review and are not auto-published. Use only the categories/templates existing from backend; no placeholder documents or mock uploads are added. SEO indexing remains disabled.

Manual QA: start Django and Next, verify `/submit` and `/uk/submit`, inspect browser network FormData, empty fields, oversized/unsupported files, no category selection, optional portfolio, backend 503 (expected locally), server 400 field errors, scoped 429, and a real 202 **only in a properly secured production-like deployment**. Also retest catalog, Quick Preview, Template Detail images/gallery/downloads. Browser E2E is not verified here.

### Validation performed for this delivery

- `npm test`: 28/28 tests passed (including 6 new submissions tests).
- `npm run check:structure`: passed.
- Standalone TypeScript syntax transpilation: 56 TS/TSX source files, 0 diagnostics.
- Standalone strict typecheck of `src/lib/submission.ts`: passed.
- `npm run lint`: ESLint unavailable (`eslint: not found`).
- `npm run typecheck`: did not pass because Next.js/React/Node typings were not installed, so this is **not** proof of project type safety.
- `npm run build`: Next.js unavailable (`next: not found`).
- No live Django/browser E2E was run. Before production, install dependencies, run lint/typecheck/build, verify CORS and end-to-end behavior.

## v0.5.1 — Lint configuration and dependency security verification

This patch preserves v0.5 behavior, Django API, document previews, download links and submissions. The flat ESLint config is now a named default export; generated `next-env.d.ts` and `.next` output are ignored, while the CommonJS `require` exception applies **only** to `tests/**/*.cjs`. Catalogue category accumulation uses `const`; the existing SEO helper signature is preserved and explicitly marks its unused `_noindex` argument (indexing remains forcibly disabled). The contract test uses `loadedModule` instead of shadowing the Node `module` identifier.

**Dependency-security status: unresolved, not certified.** The v0.5 source archive contains no `package-lock.json` and no installed dependencies. `npm audit --json` / `npm audit` cannot evaluate a tree without a lockfile (`ENOLOCK`). Generating a lockfile requires registry access, but this execution environment returns `EAI_AGAIN` for registry.npmjs.org. Consequently, the reported Windows count of 15 (1 moderate, 14 high) is a user-observed input, **not reproduced here**. Neither individual vulnerable packages nor production-vs-development exposure can honestly be established without the resolved dependency tree. No broad major upgrade or `npm audit fix --force` was attempted. Do not treat this patch as a dependency security fix.

Run the following in the project root **on a network-connected machine**, retaining the generated `package-lock.json` in source control:

```bash
npm install
npm audit --json > audit-before.json
npm audit --omit=dev
npm run typecheck
npm run lint
npm test
npm run build
```

Inspect `audit-before.json` for each advisory's `name`, `severity`, `via`, `range`, `fixAvailable` and `nodes`, then identify whether each dependency is in the production install (`npm ls <package> --omit=dev`) or development-only. Apply minimal reviewed upgrades supported by the advisory, regenerate and commit `package-lock.json`, rerun the entire suite and save `npm audit --json > audit-after.json`. Never run `npm audit fix --force` or assume that `--omit=dev` means an advisory is harmless to CI. Do not enable production deployment until the remaining risk is assessed.

Local checks for this ZIP: `npm test` **28/28 passed** and `npm run check:structure` **passed**. `npm run lint` fails because `eslint` is not installed; `npm run build` fails because `next` is not installed; `npm run typecheck` fails because Next/React/Node types are unavailable. Thus lint/build/typecheck success has **not** been proven in this environment.

## Frontend v0.5.2 — CSS warning and dependency security

The catalogue control row uses `align-items: flex-end` in place of `end` for equivalent flex cross-axis alignment and better Autoprefixer compatibility. `tests/css-compatibility.test.cjs` guards this selector.

**Dependency security is not resolved.** The v0.5.1 source archive did not include a `package-lock.json`; npm registry access failed in this environment. The Windows report of 15 total/2 production vulnerabilities cannot be mapped to exact dependency versions or cleared from here. See [`docs/SECURITY_V052.md`](docs/SECURITY_V052.md) for upstream PostCSS advisories, bundled dependency caveats, exact commands to collect the audit tree, and a conditional Next.js 16 migration plan. No security overrides were added; run the full verification commands after installing dependencies.


## Frontend v0.6 — dynamic catalogue filters

The shared catalogue view now loads `/api/v1/filters/?lang=en|uk[&category=...][&format=...]` and sends filter selections to `/api/v1/templates/` as `attr.<key>=value1,value2` (comma-separated OR within one attribute; AND across attributes). The API, not the frontend, owns filter names, options, labels, counts and display order. The only fixed format choices follow the backend v0.6 contract: DOCX, XLSX, PDF.

The same component serves `/templates`, `/search`, `/categories/[slug]` and their `/uk/` equivalents. The category page locks category scope and preserves its breadcrumbs. Client-side filter changes reset `page`; pagination retains filters. Sorting/search submits via URL; navigating Back/Forward restores the state. Clear filters preserves the query, category and sorting. Mobile uses a native modal dialog with Apply/Clear, Escape and focus restoration.

**API errors:** invalid attributes and repeated query values are forwarded to Django for HTTP 400 validation instead of being silently accepted. Rate-limiting (429), absent pages (404), empty results and discovery errors have distinct, non-fabricated states. Backend limits: max 8 attributes, 8 values per attribute, 2048 encoded query chars, 120-character search text and page_size <= 100. Counts are category/format-scoped, not recomputed after selecting other filters.

**SEO:** filtered and search URLs stay `noindex,follow`; canonical targets clean existing catalogue/category URLs, never combinations. Global indexing remains off; sitemap does not enumerate filter combinations. The server-origin-to-client-props Quick Preview fix from v0.3.1 remains untouched.

**Dependencies:** `package.json` retains the validated-on-Windows Next.js 15 PostCSS override `8.5.23`. The supplied earlier lockfile was adapted to this version without an externally verified package integrity checksum; `npm install` on a networked machine must regenerate verified lockfile metadata, then commit the resulting `package-lock.json`. The 13 previously reported high development-tooling audit findings remain open until a fresh audit confirms otherwise. Do not use `npm audit fix --force`.

**Verification here:** 39/39 Node tests and structure checks pass. A syntax-only TypeScript/TSX transpilation check passes; full ESLint, typecheck, Next build and production audit require dependencies. `npm ci` failed with npm registry DNS `EAI_AGAIN`; offline install failed `ENOTCACHED`. The earlier Windows green build and clean production audit belong to v0.5.2 with installed dependencies and do not prove a green v0.6 build.

### v0.6.1 — category query forwarding

Next.js 15 category-detail route pages (`/categories/[slug]`, `/uk/categories/[slug]`) explicitly await async `params` and `searchParams` before forwarding both the slug and the query to `CategoryDetailPage` / shared `Catalog`. Query parameters such as `format`, `attr.*`, `q`, `sort`, `page` and `page_size` are retained. A category URL always takes precedence over a conflicting `?category=` value. Next.js `_rsc` is never forwarded to the backend.

Regression coverage: `tests/category-searchparams-v061.test.cjs`. The expected filtered empty state is rendered when the backend returns an empty list; never invent results. Verify in a live browser with running Django by visiting `/categories/invoices?format=xlsx` and `/uk/categories/invoices?format=pdf` and using Back/Forward and pagination. Note that local build-time Django availability is distinct from successful Next.js compilation.

Current source check: 42/42 Node tests pass and structure guard passes. Local full lint/typecheck/build unavailable in the packaging environment without installed dependencies. Preserve the Next.js 15 PostCSS 8.5.23 override and run `npm ci`, lint/typecheck/build and fresh audits in network-enabled CI.

## v0.7 CMS / SEO integration — provisional contract status

**Important blocker:** The Backend v0.7.1 ZIP and `docs/FRONTEND_V07_CHANGES.md` were **not** available in the working environment. This source release adds a **provisional, defensive** read-only CMS integration, NOT a verified integration against Backend v0.7.1. Do not deploy or enable indexing until Django Swagger DTOs, aliases, publication flags, and pagination semantics have been checked and browser-tested. The only backend ZIP available while implementing this release was v0.6.1.

- English public routes `/about`, `/privacy`, `/terms`, and `/[slug]` use `GET /api/v1/pages/{slug}/?lang=en`; Ukrainian counterparts use `?lang=uk`. Concrete existing paths win over the one-segment catch-all. Missing pages return 404; unavailable CMS shows an error rather than fabricated content.
- The footer draws only explicitly navigation-visible public pages from `GET /api/v1/pages/?lang=…`, following paginated results up to a bounded limit. Pages hidden from navigation remain directly reachable if published.
- Runtime guards require a valid slug, title, language, body for details, a standard `results` list shape, and optionally `status: published` / `is_published: true`. Fields not confirmed by v0.7.1 must be reconciled before rollout.
- The restricted Markdown renderer supports headings, paragraphs, bullets, numbers, safe HTTP(S)/mailto/relative links, basic emphasis and inline code. Raw HTML is rendered literally as text; it is never executed.
- Next Metadata API uses only actual CMS/catalog values and optional API SEO fields. The `NEXT_PUBLIC_SITE_URL` origin must be HTTPS, not localhost. Only verified source-language pairs receive reciprocal hreflang. No fake localized alternates. OG images are allowed only on the verified site origin; actual DTO field names still require v0.7.1 verification.
- Sitemap generation is **inactive** while `indexingEnabled=false`, as are all search indexing permissions. A bounded, provisional published-resource sitemap implementation is staged for later backend contract verification and scaling. Filter/search URLs are never added. Robots remains `Disallow: /`.
- JSON-LD WebSite (homepage) and BreadcrumbList (template/category pages) derive from actual routes and titles when a verified public site URL exists. No fabricated ratings/reviews/authors.
- Existing v0.6.1 category `searchParams` fix, Quick Preview v0.3.1 origin propagation, dynamic filters, downloads, and submissions are unchanged.

For local integration, run Django v0.7.1 separately and use `FORMA_API_URL=http://127.0.0.1:8000`, `FORMA_ENABLE_INDEXING=false`. Check published/draft/archived/non-navigation CMS pages; EN and UK real translations and fallback, 404, API 429/503, Markdown links, title/description, and sitemap/robots policy. Do **not** turn on indexing based only on this package.

### Verification (this environment)

- `npm test`: **50/50 passed** (42 existing + 8 new CMS/SEO source regression tests).
- `npm run check:structure`: passed.
- TS/TSX syntax-only transpilation: 63 files, 0 diagnostics.
- `npm ci --offline`: **failed ENOTCACHED** (`yocto-queue` missing). Dependencies therefore unavailable; full lint/typecheck/build not confirmed here.
- Revalidate `npm audit --omit=dev` after `npm ci` against the current registry; v0.6.1 PostCSS override `8.5.23` is retained. Prior 13 high dev tooling findings remain unresolved absent a fresh audit.

## v0.7.1 CMS API contract correction

The public Page List endpoint (`GET /api/v1/pages/?lang=en`) supplies `slug`, `locale`, `title`, `summary`, and `available_translations`. It does **not** supply `show_in_navigation` or `show_in_footer`. The public Page Detail (`GET /api/v1/pages/{slug}/?lang=en`) supplies these visibility flags, plus `body` and `seo`. CMS components use **`locale`**, not `language`.

Footer links are included only when the corresponding public **detail** confirms `show_in_footer: true`, and its `locale` matches the requested locale. List items are candidates, not proof of footer visibility. This creates additional read requests during server rendering; consider adding `show_in_footer` to the backend Page List DTO later to remove the N+1 lookup. `show_in_navigation` is not used as a surrogate for `show_in_footer`. A page with `show_in_navigation: false` remains accessible via its published detail URL. English fallback content is not incorrectly declared as a Ukrainian translation or alternate.

Contract-shaped JSON test samples are in `tests/fixtures/cms-v071/`. They are **illustrative fixtures built from the confirmed field requirements**; they are not claimed to be exported from a running Backend v0.7.1, whose archive and Swagger were not available for inspection in this session. The runtime tests exercise the actual CMS client rather than only examining its source text. For production, verify exact JSON (including SEO and translation shape) with Django's generated OpenAPI and live responses.

With Django running locally, check `/api/v1/pages/?lang=en`, `/api/v1/pages/about/?lang=en`, `/api/v1/pages/about/?lang=uk`, and a draft slug returning 404. Then run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm audit --omit=dev`. Keep `FORMA_ENABLE_INDEXING=false` until SEO launch validation.

## v0.7.2 portability fix

Windows/Linux/CI: install dev dependencies with `npm ci`, then run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `npm audit --omit=dev`. CMS fixture tests use `require('typescript')` from the project installation; no global TypeScript or machine-specific filesystem paths are supported. The v0.7.1 CMS runtime fixture assertions are retained. A separate portability test prevents regressions. Current packaging environment could not install packages (`ENOTCACHED`/registry unavailable); full build and audit require verification in a network-enabled environment. Next 15 PostCSS `8.5.23` override is preserved.

## v0.8.0 — Premium Editorial Visual Redesign

The three approved references are implemented as a responsive UI composition, while all cards, categories and images continue to come from published Django API data. There is no sign-in, sign-up or public user account. New design tokens and responsive rules are documented in [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md). The templates list endpoint has no confirmed file-format field: cards intentionally do not display invented format badges.

Existing Next.js 15, Django API, CMS Page List/Detail, URL-based filters, category async searchParams, Quick Preview, real gallery, controlled downloads, submission error handling, EN/UK and `indexingEnabled=false` are retained. For production, configure HTTPS Django and `NEXT_PUBLIC_SITE_URL`; test real preview image/download access from the browser.

Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm audit --omit=dev` on the machine with npm registry access. Visually inspect responsive behavior at 390, 768, 1024, 1440 and 1920px and check the CMS footer and no-public-login decision.

### v0.8.1 UI corrections

The homepage hero is text-only until a backend CMS hero-image contract exists; the search magnifier is an inline SVG; featured and catalog document covers use portrait proportions. The hardcoded About link was removed from the public header, but existing CMS routes and footer visibility rules remain intact.

### v0.8.2 — Homepage artwork & card disclosure

Two approved, locally bundled, optimized WebP illustrations are used on the homepage. These are **decorative assets only**, not product previews; documents in featured/catalog cards still come solely from Django API. Category tiles are mint with single-line titles, and cards show real summaries if provided. On hover/focus the Quick Preview action reveals in a positioned extension below the card, without shifting the grid; touch devices show the action without requiring hover. Existing Next.js 15 APIs, CMS routing, locale switching and SEO noindex settings are unchanged. Hero CMS control is deferred until a real backend DTO is provided.

Run `npm ci && npm run typecheck && npm run lint && npm test && npm run build && npm audit --omit=dev` in an environment with registry access, then visually review the homepage and Quick Preview keyboard/touch behavior. Tests in the packaging environment passed 75/75; a dependency-backed build and browser QA could not be completed there.

### v0.8.3 card hover
On pointer devices Quick Preview extends the card below its normal grid box as a seamless, flush continuation without reflow. On touch devices the control remains inside the card in normal flow. Check the last row near the contribution banner visually on Windows.

### v0.8.4 CMS header navigation fix

CMS pages with `show_in_navigation=true` appear in desktop and mobile header menus; pages with `show_in_footer=true` appear in the footer. Both flags are checked independently using the **Page Detail** response because the Page List response omits them. Hidden-but-published pages remain accessible by direct URL. Actual localized titles are used for `/` and `/uk` routes; fallback-English entries do not become fake Ukrainian navigation links. The backend controls publication and visibility.

`src/lib/api/cms-navigation.ts` gathers Page List entries and requests Detail once per unique slug in bounded batches of six. Existing fetch revalidation is 60 seconds; this does not eliminate per-page detail requests. Ordering is stable in Page List order, with optional valid `sort_order` from Detail when supplied. No Django endpoint changes. With many CMS links the desktop menu scrolls inside its header region, and the mobile menu scrolls vertically.

After `npm ci` run `npm run typecheck && npm run lint && npm test && npm run build`. With Django available, verify the four combinations of the two visibility flags in EN and UK, and verify live publication status. The packaging environment did not run Django E2E or browser visual QA.

### v0.8.4 Windows ESLint follow-up

The corrected test harnesses avoid the `module` binding forbidden by Next ESLint and retain executable CMS contract tests. After `npm ci`, run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`. The last packaging environment ran 92 tests successfully but could not complete `npm ci --offline` (`ENOTCACHED`).

### v0.8.5 local validation (Windows / CI)

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm audit --omit=dev
```

Visit `/submit` and `/uk/submit`: both must return HTTP 404 and must not appear in main/mobile/footer links or sitemap. Verify published templates, CMS navigation and public downloads still work with Django. Source tests pass in the packaging environment, but full dependency-backed build and browser smoke tests there are unverified. Prior submission documentation below records **historical v0.5 behavior only**; it is not part of the current MVP.

### Updating from a previous frontend ZIP
Unpack each release into a **new empty directory** instead of extracting over an older version. Removed files (such as `tests/submission-v05.test.cjs` and `src/components/submission-form.tsx`) are not deleted by many ZIP extraction tools and can cause obsolete tests to run or stale features to persist. Copy only your local `.env.local` and approved custom settings, not old `src/` or `tests/` files. Then run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. A build may log `ECONNREFUSED 127.0.0.1:8000` if the development Django API is down; check whether Next.js ultimately finishes successfully, and run integration checks with Django available.
