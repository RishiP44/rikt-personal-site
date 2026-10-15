# RIKT engineering guidelines

- Preserve the Astro + TypeScript static site and plain CSS architecture.
- Keep changes small. Do not add accounts, databases, analytics, CMS, API keys, or services.
- Never invent biography, credentials, dates, achievements, project results, or contact links.
- Draft and placeholder routes are public previews: label them, apply `noindex`, and exclude them from archive listings and the sitemap.
- Only `published` collection entries belong in public archive indexes. Preserve existing slugs.
- Keep the About biography in `src/content/about.md` so it can be replaced independently.
- Use semantic HTML, visible focus styles, and keyboard accessible navigation.
- Run `npm run format:check`, `npm run check`, `npm run build`, `npm run verify`, and `npm run verify:publishing` after relevant changes.
- Never commit secrets, generated output, dependency directories, or publishing test fixtures.
- GitHub and Cloudflare deployment success must be verified against the actual repository and live public URL.
