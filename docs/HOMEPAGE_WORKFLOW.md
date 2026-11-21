# Homepage workflow design refresh

## Research direction
- [Notion Template Gallery](https://www.notion.com/blog/new-notion-template-gallery): use discovery-oriented copy and clarity around the template journey rather than generic feature tiles.
- [Framer Marketplace](https://www.framer.com/marketplace/templates/): favor quick access to actual templates and visible next actions.
- [Linear](https://linear.app/method/manage-design-projects): use readable visual hierarchy and purposeful, structured copy rather than decorative graphics.

These are inspiration references, not copied assets, layouts, or endorsements.

## Implementation
The sole affected homepage section is `.home-how`. It uses a two-column editorial panel with distinct typographic introduction and an ordered three-row journey. The CTA navigates to the existing localized `/templates` route. Existing Django API, gallery, Quick Preview, Hero artwork, global tokens and metadata are unchanged. No fake document previews or made-up product metrics are introduced.

## QA
Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run check:structure`, `npm run build`. Check viewport widths 390, 768, 1440px and EN/UK on Vercel preview. Browser review is required for actual visual approval.
