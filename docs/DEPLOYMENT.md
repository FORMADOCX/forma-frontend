# Deploying FORMA Frontend to Vercel

This guide describes the **current Next.js source**. It is not a claim that the project has already passed a Vercel production rollout.

## Prerequisites

- Access to the `FORMADOCX/forma-frontend` repository and a Vercel project with the Next.js framework preset.
- A deployed Django REST API accessible to the Next.js server and, for previews/downloads, to visitors over HTTPS.
- An approved frontend domain, working DNS and TLS; approved backend HTTPS domain.
- Django configured for the expected hostnames and secure proxy settings. Backend publishing, storage and download permissions remain managed by Django.

## Configure the Vercel project

1. Import the GitHub repository as a Next.js project. The repository root is the frontend app; the build script is `npm run build` and dependencies install via `npm ci` using the checked-in lockfile.
2. Set variables in Vercel Project Settings → Environment Variables for each deployment environment:

   | Name | Example only | Purpose |
   | --- | --- | --- |
   | `FORMA_API_URL` | `https://api.example.org` | Server-to-server Django origin (may differ from browser origin when network access permits). |
   | `NEXT_PUBLIC_API_URL` | `https://api.example.org` | Browser-visible **HTTPS** origin for document previews and downloads. |
   | `NEXT_PUBLIC_SITE_URL` | `https://www.example.org` | Optional canonical / Open Graph frontend origin after domain approval. |
   | `FORMA_ENABLE_INDEXING` | `false` | Reserved; indexing is forcibly disabled in the current code. |

   The values above are documentation placeholders, not live FORMA domains. No variable should include `/api/v1`, credentials, secrets or storage object URLs. Never put secrets in `NEXT_PUBLIC_*`.
3. Confirm the frontend deployment can reach the backend at `FORMA_API_URL`. A private backend URL works only if the Vercel execution environment actually has network access to it; local Docker service names and `127.0.0.1` ordinarily do **not** work on Vercel.
4. Deploy, then configure the approved custom domain and HTTPS in Vercel. Update `NEXT_PUBLIC_SITE_URL` to its verified HTTPS origin when approved and redeploy.

## Backend access and document URLs

The backend must serve its existing `/api/v1/` routes under the configured origin. Document previews and downloads should use the controlled Django endpoints; do not point the frontend to private S3/R2 object URLs. Django must independently enforce Admin-Only Publishing, deny unpublished files and retain secure file delivery.

The frontend validates document URL paths and allowed origins. The Next.js image optimizer is configured for the verified public backend host. Before release, test images and downloads from an actual browser on the deployed frontend, including missing previews, 403, 404 and 503 responses. Browser CORS requirements should be checked against the actual direct-browser requests; do not enable broad origins by assumption.

## Pre-release checks

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run check:structure
npm run build
npm audit --omit=dev
```

With Django running, verify the English and Ukrainian catalogues, filters, search, CMS header/footer visibility, Quick Preview, detail-page gallery, and the browser download flow. Verify `/submit` and `/uk/submit` return HTTP 404 and do not appear in navigation or sitemap. Check the generated HTML and network requests for private hostnames and storage URLs.

Keep search indexing disabled: `src/lib/seo.ts` currently sets `indexingEnabled = false`; setting the environment flag to true does not enable indexing. A separate reviewed SEO release must precede public indexing.

## Operations and rollback

Use Vercel deployment history for a rollback if a deployment breaks the frontend. Monitor response failures and missing resources; assess backend reachability independently. Deploy backend and frontend independently and verify API DTO compatibility before promoting changes.

See [Architecture](ARCHITECTURE.md) and [README](../README.md).
