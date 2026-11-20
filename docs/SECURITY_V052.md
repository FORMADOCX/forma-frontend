# FORMA Frontend v0.5.2 — Dependency security assessment

Date: 2026-11-18. Status: **OPEN / UNVERIFIED**, not a security fix.

## Evidence and scope

- The user reports from a Windows installation: `npm install`: **15 issues (1 moderate, 14 high)**; `npm audit --omit=dev`: **2 (1 moderate, 1 high)**; resolved Next.js **15.5.29**. These are **user-supplied aggregate results**, not a package-level audit report.
- The provided v0.5.1 ZIP contains `package.json` **without `package-lock.json` or `node_modules`**. Direct runtime dependencies are `next`, `react`, `react-dom`; ESLint, TS and their configs/types are dev dependencies. Exact transitive packages and vulnerable paths cannot be reconstructed reliably from semver ranges.
- On this execution environment, `npm install --package-lock-only --ignore-scripts --no-audit --fetch-retries=0 --fetch-timeout=8000` failed with `EAI_AGAIN` (registry.npmjs.org), so a genuine dependency tree cannot be generated. `npm audit` and `npm audit --omit=dev` require a lockfile and cannot produce vulnerability counts here.
- A *difference* of 13 between full and production audits suggests dev-only nodes contribute reports, but **does not prove exactly which advisory or transitive route belongs to each group**. The two production reports remain outstanding.

## PostCSS research (public upstream advisories; applicability NOT verified for this install)

| Advisory | Upstream affected versions | Upstream first patched | Concern |
|---|---|---|---|
| [GHSA-qx2v-qp2m-jg93](https://github.com/postcss/postcss/security/advisories/GHSA-qx2v-qp2m-jg93) | `<8.5.10` | `8.5.10` | Unsafe `</style>` serialization when embedding influenced CSS into HTML (moderate) |
| [GHSA-6g55-p6wh-862q](https://github.com/postcss/postcss/security/advisories/GHSA-6g55-p6wh-862q) | `<=8.5.11` | `8.5.12` | Untrusted source-map URL may expose filesystem content (high) |
| [GHSA-r28c-9q8g-f849](https://github.com/postcss/postcss/security/advisories/GHSA-r28c-9q8g-f849) | `<=8.5.17` | `8.5.18` | Path traversal may expose `.map` files (high) |
| [GHSA-fxqj-rqcc-2cmp](https://github.com/postcss/postcss/security/advisories/GHSA-fxqj-rqcc-2cmp) | `<=8.5.22` | `8.5.23` | Incomplete source-map fix when `from` unset (moderate) |

The listed versions are **per-advisory first fixed versions**, not a recommendation to pin 8.5.23 as globally safe against later advisories. Review all newer notices for the exact selected version.

Next.js can ship a compiled/vendored PostCSS implementation (for example within `next/dist/compiled/postcss`), distinct from npm's separately installed `node_modules/postcss`. npm `overrides` only applies to package-manager dependency resolution; it does **not** replace a vendored compiled bundle. Do not assume an override fixes both. Package `postcss` is not a direct dependency in this project's manifest. We therefore **did not add unverified overrides or major upgrades**. Do not edit compiled Next.js internals or hide advisories via audit config.

## Follow-up on an environment with registry access

```powershell
npm install
npm ls next postcss autoprefixer --all > dependency-tree.txt
npm audit --json > audit-report.json
npm audit --omit=dev --json > audit-production.json
node -p "require('next/package.json').version"
node -p "require.resolve('next/dist/compiled/postcss')"
npm run typecheck
npm run lint
npm test
npm run build
```

Review `audit-report.json` vulnerabilities entries (`via`, `range`, `nodes`, `fixAvailable`) and correlate them with `dependency-tree.txt`; identify reachable runtime paths versus build-only tooling and any Next.js vendored code. Do not assume `npm audit --omit=dev` is a complete runtime threat model (Next.js builds can use dev dependencies). If a compatible, patched minor/patch update exists, change versions one at a time, create and commit the new lockfile, then re-run all commands and browser regression tests. Use `npm overrides` **only after** confirming the installed path and upstream peer/ABI compatibility; test built CSS and sourcemaps. Do **not** run `npm audit fix --force`.

## Contingent major-migration plan

If no safe patch exists on Next.js 15: assess Next.js 16 migration **separately**, including Node version requirements, React compatibility, Next config changes, ESLint behavior, routing, CSS pipeline, server/client API boundary, image optimizer and Vercel configuration. Use a branch and clean lockfile, run lint/typecheck/tests/build, and perform browser E2E for EN/UK, catalogue, Quick Preview, gallery, file downloads and submissions (including 503). Compare audit results and deployment behavior before approving rollout. **No Next.js 16 migration was performed in v0.5.2.**
