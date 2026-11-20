# FORMA — Технічне завдання (MVP → production)

**Версія:** 1.0, 2026-11-18 · **Мова специфікації:** українська · **Мови продукту:** EN default, UK additional.  
**Принцип:** технічна основа має бути production-ready, функції поза MVP не будувати завчасно.

## 0. Початкова точка (перевірено в наявному архіві)

Поточний `forma-mvp-complete.zip` містить статичний `FORMA/index.html`, 6 файлів у `templates/` (5 DOCX, 1 XLSX), 6 растрових прев’ю `assets/*.webp`. Є клієнтські фільтри та пошук, drawer для швидкого перегляду, локальне додавання через IndexedDB та localStorage. Немає серверних записів, авторизації, production CMS, модерації або приватного object storage. Оригінали у папці `templates/` доступні як статичні файли. Сайт потрібно перевести на сучасну серверну архітектуру. Поточний стиль і UI зберігати як референс, але не копіювати код без ревізії.

## 1. Функціональний scope

### 1.1 Сторінки/маршрути (приклад; домен TBD)

| Сторінка | EN URL | UK URL | Indexing |
|---|---|---|---|
| Home | `/` або `/en` | `/uk` | yes |
| All templates | `/templates` | `/uk/templates` | yes |
| Category | `/categories/{slug}` | `/uk/categories/{slug}` | yes, published |
| Detail | `/templates/{slug}` | `/uk/templates/{slug}` | yes, published |
| Search | `/search?q=` | `/uk/search?q=` | `noindex,follow` за замовчуванням |
| Submit | `/submit` | `/uk/submit` | optional index |
| Static page | `/{slug}` | `/uk/{slug}` | per-page configurable |
| Admin | `/admin/*` | same | authenticated, noindex |

**Вибір URL-політики зафіксувати до релізу:** EN без префікса + UK `/uk/`, з можливістю подальших `/de/`, `/pl/` тощо; route collisions вирішувати reserved routes. Альтернатива — `/en/` і `/uk/` для всіх, простіше у підтримці. Зміна після релізу потребує 301.

### 1.2 Home
- H1 + короткий value proposition (без великого декоративного hero); prominent пошук.
- Навігація: All Templates, категорії, Submit Template, перемикач мови.
- Curated collections: featured / recent / popular (поля в CMS; popular тільки на основі реальних подій).
- Блок основних категорій, необов’язковий редакційний SEO-текст.

### 1.3 Каталог All Templates
- Grid 3–4 columns desktop, 2 tablet, 1–2 mobile залежно від ширини.
- Картка: реальне зображення прев’ю, назва, короткий опис, формат(и), без зайвих badges.
- Пошук, фільтри (category, format, purpose, style, free/paid у майбутньому), сортування (newest, alphabetical, popularity якщо вимірюється).
- Керована пагінація з crawlable links, мінімум URL-станів із query params. Empty state.
- Filter state відображається в URL для shareability; правила canonical/noindex/robots для фасетів окремо.

### 1.4 Category
- Назва, intro, full SEO body, optional parent/children, count, list of published templates.
- Breadcrumbs, related categories; title/meta/OG fields locale-specific.
- До шаблону можна прив’язати багато категорій, одна primary category (для breadcrumbs та навігації).
- Вкладені категорії підтримати в моделі, але не вимагати глибокого дерева в першому UI.

### 1.5 Template detail
- Власний SSR URL, title, short summary, повноформатна preview gallery із реального документа.
- Primary action Download; альтернативні формати з окремими файлами, якщо є.
- Що всередині, use cases, how to edit, formats, page count/sheet count коли відомо, author name + portfolio, license, last updated.
- Категорії, атрибути, related templates (ручна добірка з автоматичним fallback за tag/category).
- SEO fields та текст окремо для кожної локалі. Немає автоматичного дублювання перекладу без позначення.
- Відповідні файли мають бути готові й перевірені до publish.

### 1.6 Quick Preview
- Запуск із каталогу, не окрема SEO-сторінка.
- Тільки: назва, 1 головне реальне preview (можливо 2–3 слайди), короткий опис, formats, View full details, Download.
- Немає повного опису, SEO-статей, авторської біографії чи довгих специфікацій.
- `Esc` закриває, focus trap, повернення фокуса, підтримка клавіатури, mobile drawer/modal.

### 1.7 Search
- MVP: indexed full-text за locale в PostgreSQL або Typesense/Meilisearch за потреби; пошук title, subtitle, tags, category, description; tolerant до помилок.
- Повертає тільки published + доступні до завантаження елементи. `q` нормалізувати й обмежити.
- Для користувача: стан loading, zero results, filters, pagination. Аналітика no-results із захистом приватності.

### 1.8 Submit by user
- Публічна форма: title, summary, category (suggested), tags, format/file, language of document, creator/display name, email, portfolio URL(s), license/rights confirmation, consent to terms, optional notes.
- Email verification + anti-spam (honeypot/rate limit/captcha за ризиком); подавач не може безпосередньо publish.
- Файл потрапляє до quarantine private bucket, запис `pending_scan` → `pending_review`; metadata sanitize.
- Форма повертає confirmation ID; status by secure one-time/magic link (можна відкласти до MVP+). Confirmation email без розкриття приватних URL.
- При rejected: внутрішня причина + optional public-safe повідомлення автору; при approved: редактор може правити метадані й локалізувати перед publish.

## 2. Адмінка (мінімальна за UI, повна за контролем)

Варіант: **Payload CMS + Next.js + PostgreSQL** (рекомендований кандидат) або Directus + окремий Next.js frontend. Остаточний вибір після PoC file pipeline, auth і локалізації. Не писати власну CMS з нуля.

### Collections
- Templates: title, slug, summary, content, SEO, status, categories/tags/attributes, files, previews, author, related templates, timestamps, publish scheduling optional.
- Categories: parent, slug, localized title/description/SEO, order, image optional, publication status.
- Attributes: definitions/types/options (format, use case, style, audience, orientation, application); editable labels per locale, stable machine keys; show in filters per category.
- Static Pages: page builder обмеженими типами блоків (text, image, FAQ text, CTA), localized SEO.
- Submissions: immutable original metadata/file linkage, submission status, reviewer, notes, rejection reason, audit history.
- Authors: name, links, consent, verification status; public profile — опційно пізніше.
- SEO Settings: global defaults, organization, social cards, redirects, indexability rules, sitemap exclusions.
- Media/Files: private original, sanitized/rendered preview references, versions, checksums, scan flags.
- Users/Roles: admin, editor/moderator, author/submitter external (без CMS-доступу у MVP).

### Адмін-процеси
- Draft → Review → Published → Archived, окремо від Submission Pending/Rejected/Approved.
- Редактор бачить scan status, зображення документу, метадані, категорії та rights checkbox.
- Approve не означає auto-publish: після approve створити/оновити draft і натиснути Publish окремо. Якщо хочеться однокнопкового approve+publish, тільки після проходження всіх обов’язкових перевірок.
- Unpublish: одразу зняти з каталогу, пошуку, sitemap, відкликати нові download links. Врахувати кеш CDN та чинні signed URLs.
- Audit log: хто, коли й що змінив; soft-delete/version rollback для контенту.

## 3. Дані та зв’язки

```text
User (admin/editor) 1 ─── * AuditLog
Author             1 ─── * Template
Author             1 ─── * Submission
Template          * ─── * Category   (TemplateCategory with is_primary)
Category           1 ─── * Category   (parent-child)
Template          * ─── * Tag
Template          1 ─── * TemplateFile  (format + variant + language)
TemplateFile      1 ─── * PreviewAsset (page/order/size)
Template          * ─── * AttributeValue (facet index)
Template          1 ─── * TemplateTranslation (locale)
Category          1 ─── * CategoryTranslation (locale)
StaticPage        1 ─── * PageTranslation (locale)
Submission        0..1 ─ Template  (after approval)
Template          * ─── * Template    (related)
```

### Ключові поля

| Entity | Required fields |
|---|---|
| Template | `id`, `status`, `slug`, `primaryCategoryId`, `authorId?`, `licenseCode`, `publishedAt?`, `updatedAt` |
| TemplateTranslation | `templateId`, `locale`, `title`, `summary`, `body`, `seoTitle?`, `seoDescription?`, `ogImage?`, `translationStatus` |
| TemplateFile | `id`, `templateId`, `privateObjectKey`, `originalFilename`, `mimeVerified`, `size`, `sha256`, `format`, `language?`, `scanStatus`, `renderStatus`, `version` |
| Category | `id`, `parentId?`, `slug`, `status`, `sortOrder` |
| AttributeDefinition | `key`, `dataType`, `isFilterable`, `isMultiselect`, `categoryScope?`, `options`, `sortOrder` |
| Submission | `id`, `status`, `emailVerifiedAt?`, `submittedBy`, `portfolioLinks[]`, `fileId`, `reviewedBy?`, `reviewedAt?`, `reason?` |
| PageTranslation | `pageId`, `locale`, `title`, `bodyBlocks`, `seoTitle?`, `seoDescription?`, `indexable` |

**Invariant:** Template cannot publish without at least one clean, downloadable file and generated real preview; published locale requires translated title + summary + unique SEO title when editorially appropriate. `slug` unique within locale+entity route; redirect old slug after change.

### Locales
- `Locale(code, name, active, isDefault, routePrefix)` з UI словниками на основі message keys.
- EN primary, UK activated. Додавання `de`/`pl` пізніше — через додавання locale + переклад UI + редакційних полів, без зміни DB schema.
- UI може fallback на EN; content only published per locale. Не видавати EN контент за UK (і не додавати UK hreflang, якщо переклад сторінки не опубліковано).

## 4. Архітектура та безпека файлів

### Рекомендований стек (пропозиція)
- Frontend: Next.js (TypeScript), React, SSR/ISR.
- CMS/Admin: Payload CMS, інтегрована з PostgreSQL (або Directus як альтернатива).
- DB: managed PostgreSQL, міграції/schema review.
- Files: private S3-compatible object storage (наприклад Cloudflare R2 / AWS S3), **public ACL off**, окремі quarantine/originals/preview paths.
- Worker queue: background jobs для scan/render/thumbnail/search index update; retries + dead-letter.
- Preview renderer: ізольовані контейнери (LibreOffice headless для Office файлів, PDF rasterization), обмеження CPU/time/memory, без інтернет-доступу і без привілейованого filesystem.
- Search: PostgreSQL FTS для MVP, надалі dedicated engine якщо якість або масштаб вимагають.
- Analytics: privacy-respecting event capture, Search Console; error tracking.

### Upload pipeline
```text
Submit -> validate form + auth/rate limits
       -> issue short-lived upload authorization
       -> quarantine private object
       -> verify MIME signature, extension, size, checksum
       -> AV scan + safe unpack/complexity limits
       -> isolated preview rendering -> sanitized public WEBP/AVIF previews
       -> moderation queue
       -> approved -> editorial draft -> publish
       -> signed download (controlled endpoint)
```
- `DOCX`, `XLSX`, `PDF` allowlist first; do **not** allow arbitrary `HTML`, executable files or macro-enabled Office documents in MVP.
- Validate extension, MIME, file magic where possible; enforce quotas, antivirus, ZIP/decompression bounds, filenames normalized, remove unsafe metadata in exposed assets.
- Public preview assets may be cached/CDN, **never** serve raw private originals through publicly enumerable paths.
- Download endpoint checks published status, increments counter (privacy conscious), issues short-lived signed URL. «Недоступні для юзера» інтерпретуємо як «немає прямого відкритого доступу до файлового сховища». Файли, які користувач має завантажити, фізично можна отримати після дозволеного download; DRM немає.
- Separate permissions for moderators, editors, system workers; secret keys server-side only.
- CSRF/XSS/SQLi protection, upload rate limits, RBAC, 2FA для адмінів, encrypted transport, backup + restore testing, audit.
- OWASP baseline: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html

## 5. SEO: налаштування й редагування з CMS

### Глобальні правила
- SSR/SSG HTML для Home/Category/Detail/Static, чисті server HTML links; Core Web Vitals performance budgets (target LCP <=2.5s, INP <=200ms, CLS <=0.1 at p75 real-user when feasible).
- Unique title/description, OG title/description/image, canonical per locale, single H1, breadcrumbs, robots meta; fallbacks configurable.
- XML sitemap per locale/type, only indexable published canonical URLs; `lastmod` only on meaningful changes.
- `hreflang=en`, `uk` and `x-default` for existing reciprocal localized equivalents; self-canonical per language.
- Search and filter parameter URLs default `noindex`; for large facet combinations prevent crawl explosion using policy, only curated filter landing pages can be indexed.
- HTTP 404 for removed missing items; 410 for permanently deleted as appropriate, 301 old slugs, avoid redirect chains.
- JSON-LD: `Organization` / `WebSite` site-level, `BreadcrumbList` on hierarchical pages, `CreativeWork` or `DigitalDocument` if meaningful and valid; never fake review/rating/FAQ rich-result guarantees.
- Images: responsive WebP/AVIF, width/height, alt derived from actual preview, lazy load below fold; previews visually faithful to source file.

### CMS SEO fields
- `seoTitle`, `metaDescription`, `canonicalOverride` (admin-only with warning), `ogImage`, `ogTitle`, `ogDescription`, `indexable`, `follow`, `structuredDataOverride?` (expert-only), `slug`, `redirects`.
- SERP preview, character-count **guidance not hard limits**, duplicate-slug/title warnings, missing translation warnings, robots/sitemap preview.
- Global templates by entity type and locale (e.g. `%template_title% — Free Download | %brand%`).
- Editorial fields: category intro/body, template short/long description, use-cases, how-to, related links, FAQ content only if useful.

### Acceptance SEO tests
- For every published URL: response 200 server-rendered HTML, exactly one canonical, valid hreflang only for live languages, correct meta, no blocked assets.
- Sitemap contains no pending/rejected/draft or filter search URLs.
- Refresh/copy direct detail URL works; preview modal opening does not replace canonical detail page.
- Pagination has discoverable links; slug change yields 301.
- Search Console sitemap submission/monitoring checklist included in release.

## 6. API contracts (illustrative)

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/templates` | GET | public | published search/filter/pagination |
| `/api/templates/{slug}` | GET | public | published detail, locale |
| `/api/templates/{id}/download` | POST | public + throttled | signed short-lived download |
| `/api/submissions` | POST | verified email/token | create pending submission |
| `/api/submissions/{id}/upload` | POST | scoped token | short-lived upload auth |
| `/api/admin/submissions` | GET | moderator | review queue |
| `/api/admin/submissions/{id}/decision` | POST | moderator | approve/reject, audit |
| `/api/admin/templates/{id}/publish` | POST | editor | publish after checks |

API responses must not return private storage keys, private review notes, submitter email to public, or presigned URLs outside appropriate download flow.

## 7. Accessibility, design, UX

- **Typeface:** one font family site-wide, consistent font weight/size scale; avoid novelty display/mono mix. Suggested Inter or system-ui (decision by design QA).
- Neutrals dominate. One primary accent color, e.g. deep green `#38634D` (illustrative only), used for a thin header stripe, current nav indicator, links/focus and tiny details. **No color-filled badge storm, unnecessary pills, huge CTAs, artificial labels.**
- Layout: compact editorial catalog, stable side navigation or category bar, tight previews; whitespace and typographic hierarchy rather than decoration.
- File card = real rendered preview; correct aspect ratio, soft neutral frame, no synthetic lookalikes.
- Keyboard flow, semantic buttons/links, WCAG 2.2 AA intent, visible focus, proper labels/contrast, reduced-motion handling.
- Modal is accessible dialog; direct page URL always exists.
- Mobile nav/search/filter interactions fully supported.

## 8. Performance, observability, operations

- Server rendering/ISR cache invalidation on publish/unpublish; cache keys include locale.
- Thumbnail generation asynchronous; placeholder shown only in CMS, public publish blocked until preview ready.
- Optimize previews, CDN caching, avoid loading entire documents on catalog pages.
- Structured application logs, errors, background job health, failed scan alerts, DB backups, incident checklist.
- Separate dev/staging/prod; secrets never committed, migrations reviewed, automatic security updates and backup restore drills.
- GDPR/privacy and cookie consent approach depends on analytics choices and jurisdiction; privacy policy before launch.

## 9. Test plan & Definition of Done

### Functional acceptance
1. Admin creates category + translation + SEO; live page at canonical URL.
2. Admin creates template with 2 categories, primary category, attributes, DOCX file; renderer creates preview from that file; page only publishes after scan/render success.
3. User opens quick preview: concise data only; View Details opens dedicated SEO page.
4. User downloads published template; blocked if unpublished; original object key not exposed.
5. Visitor uploads template + portfolio; appears pending only in admin; never public before approval and publish.
6. Moderator rejects template; email/status reflects rejection; file no longer eligible for public download.
7. Moderator approves; editor reviews and publishes; cache/sitemap/search update.
8. Admin creates static page with English/Ukrainian SEO fields; hreflang correct only when both published.
9. Filter/search only returns published; no duplicate indexable facet URLs.
10. Any template page direct URL works after refresh; valid 404 for unknown slug.

### Security/quality acceptance
- Automated tests for unauthorized admin access, wrong-role decisions, malicious file names, disallowed extensions, size violations, AV pipeline failure, double publish/races, signed URL expiry, XSS in descriptions/links, redirect safety, rate limits.
- End-to-end tests desktop and mobile, English/Ukrainian, keyboard-only flow, network failures.
- SEO crawler audit, structured data validation, Lighthouse + RUM targets, dependency vulnerability scan, manual editorial QA of every preview.

## 10. Tasks and phases

**P0 Foundation:** app shell, one design system, CMS model, DB migrations, roles/auth, locales, real previews, object storage, admin publish workflow.  
**P0 Public:** pages, search/filter, quick preview, download, submit/moderation, SEO/analytics.  
**P0 Launch:** 20–30 quality documents, legal pages, responsive/a11y, redirects, monitoring, security review, staging and prod.  
**P1 Later:** profile pages, saved templates, email updates, advanced search, author dashboard, paid templates, AI assistant.

## 11. Decisions required before implementation

- Name/domain and one accent color.
- Exact stack (Payload vs Directus), hosting provider and storage provider.
- Primary locale URL policy: `/` EN vs `/en` EN.
- Acceptable formats and max upload size.
- Whether user account or verified email only is required for submission.
- Legal license model and copyright complaint process.
- Allowed file sizes/pages and monthly infra budget.
- Whether the initial launch can be only EN content with UK UI vs fully localized 6–30 template details. **Recommendation:** fully localized key landing pages; only translate document detail when editorially complete.
