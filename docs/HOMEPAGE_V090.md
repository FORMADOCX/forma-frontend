# Homepage v0.9.0 — Integration and QA

## Data and rendering

- App Router server component `HomePage` uses `Promise.allSettled` to isolate category and template request errors. Requests share existing `read()` with Next.js `revalidate: 60` and API origins. Failures are logged with error type only; unavailable sections do not display fabricated data.
- Categories: `GET /api/v1/categories/?homepage=true&lang=en|uk&page=1&page_size=100`, follow `next` pagination, preserve API order, require `show_on_homepage === true`, deduplicate by category ID. Icon identifiers come from a closed 16-name registry. Unknown/empty icons simply leave the text card without an icon. No client-provided markup is executed.
- Templates: `GET /api/v1/templates/?lang=en|uk&page=1&page_size=8&sort=newest`. Until a real backend featured flag exists, first four distinct records are placed under Featured. Remaining four fill Recently Added only if all four exist, else hide the section. These are not CMS editorial selections. Cover previews/Quick Preview continue through existing backend URL validation and components.
- No SEO pages created; existing canonical, locale hreflang and staging noindex remain unchanged. `SearchForm` still submits to localized `/search` with `q`.

## Known limitations

1. Backend v0.8.5-document-variants-hotfix3's live categories response could not be verified here. Verify `homepage=true`, `show_on_homepage` and localization on staging before deploying. No categories displayed when the field is omitted; that's intentional.
2. The category icon registry is an explicit local Lucide-style SVG implementation, not imported `lucide-react` components: no new package was added because npm registry is unavailable. For exact official Lucide components, add `lucide-react` with a normal package-lock update before release.
3. No confirmed editorial `is_featured`/featured order in the frontend TemplateList DTO. Replace the fallback when backend exposes that field; do not claim CMS curation until then.
4. A maximum of 100 pages of category results is processed as a defensive cap; excess pagination returns an error, not a partial misleading list.
5. Browser E2E, Core Web Vitals and deployment pipeline remain pending until dependencies/browser connectivity are available.

## Vercel deployment and rollback

1. Extract the full archive into a clean frontend workspace and install with `npm ci`.
2. Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run check:structure`, `npm run build`.
3. Create a Vercel Preview deployment with existing `FORMA_API_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, indexing disabled. Do not use `formadocx.com` yet.
4. In Django Admin enable `show_on_homepage` for selected published EN/UK categories, choose valid `icon` values, then verify category order, URLs and 60-second cache revalidation.
5. Test 320, 375, 390, 430, 768, 1024 and 1440 px; verify template card previews, Quick Preview, downloads and language switch; test empty categories, 4 vs 8 published documents, API failures, accessibility and no horizontal overflow.
6. Roll back by redeploying the previous verified v0.8.9 Vercel deployment. No migrations or backend changes are introduced.
