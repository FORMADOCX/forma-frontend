# FORMA Backend v0.5 — frontend contract

## New route

`POST /api/v1/submissions/` — `multipart/form-data`, no authentication requirement when enabled. No public list, detail, file fetch, or status lookup endpoints.

| Field | Required | Validation |
| --- | --- | --- |
| `title` | yes | trimmed nonempty string, max 240 characters |
| `description` | yes | trimmed nonempty string, max 5000 characters |
| `author_name` | yes | trimmed nonempty string, max 160 characters |
| `author_email` | yes | syntactically valid email, max 254 characters, stored privately |
| `portfolio_url` | no | optional valid URL, max 500 characters |
| `category` | no | slug of **published** category, max 160 characters |
| `suggested_category` | no | free-text suggestion, max 160 characters |
| `file` | yes | exactly one DOCX/XLSX/PDF, 1 byte up to `MAX_DOCUMENT_BYTES` (default 20 MiB); checked against actual byte structure |

Do not submit `status`, `template`, `template_id`, `id`, `security_status`, or `moderator`. Unknown input fields are ignored by the serializer and cannot change server-owned fields.

### Responses

- **202 Accepted**: `{ "id": "<uuid>", "status": "quarantined" }`. The ID is a non-secret receipt only, not a public tracking capability. No author email or private file keys.
- **400 Bad Request**: DRF field-validation errors, such as `{ "file": ["Unsupported format: use DOCX, XLSX or PDF."] }`.
- **413 Request Entity Too Large**: may be returned by reverse proxy before Django when the whole request exceeds its configured body limit; Django's per-file validation normally returns 400.
- **429 Too Many Requests**: scoped `submissions` throttle; default `3/hour` per anonymous client as seen by Django. **DRF throttle is best-effort**, not a distributed abuse-prevention boundary; deploy a reverse-proxy/WAF rate limit and configure trusted proxy headers correctly.
- **503 Service Unavailable**: feature disabled, `{ "detail": "Community submissions are currently unavailable." }`.

### Availability / flag

Default is **OFF** in both Windows local and production. `FORMA_PUBLIC_SUBMISSIONS_ENABLED=true` takes effect **only** if `FORMA_ENV=production` and `FORMA_SUBMISSIONS_ISOLATED_SCANNER=true`. Neither flag substitutes for actually deploying isolated workers, antivirus and network protections. Windows local always rejects public intake with 503 even when the flag is set.

### Frontend behavior

Use a real multipart form. Present 503 as "Community submissions are temporarily unavailable" and do not promise publication. A 202 means "received in private quarantine", **not** scanned, approved or published. There is no pollable status API. Existing catalogue, template detail, quick preview, preview images and download APIs are unchanged.
