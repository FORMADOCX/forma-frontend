# FORMA Frontend v0.8.4 — Integration and security report

Date: 2026-11-19. Baseline: Frontend v0.8.3. Backend target: Django v0.8.1 **not available in this session**; do not treat this document as verification against v0.8.1 runtime.

## Source evidence

- Inspected actual frontend clients, DTOs, route handlers and components from v0.8.3, including all template, category, filter, CMS, preview and download consumers.
- The latest backend source archive accessible here is **v0.6.1**, `apps/api/catalog_serializers.py`. Its `AttributeSerializer` uses `value = serializers.JSONField()`; `template_dto()` emits `single_select` as an option code or null and `multi_select` as an array of selected option codes. This evidence does **not** establish that Django v0.8.1 has an identical DTO.
- Previously integrated v0.7.1 CMS Page List/Detail rules and their fixtures were retained; the v0.8.1 Swagger contract was **not** independently inspected. No Django API endpoints or backend code changed.

## Root causes and changes

1. `Attribute` previously allowed only `text|number|boolean` with a scalar value. Detail interpolated unknown objects with `String(...)`, risking `[object Object]`. Types now include `single_select`, `multi_select`, and `string[]|null` for JSON values. `formatAttributeValue()` handles all five known types, deduplicates option codes and suppresses empty/invalid values. The Detail page displays only meaningful values. The Quick Preview DTO (per available contract) has **no attributes**; attributes were not invented for its dialog.
2. `FORMA_API_URL` (server/private origin) was passed to browser-facing client props and used to build absolute preview/download URLs. In containerized production this can leak internal hosts and break images/downloads. `FORMA_API_URL` stays server-only. `NEXT_PUBLIC_API_URL` is the browser-accessible Django HTTPS origin, and is *required in production* for document media, download links and submissions. In dev an internal-origin fallback remains possible. All received preview/download URLs are checked against allowlisted internal/public origins and exact public Django API path shapes, then remapped to the public origin. Invalid/untrusted URLs are suppressed, never passed to the browser. Original R2/storage URLs are not used.
3. The CMS Page List DTO lacks `show_in_footer` and `show_in_navigation`. Correct footer inclusion still requires Page Detail checks. The site already uses `fetch(..., { next: {revalidate:60} })` for both calls, enabling bounded cache lifetime; Detail calls are now bounded to six concurrent requests per page rather than unbounded fan-out. This **does not eliminate the initial N+1**; an API field on the list or a dedicated navigation endpoint is required to avoid it. Backend suggestion: add `show_in_footer` and `show_in_navigation` to the Page List response without changing the separate direct URL publication policy.
4. Existing CSS, artwork, card hover, locale routing, SEO indexing flag, CMS Markdown, filters, Quick Preview, gallery and submission semantics were left unchanged.

## URL configuration

```
# Development: Next server and browser both reach local Django
FORMA_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
FORMA_ENABLE_INDEXING=false

# Production example (illustrative hostnames, not FORMA-approved domains)
FORMA_API_URL=http://django:8000
NEXT_PUBLIC_API_URL=https://api.example.org
FORMA_ENABLE_INDEXING=false
```

`FORMA_API_URL` must be reachable from Next server; `NEXT_PUBLIC_API_URL` must be a browser-reachable public HTTPS origin serving existing `/api/v1/templates/.../previews/`, `/download/` and `/api/v1/submissions/` routes. Configure Django reverse proxy, `ALLOWED_HOSTS`, trusted proxy forwarding as appropriate, and browser CORS for direct submission POST; otherwise CORS errors are shown as unavailable. Never copy secrets into `NEXT_PUBLIC_*`. `NEXT_PUBLIC_API_URL` is public by design. No cloud storage URLs, signed storage credentials or auth added.

Server maps permitted relative or internal-origin Django URLs to the configured public origin, preserving only validated paths. Production excludes loopback/private hosts for the public origin and requires HTTPS. Missing/invalid public configuration fails closed: preview unavailable, downloads disabled, submissions unavailable. For local development, `localhost` and `127.0.0.1` are treated as equivalent only for the same protocol and port. Next Image remote allowlist uses public origin in production and the existing bounded local exceptions in development; image optimization of local URLs remains opt-out per-image.

## Download and errors

File links remain direct Django browser downloads. Django is authoritative for stream permissions and 403/404/429/503; frontend does not infer download success from link rendering. A failed download may display the browser's/server's HTTP error rather than an in-page toast; a new same-origin download proxy is intentionally out of scope. Detail and Quick Preview retain their existing unavailable/error states. The UI never invents previews or downloadable files.

## Validation and limitations

- Automated regression tests include live execution of pure DTO helpers, URL remapping/rejection, multi-select formatting, existing filters, CMS, locale and SEO guards. No mock API used in production.
- `npm ci --offline` cannot complete (`ENOTCACHED` on `yocto-queue`). Therefore full Next.js/React-backed `typecheck`, `lint`, and `build` are **not confirmed** in this environment. Strict isolated TypeScript checking of the three new pure helper modules succeeds with a minimal local process declaration; this is not the same as project typecheck.
- Browser/Django v0.8.1 E2E not run: Django v0.8.1 code/service unavailable. In particular pipeline-worker failures in the backend are a separate concern. DTO fields not visible in v0.6.1 contract were not assumed.
- Previous user-reported 13 high development-tooling audit findings remain subject to a fresh full audit. The offline `npm audit --omit=dev` result for the lockfile is not a substitute for a registry-backed audit. PostCSS override 8.5.23 retained.

## Recommended Windows smoke checks

```
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm audit
npm audit --omit=dev
```

With Django v0.8.1 running and the two origins configured, verify EN/UK Home → Template Card → Quick Preview → Template Detail → page thumbnails → Download. Test PDF/XLSX and missing previews, download 403/404/503, submit 503, CMS `show_in_footer`, category `attr.*` multiselect combinations, URL Back/Forward and private Django host non-disclosure in View Source / DevTools Network. Confirm Django 0.8.1 `GET /api/v1/templates/{slug}/` attribute JSON representation against runtime Swagger/fixtures before production approval.

### CMS header navigation correction

`SiteShell` now delegates navigation to `getCmsNavigation(locale)`, which reads Page List and requests each unique Page Detail once. `show_in_navigation` controls desktop/mobile header; `show_in_footer` controls footer independently. Published pages with neither flag remain directly addressable. Exclude localized fallback details and detail errors. List ordering is preserved, with optional validated integer `sort_order` from Detail when available. This field's availability in Backend v0.8.1 was not independently inspected. List DTO still does not include visibility fields, so detail requests remain necessary. Fetch revalidation stays at 60 seconds and detail concurrency at six. Browser + live Django behavior remains unverified in this environment.

## v0.8.5 supersession notice
All references above to browser submission POST, `/submit`, or submit error handling describe the older v0.8.4 functionality. Admin-Only Publishing supersedes it: no public client-side file intake, both locale submit pages return 404, and public backend submission POST must be blocked independently. Preview/download URL security stays unchanged.
