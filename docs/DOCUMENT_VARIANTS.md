# Document variant selection — FORMA Frontend v0.8.9

## Current implementation

On the existing EN/UK Template Detail route (`/templates/[slug]`, `/uk/templates/[slug]`), the server loads the existing Django Template Detail response. The `TemplateDocumentSelection` client context connects two descendants without duplicating data requests:

- `DocumentDownloadSelector`: native, keyboard-accessible radio inputs for each available variant and each actual file, one controlled Download link, and the selected filename, format, and optional byte size.
- `SelectedDocumentGallery`: the existing DocumentGallery and DocumentLightbox, filtered by the selected file's authoritative `file_id` when page records are present. It does not render another file's pages as though they belonged to the selection.

No format/size route or SEO page has been added. The selection lives in React state; the primary template content, canonical, robots, hreflang, and existing JSON-LD remain server-rendered.

## Data contract and security

The optional `TemplateDetail.variants` array is consumed from the existing Template Detail endpoint, not a new API route. Each variant may supply `id`, `code`, `label`, `page_size`, `orientation`, `is_default`, and `files`. Files use the existing `DocumentFormat` contract: `id`, `format`, `filename`, `byte_size`, `download_url`. All these optional variant fields are treated conservatively because the actual deployed backend v0.8.5 JSON response could not be retrieved from this build environment. **Presence and exact names of the optional fields are not verified.** Do not rely on `is_default` until matched against the actual response.

- Only files containing the required identifier, format, filename, and a validated Django download URL are selectable.
- The server's existing `publicDjangoUrl` normalizes nested variant download URLs against both the configured internal Django origin and the allowed public origin. Foreign origins, missing/invalid routes and direct R2 URLs are rejected.
- The existing `getDownloadUrl` validates the exact `/api/v1/templates/{slug}/files/{file_id}/download/` route at the browser boundary.
- Selecting another variant preserves the previously selected format when available, otherwise chooses a real editable file (DOCX, XLSX) before PDF; stable API ordering breaks ties.
- If the backend explicitly supplies a recognized default flag (`is_default`), it wins; otherwise the first valid variant in the API's list is used.
- Technical placeholder values such as `unknown`, `not-applicable` and `default` are not printed as public option labels.
- When `variants` is absent or empty, legacy `formats` are used as one implicit variant; no new request is made.
- No raw private storage keys are exposed and there is no browser-side blob-download proxy.

## Known limitations / integration checklist

1. **Staging API contract is not verified in this environment.** Confirm the exact keys, identifier types, public/active filtering, default flag and preview-file association with Backend `v0.8.5-document-variants-hotfix2`. If backend uses another shape, adjust the DTO adapter to the real JSON rather than inventing attributes.
2. Preview switching uses `TemplateDetail.previews[].file_id`. If the backend sends only template-level previews with no trustworthy selected-file mapping, per-variant previews cannot be guaranteed; the UI displays an unavailable-preview state rather than a fake page. A minimal backend contract should expose the authoritative file ID for every preview page.
3. Native anchor downloads use Django's current controlled endpoint. Browser download failures (403/404/503) cannot be reliably intercepted or diagnosed by frontend code without a new fetch/proxy flow; a failed URL is never silently changed to another file. The backend must return appropriate status and user-safe errors.
4. Verify the four-file Studio Project Proposal fixture on staging (A4 DOCX/PDF and US Letter DOCX/PDF), plus one-file DOCX, one-file PDF, and XLSX-only records. Actual Django records were not modified.
5. Browser E2E, full Next.js production build and real HTTPS downloads remain to be confirmed after `npm ci` in a fully networked environment.

## Staging deployment and rollback

1. Keep the existing Vercel environment variables and staging `noindex` configuration; use separate internal/public Django origins as documented in `.env.example`.
2. Run `npm ci && npm run typecheck && npm run lint && npm test && npm run check:structure && npm run build` in a clean frontend checkout.
3. Push to a test branch and deploy a Vercel Preview Deployment. Verify selection, preview and download in EN and UK on desktop and mobile, including no missing PDFs and valid permission errors.
4. Promote to staging only after QA. To roll back, redeploy the previous passing v0.8.8 Vercel deployment (or restore its commit). No backend migrations, API changes or environment-variable changes are part of this frontend release.
