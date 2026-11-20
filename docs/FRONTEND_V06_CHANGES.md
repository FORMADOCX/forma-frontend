# FORMA Frontend Integration — Backend v0.6

## Stability

All existing v0.5.2 catalogue, Quick Preview, Template Detail, downloads and submissions paths remain. No frontend changes are required until you use dynamic filters. Category slugs and template slugs are unchanged. `GET /api/v1/filters/` is new.

## Discover filters

`GET /api/v1/filters/?category=invoices&lang=en`

Example **illustrative** response (actual values/counts come from published catalogue data):

```json
{
  "language": "en",
  "filters": [
    {"key": "page-size", "type": "multi_select", "label": "Page size", "order": 10,
     "options": [{"value": "a4", "label": "A4", "count": 5},
                 {"value": "letter", "label": "US Letter", "count": 2}]}
  ]
}
```

Only active, visible, filterable and public attributes mapped to visible categories are included. An option appears only if at least one **published** template in that category/descendant scope has that value. Counts are per option, not counts after other selected filters. `lang=uk` returns UK labels if available, EN/internal labels otherwise. The `language` response field is the requested locale.

## Filter templates

`GET /api/v1/templates/?category=invoices&lang=en&format=docx&attr.page-size=a4,letter&attr.orientation=portrait&sort=newest&page=1&page_size=20`

- Dynamic query keys use `attr.<machine-key>` where `<machine-key>` is supplied by filters API.
- Values are comma-separated option machine values, **OR** within an attribute; **AND** between attributes. Boolean values are `true` or `false`.
- `format` is one of `docx`, `xlsx`, `pdf`, and requires a verified ready document; it does not simply search a title.
- Existing `category`, `q`, `sort` (`newest`, `oldest`, `title`, `-title`), `page`, `page_size` keep their behavior. Sorts are stable by primary key. Page size maximum is 100.
- Invalid attribute, inactive option, duplicate parameter, unsupported format, malformed value or oversized query returns **400** with DRF error payload. Missing page returns existing **404**. Limits: eight attributes, eight values per attribute, total encoded query string <= 2048 characters, each machine value <= 80 characters. Search `q` maximum 120 chars.
- Unknown/unpublished category returns an empty list. Neither hidden templates nor hidden categories/attributes may appear in counts or results.

## SEO / indexing

Filtered and searched URLs should be `noindex,follow` by default; do **not** include combinations in XML sitemap. Canonical should point to the clean published category or catalogue URL (or an explicitly editorially approved landing page), **not** the filter URL. A template's canonical is provided by its localized SEO metadata. EN is the default, UK can use `/uk/` as previously agreed. Frontend remains responsible for HTML metadata, hreflang, canonical tags and rendering. Do not generate indexed pages for every filter combination.

## Migration / CMS

Run `python manage.py migrate` to apply `catalog.0004_dynamic_filters`. Existing text/number/boolean attributes and template attribute values remain intact. Existing attributes are **not** exposed as filters until explicitly enabled (`is_filterable=True`) and mapped to categories. Create selection options with stable machine values and optional localized labels. Use standard Admin interfaces for category translations, SEO metadata, attribute labels, mappings and template values. Existing category slugs should not be edited after publication.

## Feature flags

No new feature flags. Community Submissions remains disabled by default in the existing local settings; never enable untrusted file intake without isolated scanning and conversion.
