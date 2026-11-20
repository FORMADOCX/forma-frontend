# Quick Preview image fix (v0.3.1)

Root cause: `QuickPreview` is a browser-side Client Component. The configured Django origin was held only in `FORMA_API_URL`, a server-only environment variable. `getPreviewSource` therefore returned `null` for valid Django preview URLs inside the dialog, while the server-rendered catalogue card displayed images.

Fix: the server-rendered `TemplateCard` passes the backend origin (public URL only; never credentials) as a prop to `QuickPreview`, which forwards it to `DocumentCover`. Preview URL validation still requires the configured backend origin and the approved Django preview path; local loopback still bypasses the Next image optimizer only in development.

After copying the project, preserve `.env.local` and restart `npm run dev`. Test the catalogue, modal and template detail page.
