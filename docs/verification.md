# RIKT v0.1 local verification

Verified on October 15, 2026. This report records local verification before GitHub publication.

## Result

The static skeleton is implemented and locally verified. It is not deployed. The starting folder was empty and outside any Git repository; no existing project was overwritten. No Git repository, commit, remote repository, or hosting project was created.

## Environment

- Astro: 7.4.0, pinned with the dependency lockfile.
- Node.js: 24.19.0. Use the supported runtime before running npm commands.
- Astro CLI telemetry was disabled with `ASTRO_TELEMETRY_DISABLED=1`.
- Commands below were run through the supported Node executable and npm CLI. The normal npm commands are equivalent when a supported Node version is active.

## Commands and results

| Command / check             | Result                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `npm ci`                    | Exit 0; 278 packages added, 279 audited; 0 vulnerabilities                                                                     |
| `npm run format`            | Exit 0; formatting applied                                                                                                     |
| `npm run format:check`      | Exit 0; all matched files use Prettier style                                                                                   |
| `npm run check`             | Exit 0; 24 files, 0 errors, 0 warnings, 0 hints                                                                                |
| `npm run build`             | Exit 0; static output, 22 HTML pages                                                                                           |
| `npm run verify`            | Exit 0; 21 planned routes, 22 HTML pages, 198 local links/anchors/assets, 14 collection drafts/placeholders                    |
| `npm run verify:publishing` | Exit 0; Markdown-only publishing succeeds, temporary article removed, original build restored and reverified                   |
| Local HTTP verification     | All 21 planned pages return 200 and match the generated HTML exactly                                                           |
| Slashless section URLs      | `/about`, `/work`, `/projects`, `/learning`, `/writing`, `/contact` all return 200                                             |
| Metadata endpoints          | `/robots.txt` and `/sitemap.xml` return 200                                                                                    |
| Unknown route               | Returns 404 with the custom Page not found content; direct `/404.html` is a normal static file returning 200 locally           |
| Desktop browser             | Homepage checked at 1280 pixels, stylesheet loaded, correct identity and navigation, no horizontal overflow                    |
| Mobile browser              | Draft checked at 375 pixels; long project title/placeholder checked at 320 pixels; navigation wraps and no horizontal overflow |
| Keyboard                    | Activating Skip to content with Enter moves focus to `main`                                                                    |

The publishing test creates one temporary approved-status test fixture with an explicit test date, then builds using `https://rikt-verification.invalid`, a reserved test origin. It verifies the generated article body and date, public Writing listing, indexable robots metadata, canonical URL, sitemap inclusion, and robots sitemap reference. The sample draft remains excluded. Finally it deletes the temporary input, rebuilds without the test-origin override, checks the original empty states again, and confirms the temporary route is gone. No application code is modified to publish an article.

The final build has no test fixture or invented production origin. All three archive indexes are empty and noindex because there are no published entries. All seven project and six learning placeholders remain accessible directly, as does the sample draft. About, Work, and Contact are labelled placeholders with noindex. The sample is absent from public indexes. No client script tags are emitted.

## Issues encountered and resolution

- Public npm access and loopback HTTP checks needed execution outside sandbox network isolation. Approved network execution completed installation and HTTP verification.
- The first runtime-compatible older Astro installation had dependency audit findings. It was replaced with Astro 7.4.0 using Node 24.19.0, and a compatible esbuild update cleared the remaining finding. The final clean installation reports zero vulnerabilities.
- An initial Astro check tried to create a framework telemetry preference outside the workspace. Disabling CLI telemetry allowed checks to run within the workspace. GitHub Actions also disables it.
- A deprecated schema import was replaced with `astro/zod`; the final check has no hints.
- Strict trailing-slash routing initially made local slashless routes return 404. Routing now accepts both URL forms, with trailing slashes retained in internal links and canonical metadata. The final HTTP check passes.
- npm emitted non-fatal `EPERM` cleanup warnings for an optional `@bruits/satteri-wasm32-wasi` directory on Windows. Installation still exited 0; all checks and builds passed. No manual recursive deletion was performed.
- A browser tab became stale during the preview restart. A fresh tab verified the final build successfully.

## Outstanding work and assumptions

- No live public URL or GitHub Actions run has been verified. Deployment success is not claimed.
- Activate Node.js 24.19.0 for local development. `.node-version` pins that version for CI/hosting.
- Supply approved biography, work details, resume, project descriptions, learning notes, and confirmed contact URLs. No unsupported facts or dates were added.
- Configure `SITE_URL` with the confirmed production origin. Until then, the sitemap is intentionally empty and canonical links are omitted. Configured-origin behavior was tested with the temporary fixture.
- Create/push a GitHub repository on `main`, connect it to Cloudflare Pages, use `npm run build` and `dist`, enable automatic production deployments, and disable preview branches if production-only deployment is desired. Verify the actual live URL after deployment.
- Responsive and keyboard checks cover the stated browser scenarios, not every browser or assistive technology. Cloudflare-specific URL normalization and responses still need live verification.
- Draft and placeholder previews are publicly reachable when deployed; noindex is not access control.

## Added files

All 51 source, configuration, workflow, and documentation files are new. Generated `.astro`, `dist`, and `node_modules` directories are ignored. Screenshots were saved outside the source tree.

```text
.github/workflows/checks.yml
.gitignore
.node-version
.prettierignore
.prettierrc.json
AGENTS.md
README.md
astro.config.mjs
docs/site-structure.md
docs/verification.md
package.json
package-lock.json
scripts/verify-build.mjs
scripts/verify-publishing.mjs
src/components/ContentNotice.astro
src/components/EntryList.astro
src/content.config.ts
src/content/about.md
src/content/learning/databases.md
src/content/learning/enterprise-application-programming.md
src/content/learning/independent-study.md
src/content/learning/mobile-programming.md
src/content/learning/networking-security.md
src/content/learning/software-testing.md
src/content/projects/acme-medical.md
src/content/projects/alea.md
src/content/projects/atlas-stock-analyzer.md
src/content/projects/autosales-ai-analytics.md
src/content/projects/financial-stock-planner.md
src/content/projects/procuretrack.md
src/content/projects/rikt-kernel.md
src/content/writing/sample-draft.md
src/layouts/BaseLayout.astro
src/layouts/EntryLayout.astro
src/lib/content.ts
src/lib/navigation.ts
src/pages/404.astro
src/pages/about.astro
src/pages/contact.astro
src/pages/index.astro
src/pages/learning/[slug].astro
src/pages/learning/index.astro
src/pages/projects/[slug].astro
src/pages/projects/index.astro
src/pages/robots.txt.ts
src/pages/sitemap.xml.ts
src/pages/work.astro
src/pages/writing/[slug].astro
src/pages/writing/index.astro
src/styles/global.css
tsconfig.json
```
