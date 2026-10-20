# RIKT v0.1 site structure

## Source organization

```text
.github/workflows/checks.yml  Formatting, typecheck, build, artifact/publishing checks
src/
  components/                ContentNotice and EntryList
  content/
    about.md                 Replaceable biography, independently publishable
    projects/*.md            Seven initial placeholder entries
    learning/*.md            Six initial placeholder entries
    writing/*.md             One sample draft
  content.config.ts          Frontmatter validation
  layouts/                   Shared document and content-entry layouts
  lib/                       Navigation, collection access, sorting, date formatting
  pages/                     Static routes, collection routes, robots, sitemap, 404
  styles/global.css          Minimal temporary styling
scripts/
  verify-build.mjs           Validate generated routes, links, metadata, visibility
  verify-publishing.mjs      Temporary Markdown-only publication check and cleanup
```

## Routes

| Route                                           | Initial content / visibility                                               |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| `/`                                             | Drawing board, six linked assemblies, homepage About; indexable            |
| `/about/`                                       | Shared published Markdown biography; indexable                             |
| `/work/`                                        | Accepted experience summaries; indexable                                   |
| `/projects/`                                    | Published entries only; four approved summaries                            |
| `/projects/rikt-kernel/`                        | Published summary; indexable                                               |
| `/projects/procuretrack/`                       | Published summary; indexable                                               |
| `/projects/acme-medical/`                       | Published summary; indexable                                               |
| `/projects/autosales-ai-analytics/`             | Published summary; indexable                                               |
| `/projects/financial-stock-planner/`            | Placeholder; noindex                                                       |
| `/projects/alea/`                               | Placeholder; noindex                                                       |
| `/projects/atlas-stock-analyzer/`               | Placeholder; noindex                                                       |
| `/learning/`                                    | Published entries by subject and newest first; empty and noindex initially |
| `/learning/enterprise-application-programming/` | Placeholder; noindex                                                       |
| `/learning/databases/`                          | Placeholder; noindex                                                       |
| `/learning/software-testing/`                   | Placeholder; noindex                                                       |
| `/learning/mobile-programming/`                 | Placeholder; noindex                                                       |
| `/learning/networking-security/`                | Placeholder; noindex                                                       |
| `/learning/independent-study/`                  | Placeholder; noindex                                                       |
| `/writing/`                                     | Published articles, newest first; empty and noindex initially              |
| `/writing/sample-draft/`                        | Labelled SAMPLE / DRAFT preview; noindex; absent from indexes              |
| `/contact/`                                     | Confirmed GitHub and forthcoming email; noindex                            |
| `/404.html`                                     | Missing page response; noindex                                             |
| `/robots.txt`                                   | Allows crawling so noindex can be read; sitemap URL when origin configured |
| `/sitemap.xml`                                  | Indexable URLs only; empty without configured production origin            |

Astro generates directory-style routes. Local routing accepts both slashless and trailing-slash section URLs; internal links and canonical URLs use trailing slashes consistently. Cloudflare Pages serves the output as static HTML. The custom top-level 404 prevents Pages from treating missing paths as an SPA fallback.

## Content rules

`status` is required and is one of `placeholder`, `draft`, or `published`. Required `slug` is the stable URL key; filename changes do not change the URL. Duplicate slugs fail the build. Writing and learning require a valid `publishedDate` only when published; learning also requires `subject`. No dates or biographical claims are fabricated for placeholders.

The homepage now uses the accepted drawing-board design with `#drawing` and `#about` sections. The six machine destinations are ordinary SVG anchors. `/about/` remains available, and every existing slug is retained. Four project summaries are published; learning has approved overview text plus the existing unpublished record routes.

Every entry receives a route, including drafts and placeholders. Only published entries are returned to public indexes. All non-published entries show notices, receive `noindex, follow`, and are excluded from the sitemap. This allows direct preview without adding sample content to public listings. These routes are not private.

About is a Markdown document with `status`, `description` and `lede` frontmatter, shared by the homepage and standalone route. Only `status: published` removes its placeholder state. Work and Contact remain simple editable Astro pages.

## Deployment boundary

The build output is `dist`. The target is GitHub-connected Cloudflare Pages with `main` as production branch. There are no hosting adapters, APIs, databases, secrets, or deployment scripts. Set `SITE_URL` to the confirmed public origin for canonical metadata and sitemap URLs. Local builds do not fabricate a production URL.
