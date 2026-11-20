# Frontend Architecture

## Scope and boundaries

FORMA's public frontend is a Next.js 15 App Router application with TypeScript and React 19. Django REST Framework is a separately deployed `/api/v1/` service and owns publication, content and document access. The current MVP allows **Admin-Only Publishing**; there is no public user authentication or submission form.

## Rendering and data flow

1. Next.js server-side API adapters (`src/lib/api/client.ts`, `src/lib/api/cms.ts`) request published catalogue and CMS JSON from the configured backend origin. GET requests use Next.js `revalidate: 60` caching; some pages are rendered dynamically as required by their URL parameters.
2. `src/lib/api/types.ts` declares handwritten DTOs. List, detail and Quick Preview records are distinct; frontend fields must be verified against the actual Django responses rather than inferred from display requirements.
3. The catalogue reads categories and filter definitions from Django. Search, sort, format and `attr.*` selections are represented in URL search parameters, forwarded to backend filtering and preserved during pagination.
4. Template cards show actual backend cover previews when trusted and present. Detail views group actual page previews by document file. Missing/invalid images produce an explanatory fallback, never an invented document image.
5. `src/app/api/quick-preview/route.ts` provides a small Next.js read-only proxy for the interactive dialog. This does not create or change a Django endpoint. Download actions use validated Django document download paths, not cloud object-storage links.

## Internal and public backend origins

- `FORMA_API_URL` is intended for server-to-server Django reads and is not exposed through a client environment variable.
- `NEXT_PUBLIC_API_URL` is an explicitly configured browser-facing origin. It must be publicly accessible over HTTPS in production.
- `src/lib/api/public-urls.ts` and the normalization helpers restrict browser URLs to configured origins and supported `/api/v1/templates/.../files/.../previews/.../` or `/download/` routes. A missing public origin disables unsafe browser resources rather than leaking a private hostname.
- `next.config.ts` configures remote Next.js image hosts from the public API origin and does not globally enable local-IP image optimization.

The origin is a **base URL**, with no `/api/v1` suffix. Environment configuration is covered in [Deployment](DEPLOYMENT.md).

## CMS static pages

The CMS Page List adapter provides published localized page summaries. Header/footer visibility is determined from **Page Detail** fields `show_in_navigation` and `show_in_footer`, respectively. `src/lib/api/cms-navigation.ts` fetches each unique detail once, in batches of up to six, and builds independent menu lists, with stable ordering and optional `sort_order`. Errors or fallback-language content do not fabricate localized menu entries. Detail fetching cannot be eliminated entirely without a backend List DTO change.

The reserved `submit` slug is omitted from public navigation and sitemap. Both public submission routes return 404. The Django backend must also independently block unauthorized public submission endpoints.

## Localization and SEO

English is served under `/` and Ukrainian under `/uk`, using separate locale root layouts. Switches preserve supported URLs and search parameters. Backend locale/fallback values determine whether translated content really exists. Canonical and Open Graph URLs require `NEXT_PUBLIC_SITE_URL` to be a valid HTTPS origin.

The current implementation forces indexing **off** (`src/lib/seo.ts`): pages remain `noindex`, robots disallows crawling and the sitemap is empty regardless of the reserved feature flag. Activating crawlable pages requires a separately reviewed release.

## Boundaries and verification

The frontend has no user accounts, admin publishing UI, file storage, or public upload form. Backend malware scans, private storage and publishing permissions are backend concerns and cannot be guaranteed by frontend-only checks. The provisional historic OpenAPI file in this repository is not proof of compatibility with a deployed backend; confirm live DTOs and full download/preview flows before launch.

See [Design System](DESIGN_SYSTEM.md), [Deployment](DEPLOYMENT.md) and the [Changelog](../CHANGELOG.md).

## Category hierarchy and breadcrumbs

`src/lib/breadcrumbs.ts` builds display-ready breadcrumb items from validated public DTO fields, and `src/components/breadcrumbs.tsx` renders both accessible links and `BreadcrumbList` JSON-LD from that same list. Template Detail receives localized `categories: [{slug, name}]` without a primary flag; the current stable fallback selects the lexicographically smallest slug, never array order. Template Detail deliberately does not display an ancestor category. Category Detail uses `parent_slug` and resolves a published parent through the existing Category Detail API; a missing or nonlocalized parent is omitted. The `Catalog` category filter continues to use the requested slug.

Django models define `TemplateCategory.is_primary`, but the available public serializer does **not** return that preference. A minimal future, reviewed backend change could add `primary_category: {slug, name} | null` to Template Detail; the frontend must not infer it from model ordering or invent that field before the API changes.
