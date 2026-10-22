# RIKT / The Endless Push

This is the owner's accepted website from [endless-ascent-portfolio](https://github.com/RishiP44/endless-ascent-portfolio), imported from commit `e509bbade67d140ce5a75ec139c55f5b26bef197` on October 22, 2026. The React/TanStack application replaces the previous Astro implementation. The previous implementation and separate editorial-apparatus experiment remain in Git history.

The upstream repository remains unchanged and connected to Lovable. Production continues in [RishiP44/rikt-personal-site](https://github.com/RishiP44/rikt-personal-site), on `main`, at https://rikt-personal-site.pages.dev/.

## Development

Use Node.js 24.19.0 as pinned in .node-version.

```powershell
npm ci
npm run dev
```

The terminal prints the local address. Existing application source, artwork, scroll focal points, page transitions, themes and animated footer are retained. Hanken Grotesk and Instrument Serif are bundled locally with their SIL Open Font Licenses.

## Verification

```powershell
npm run format:check
npm run check
npm run lint
npm test
npm run build
npm run verify
```

The build prerenders the site into `dist/client`. No SSR worker or paid runtime is deployed. The small finalize script creates the custom static 404 and sitemap. Build-output tests verify routes, internal links, assets, indexing and exclusions.

## Content

- About: `src/routes/about.tsx`.
- Work, Projects and Learning: their respective files in `src/routes`. Upstream example entries are explicitly labelled placeholders and noindex until real content replaces them.
- Tabloid: `src/lib/posts.ts`. The two supplied posts are copied from the owner's selected source; no additional articles were authored during migration. Add approved posts here with a stable slug, title, ISO date, excerpt and paragraphs.
- Footer contact links: `src/components/SiteHeader.tsx`. GitHub points to the confirmed RishiP44 account. The example email and generic social homepages have been replaced by unlinked forthcoming labels.
- Artwork: `src/assets/sisyphus.png` and `sisyphus-sprite.png`, copied byte-for-byte from the source repository.

The previous Markdown publishing system belongs to the retired Astro application and no longer drives this replacement. Historical documentation under `docs` and prior handoffs in Git history record older states; it does not override this approved replacement.

Old Writing URLs redirect to Tabloid. Old collection-detail URLs redirect to their collection landing page, and Contact redirects to About; the accepted site uses footer contact information rather than a separate contact page.

## Cloudflare Pages

Keep the existing GitHub connection to `RishiP44/rikt-personal-site`, production branch `main`, and build command `npm run build`. Change the output directory from the old Astro `dist` to **`dist/client`**. Keep Node.js 24.19.0 and `SITE_URL=https://rikt-personal-site.pages.dev`.

GitHub Actions checks the application; Cloudflare deploys through its existing Git connection. Always verify both services and the actual public URL for the exact pushed revision. No deploy hooks, API keys or new hosting project are required.

See [migration notes](docs/endless-ascent-migration.md) for the bounded differences from the accepted source.
