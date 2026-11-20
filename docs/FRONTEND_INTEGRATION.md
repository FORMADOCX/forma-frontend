# FORMA frontend ↔ backend contract (v0.2)

Base URL: `${NEXT_PUBLIC_API_URL}/api/v1` (configure independently per environment). All endpoints are anonymous GET, JSON only. No download or preview URLs exist at this stage.

## Endpoints

| Method | Path | Response |
|---|---|---|
| GET | `/health/` | `{status, database}` |
| GET | `/categories/` | paginated category summaries including description/SEO |
| GET | `/categories/{slug}/` | category detail |
| GET | `/templates/` | paginated lightweight list items |
| GET | `/templates/{slug}/quick-preview/` | limited Quick Preview DTO |
| GET | `/templates/{slug}/` | complete text metadata/detail DTO |

## Query parameters

- `lang=en|uk` (default en). If a translation does not exist, the API uses EN translation or internal editorial EN field and returns the actual language as `language`. Do not infer actual locale from request.
- `page` (1-based), `page_size` (default 20, max 100); list envelope `{count,next,previous,results}`.
- Templates only: `category={slug}` matches the category and its descendants **only if the full category ancestry is published**. Unknown/non-public slug returns an empty result set.
- Templates only: `q={text}` searches localized and EN fields, case-insensitive (maximum 120 characters).
- Templates only: `sort=newest|oldest|title|-title`; default newest. **Title sorting currently uses internal English editorial title**, even for `lang=uk`.

## Data shapes

Category: `{id, slug, name, description, language, parent_slug, seo}`.
Template list item: `{id, slug, title, summary, language, published_at, categories:[{slug,name}]}`.
Quick Preview: list item + `license_code`.
Template Detail: Quick Preview + `description`, `attributes:[{code,label,data_type,value}]`, `seo`.
SEO: `{title,description,canonical,og_title,og_description,index}` or `null`. Empty values are meaningful: frontend must not invent canonical URLs from an empty API value without using its own canonical routing rules.

Do not use DTO shape inference from model fields. No private storage paths, documents, file download URLs, or image preview URLs are returned in v0.2.

Response HTTP: 200 for successful GET, 400 for invalid `lang`, `q`, `sort`, 404 for invisible/missing details or invalid page, 405 for unsupported write verbs. `/health/` may respond 503.

## Publication and caching

The public list/detail query only reads templates with `status=published` and a non-future non-null `published_at`. Category queries only read published categories with published ancestors; templates do not return unpublished category associations. Editorial fields are fallback text only when translations are missing; publication of incomplete translations must be addressed by a future editorial validation workflow.

`/api/v1/openapi/` is the runtime-generated schema; the checked-in `openapi.yaml` is a manually authored v0.2 contract pending generation/verification when Python dependencies and PostgreSQL are available. Before treating it as canonical, run `python manage.py spectacular --file openapi.yaml --validate`, review its diff and run API contract tests.

## API compatibility policy

Keep `/api/v1` additive unless a breaking change is documented and coordinated with frontend. Newly added fields should be optional to consumers. Never assume a preview/download URL exists unless the backend actually serves it.
