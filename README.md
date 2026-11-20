# FORMA

FORMA is an editorial library of editable document templates. Visitors can discover, preview and download published documents without creating an account. This repository contains the **public frontend**; document publishing and content administration are handled separately in Django Admin.

**Current MVP model: Admin-Only Publishing.** Public template submissions and user accounts are not supported. The frontend is under active development; successful automated builds do not constitute a production deployment or end-to-end verification.

## Current Features

- English (`/`) and Ukrainian (`/uk`) interfaces.
- API-driven template catalogue, search, categories, pagination, sorting, formats and dynamic attribute filters; filters persist in URL parameters.
- Template detail pages, actual document-page previews, Quick Preview and controlled Django download endpoints.
- CMS-managed published static pages, with independently configured header and footer visibility.
- Responsive editorial UI with accessible navigation and dialog controls, plus empty and error states.
- SEO metadata, canonical URLs where a verified site origin is configured, selective localized links, structured data and a deliberately disabled indexing rollout.

## Tech Stack

- Next.js 15 App Router, React 19, TypeScript.
- CSS design tokens and custom components (no additional UI framework).
- Separate Django REST Framework backend with versioned `/api/v1/` endpoints.
- Intended frontend hosting: Vercel. Backend hosting and storage are configured independently.

## Architecture Overview

Next.js server components fetch public catalogue and CMS data from the Django REST API. Client components handle interactive filters and Quick Preview, while download links continue to use validated Django endpoints. Document files are **not** stored in the frontend repository.

The server-side API origin can differ from the public browser-facing origin. Browser preview and download URLs are validated and restricted to supported Django routes. Content and navigation visibility come from backend responses, not bundled fixture data.

See [Architecture](docs/ARCHITECTURE.md) and [Design System](docs/DESIGN_SYSTEM.md).

## Requirements

- Node.js **20.9 or later** (Node.js 22 is used in local development).
- npm and access to the npm package registry.
- A separately running Django backend for live catalogue, previews, downloads and CMS integration.

## Getting Started

```bash
npm ci
cp .env.example .env.local
```

Edit `.env.local` to point at your own Django instance. For local development, for example:

```dotenv
FORMA_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
FORMA_ENABLE_INDEXING=false
```

Then start the app:

```bash
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp` if needed. Open the local URL printed by Next.js. An unavailable backend produces unavailable/empty states; it is not a substitute for live integration testing.

**When upgrading from a ZIP:** extract into an empty directory, rather than over an older copy. Stale removed tests or components from earlier releases can otherwise remain on disk.

## Environment Variables

| Variable | Usage |
| --- | --- |
| `FORMA_API_URL` | Server-only Django origin, without `/api/v1`; used for server-side API reads. |
| `NEXT_PUBLIC_API_URL` | Browser-accessible Django origin, without `/api/v1`; **public HTTPS is required in production** for previews and downloads. |
| `NEXT_PUBLIC_SITE_URL` | Optional verified HTTPS frontend origin for canonical and Open Graph URLs. |
| `FORMA_ENABLE_INDEXING` | Reserved SEO launch setting. Keep `false`; the current code enforces `noindex` regardless of the value. |

Only `NEXT_PUBLIC_*` values are intended to be exposed to the browser. **Never put credentials or secrets into these variables.** See [Deployment](docs/DEPLOYMENT.md) and the safe [environment example](.env.example).

## Development Commands

```bash
npm run dev              # local development
npm run typecheck        # TypeScript
npm run lint             # ESLint
npm test                 # Node test suite
npm run check:structure  # required project files
npm run build            # optimized Next.js build
npm run start            # serve the production build
npm audit --omit=dev     # production dependency audit
```

## Vercel Deployment

Deploy this repository as a Next.js project, configure the environment variables for the correct Vercel environment, and verify that the deployed Next.js server can reach Django. Use an externally reachable, approved **HTTPS backend origin** for browser-facing previews and downloads. Do not assume local `127.0.0.1` works in a Vercel deployment.

Confirm DNS, TLS, API permissions, browser access to document previews/downloads and SEO launch controls before public release. See the [Vercel deployment guide](docs/DEPLOYMENT.md).

## Backend Integration

Existing Django API routes include `/api/v1/templates/`, `/api/v1/categories/`, `/api/v1/filters/` and `/api/v1/pages/`, plus documented template detail, Quick Preview, document preview and download routes. The Next.js `/api/quick-preview` route is a **frontend proxy**, not a new Django API endpoint.

DTOs are maintained manually in `src/lib/api/types.ts`. The checked-in older OpenAPI snapshot is provisional; compatibility with the exact deployed Django version must be confirmed through its live responses and generated schema. See [Architecture](docs/ARCHITECTURE.md).

Public submission pages `/submit` and `/uk/submit` return 404. The backend must independently enforce Admin-Only Publishing permissions; removing frontend forms is not a backend access control.

## SEO and Localization

English routes are rooted at `/`; Ukrainian routes are rooted at `/uk`. Metadata, canonical URLs, Open Graph, breadcrumbs and structured data are generated where the available records support them. The app does not invent translations for records that fall back to English.

**Indexing is currently disabled in code:** pages use `noindex`, `robots.txt` blocks crawling and the sitemap is empty. Enabling indexing requires a separate reviewed release, verified domain, content and locale coverage.

## Project Status

The v0.8.6 source includes Admin-Only Publishing and the agreed design system. Windows development logs reported passing TypeScript, ESLint, 91 tests and a Next.js production build after stale files were removed. These are **local build checks**, not a live production or browser end-to-end certification. Integration with the target Django deployment, Vercel configuration, domain approval and visual/browser QA remain to be verified.

Changes and older milestones are recorded in [CHANGELOG.md](CHANGELOG.md). Community submissions are deferred to the roadmap and are **not** available in the current frontend.
