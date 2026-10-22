# RIKT engineering guidelines

The owner approved replacing the Astro application with the React/TanStack website from RishiP44/endless-ascent-portfolio on October 22, 2026. Preserve that accepted implementation and appearance; do not restart the previous design experiments.

- Production repository: RishiP44/rikt-personal-site; production branch: main. Never push to the unrelated RishiP44/rikt repository.
- Treat endless-ascent-portfolio as the upstream design source. Do not push changes to it without a separate request; it is connected to Lovable.
- Preserve published Git history. Do not force-push, rewrite history, or delete historical evidence.
- Build static HTML with TanStack Start prerendering. Cloudflare Pages serves dist/client; no runtime server, database, accounts, analytics, CMS, credentials or new services.
- Do not invent biography, credentials, dates, achievements, contact links or articles.
- Template experience/project/learning entries must be labelled PLACEHOLDER and noindex. Only confirmed contact destinations may be linked.
- Posts supplied in the accepted source are in src/lib/posts.ts. Do not silently author or publish new articles.
- Keep keyboard navigation, visible focus, reduced-motion behavior and responsive layouts working.
- Run npm run format:check, npm run check, npm run lint, npm test, npm run build and npm run verify after relevant application changes.
- Never commit secrets, environment files, generated output or dependency directories.
- Verify the actual remote commit, CI results and public URL before claiming publication or deployment.
