# Accepted website replacement — October 22, 2026

The owner explicitly selected the website in RishiP44/endless-ascent-portfolio and confirmed: replace rikt-personal-site with it, retaining the existing public URL. This authorizes the React/TanStack application replacing Astro; it is not another visual redesign.

Source revision: e509bbade67d140ce5a75ec139c55f5b26bef197. The source repository is private and remains untouched. Only website source and assets are imported; Lovable project metadata, credentials and repository history are not copied.

Bounded hosting/publication adaptations:

- Official Vite/TanStack/Tailwind build plugins replace Lovable's hosting-specific Vite wrapper.
- Static prerendering produces dist/client for the existing Cloudflare Pages project.
- The original two artwork files, fonts, colours, layouts, scroll focal points, transitions and footer remain the visual source.
- Fonts are served locally with licenses.
- Generic company/project/learning examples are labelled placeholders and excluded from indexing/sitemap. Unconfirmed email/social destinations are unlinked; confirmed GitHub uses RishiP44.
- The two Tabloid posts are retained from the selected source, with their original content and dates.
- A custom 404, sitemap, robots configuration and legacy URL redirects preserve static hosting behavior.
- The old Astro code, Markdown content and prior experiments remain retrievable from Git history. They are not simultaneously active applications.
- No Anatomy, old machine generator, new external service or new deployment secret is used.

Verification and deployment results must be recorded only after execution. Acceptance of the source design does not excuse broken builds or unverified deployment.

## Executed local checks

Formatting, TypeScript, lint, eight route/article tests, prerendered production build and generated-site verification all exited 0. Verification covered nine routes and 138 local links/assets/anchors, placeholder noindex, sitemap exclusions, local fonts, the custom 404 and legacy redirect configuration.

Lint retains six upstream Fast Refresh warnings in unused UI helper modules; there are no lint errors. npm 10 initially crashed in peer resolution; npm 11 installed successfully. Installation reported Windows cleanup warnings for locked old Astro native binaries in ignored node_modules. No source or build artifact depends on them.

The upstream Vite 8.1.5 dependency had a reported vulnerability. It was patched to 8.1.6 without a major upgrade; the resulting audit reports zero vulnerabilities. Two source artwork files were SHA-256 compared and match the upstream revision exactly. A bounded scan of 101 nonignored source files flagged no credential patterns, sensitive filenames or files over 5 MiB.

Desktop browser checks exercised all five chapter destinations, a Tabloid article, light/dark switching and theme persistence. No runtime warnings/errors were captured. An immediate browser-Back/scroll test and an exact article-name selector needed corrected test timing/targeting; the settled UI and actual navigation worked. The browser viewport override did not change the measured 1280 × 720 viewport, so mobile visual verification is not claimed. Physical touch and OS-level reduced-motion testing were not performed. The responsive layout from the accepted source remains intact.

The migration also restores light-theme persistence, adds a skip link/visible focus, supplies a homepage h1, and respects reduced motion for zoom/traveller effects. These are bounded usability adaptations, not a new visual direction.

Cloudflare must serve dist/client rather than the retired Astro dist. Actual push, CI and live file-comparison results are retained outside the repository in the endless-ascent-replacement evidence folder; local checks alone do not prove deployment.

Initial public verification found Cloudflare’s directory-slash normalization interacting with broad collection redirects to form a loop. Broad Projects/Learning rules were replaced by explicit redirects for the thirteen known legacy detail slugs, and both Contact slash variants now redirect to About. Historical failure evidence is retained outside the repository.
