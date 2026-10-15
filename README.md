# RIKT v0.1

Rishi Patel's personal archive. RIKT means the void. This release is a minimal static skeleton for work, projects, learning, writing, and personal identity.

Astro, strict TypeScript, Markdown content collections, and plain CSS. No database, login, CMS, analytics, external fonts, API keys, or client JavaScript. No GitHub repository or Cloudflare deployment is implied by these files.

## Local development

Use Node.js 24.19.0 (see `.node-version`) and npm 9.6.5 or newer. The minimum supported Node.js version is 22.22.0. Astro and dependency versions are locked in `package-lock.json`.

```powershell
cd rikt-personal-site
$env:ASTRO_TELEMETRY_DISABLED = '1'
npm ci
npm run dev
```

Open the Local URL printed by Astro, normally <http://localhost:4321/>. Stop with Ctrl+C.

Run commands from the project folder with the Node.js version specified above active. Framework CLI telemetry is disabled during verification; the generated site has no analytics or telemetry.

```powershell
npm run format:check
npm run check
npm run build
npm run verify
npm run verify:publishing
npm run preview
```

`format:check` is the formatting lint gate; `npm run format` applies fixes. `check` checks TypeScript and Astro templates. `verify` examines the current `dist` output for routes, navigation, local links and anchors, metadata, draft/placeholder visibility, and empty archive states. `verify:publishing` adds a temporary Markdown article, builds with a test origin, verifies publication, removes the fixture, and rebuilds the original site. Run it with no other build or dev server writing output. `preview` serves the production build locally.

## Add and publish writing

Create `src/content/writing/your-slug.md`. The filename is organizational; the explicit `slug` controls the URL. Keep a slug stable after publication. Slugs must be unique within a collection and contain only lowercase letters, numbers, and single separating hyphens.

```markdown
---
title: "Your approved title"
slug: "your-slug"
description: "A short, accurate summary."
status: draft
---

Your Markdown article starts here. Use second-level headings inside the article; the page supplies its title as the first-level heading.
```

Run `npm run dev` and open `/writing/your-slug/` directly. Drafts have a visible DRAFT notice, are omitted from the Writing index and sitemap, and use `noindex, follow`. Preview routes are publicly accessible if deployed; keep private material out of them.

The supplied sample is `/writing/sample-draft/`, edited in `src/content/writing/sample-draft.md`. It is clearly labelled SAMPLE / DRAFT and excluded from public indexes. Before publishing it, replace all sample content, title, and description with approved writing. Then change its frontmatter to `status: published` and add `publishedDate: "YYYY-MM-DD"` using the actual publication date. No application code changes are required. The article automatically appears in the Writing index, newest first, and becomes indexable. With `SITE_URL` configured, it also enters the sitemap.

Publishing is an explicit status change; a future `publishedDate` does not schedule publication. Dates must be valid quoted calendar dates. Drafts and placeholders can omit dates. Do not assign dates to incomplete learning records.

## Update other content

- **About:** replace only the body of `src/content/about.md` with the approved long-form biography. Preserve its frontmatter. When approved for publication, set `status: published` and update `description`; its notice and `noindex` disappear, and it enters the configured sitemap. No route or layout changes are needed.
- **Work:** edit `src/pages/work.astro`. Experience, skills, education, and resume are explicit placeholders. When approved content is ready, remove the placeholder notice and `noindex` prop. Add a real resume link only when supplied. If making this page indexable, add `/work/` to the sitemap's static paths.
- **Contact:** edit `src/pages/contact.astro`. Replace the text placeholders only with confirmed `mailto:`, GitHub, and LinkedIn links. Remove the notice and `noindex` when approved; add `/contact/` to sitemap static paths then.
- **Projects:** edit or add Markdown in `src/content/projects/`. Required fields are `title`, `slug`, `description`, and `status`. Publish approved project descriptions with `status: published`. Do not invent metrics or accomplishments.
- **Learning:** edit or add Markdown in `src/content/learning/`. Use the writing fields plus `subject`. Published records require `publishedDate`. The index automatically groups by subject and lists records newest first.

All existing project and learning pages start as labelled placeholders. They remain available at the direct URLs in [the site structure](docs/site-structure.md), while public indexes show only published entries. An archive with zero published entries shows a friendly empty state and `noindex`. No fake entries, dates, or contact links are needed to fill the site.

## Search engine metadata

The homepage is indexable. Drafts, placeholders, empty archive indexes, and the 404 page use `noindex, follow`. The sitemap includes only indexable pages. Robots are allowed to fetch pages so they can read `noindex`.

Set the non-secret build setting `SITE_URL` to the verified production origin, without a path, e.g. your actual Cloudflare Pages origin or custom domain. Do not use a sample domain. Without it, canonical links and the robots sitemap reference are omitted and `sitemap.xml` is empty; no origin is invented. Rebuild after setting it.

For a local production-origin check in PowerShell:

```powershell
$env:SITE_URL = 'https://YOUR-ACTUAL-PRODUCTION-HOST'
npm run build
npm run verify
Remove-Item Env:SITE_URL
```

Replace the uppercase host before running this example. The setting is public configuration, not a credential.

## GitHub and Cloudflare Pages

1. Create an empty GitHub repository for RIKT. This folder was initially empty and is not initialized as a Git repository by this implementation. Run `git init -b main`, add these source files, commit, add your confirmed GitHub remote, and push `main`. `.gitignore` excludes dependencies, build output, environment files, logs, and the publishing fixture. Never commit secrets.
2. In Cloudflare, create a **Pages** project and connect that GitHub repository. Set production branch **main**, build command **npm run build**, output directory **dist**, and the repository root as root directory. Select Astro if a framework preset is requested. This is static hosting; no adapter, Wrangler, deployment script, infrastructure, token, or paid service is required.
3. Use Node.js **24.19.0**, as pinned in `.node-version`. Disable automatic preview branch deployments in the Pages branch controls if you want only production deployments. No staging environment is required.
4. Deploy, open the actual public URL, and verify the homepage, navigation, direct draft/placeholder routes, and response metadata. Set `SITE_URL` to that confirmed production origin in Pages build settings and rebuild. Verify the public sitemap and canonical URLs again.
5. Subsequent pushes to **main** trigger automatic production deployments through the Pages Git connection. GitHub Actions runs formatting, Astro/TypeScript, build, link/indexing, and Markdown publishing checks; it does not deploy. Cloudflare's automatic build is independent of Actions; wait for checks before merging and use branch protection if desired.

Official references: [Astro content collections](https://docs.astro.build/en/guides/content-collections/), [Cloudflare Pages Astro guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/), and [Pages branch controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/).

## Current limitations

The biography, experience, skills, education, resume, contact details, project descriptions, and learning records await approved content. Styling is intentionally temporary. There is no search feature or publishing UI. Draft URLs are previews rather than private pages. Deployment, GitHub Actions, and production-origin metadata require verification in the actual connected repository and hosting environment.
