# FORMA mobile UX

Mobile navigation appears at viewport widths up to 767px: Home, Templates, Search. Next.js `usePathname` determines the active destination and `Link` preserves SPA navigation. The mobile header menu retains Categories and CMS links; it does not duplicate bottom navigation destinations.

Catalog filters reuse `CatalogFilters`, `applyCatalogFilters` and `catalogHref`, with a native `dialog.showModal()` styled as a bottom sheet. The URL remains the source of truth for filters and browser history. The desktop filter sidebar is unchanged. Native modal behavior supplies backdrop/inert background and Escape semantics.

DocumentGallery and DocumentLightbox use existing backend PNG sources; the mobile layout places the title above the full document without introducing new image assets. The main card link opens Template Detail.

QA checklist: 320/375/390/430/768px and desktop 1440px, iOS home-indicator safe area, keyboard navigation, bottom-sheet focus restore, browser back/forward, EN/UK, downloadable files, and absent horizontal overflow. This checklist is **not** a claim that browser QA was executed.

Vercel: deploy the same Next.js repository with existing environment variables; do not change the current staging URL, backend API origin, or noindex flag. Verify with a preview deployment first. Rollback: redeploy the previous Vercel deployment or restore the previous frontend ZIP; keep environment settings unchanged.
