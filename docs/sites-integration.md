# Drawing-board integration

The owner authorized bringing the accepted Sites appearance and content into the existing Astro/GitHub/Cloudflare website on October 20, 2026.

Visual source: Sites project `appgprj_6ad7c4901cdc8191bf6fe65df7916971`, version 2, source commit `96af5d87153a4ec84df2ef221757eaf0ad0320c4`. The private Sites project and separate mechanical prototype are unchanged.

- The machine illustration is imported verbatim as inline SVG from `src/assets/machine.svg`; its links work without JavaScript.
- The accepted CSS, favicon and locally hosted P052 regular/italic font files are retained. `public/assets/FONT-LICENSE.txt` preserves the upstream notices and full included license text; font source is identified there as Artifex urw-base35-fonts.
- Astro components replace the Sites page generator. Edit shared layout, header, About section and theme switch components directly; Python is not a build dependency.
- `src/content/about.md` remains the single biography source, rendered on the homepage and `/about/`.
- Four Sites project summaries are published as Markdown using existing slugs, including `rikt-kernel` for the Sites RIKT summary. These are summaries, not invented case studies.
- The learning overview is transferred as approved page content. Existing subject/datetime-based Markdown record publishing remains intact; no dates were invented.
- The sample writing draft and remaining placeholders retain direct preview URLs, visible labels, noindex and exclusion from public archives/sitemap. Empty archives retain their empty states.
- Approved Work content is indexable. Contact remains noindex while the direct email is forthcoming.
- All destination pages have a top return-to-machine link. Archive/article navigation remains available on content pages.
- JavaScript is limited to the early theme preference bootstrap and local `/scripts/site.js`. It adds persistent themes, descriptions and section indicators. The switch is hidden when JavaScript is unavailable; normal machine links remain.
- Homepage section snapping follows the accepted draft. Content pages scroll normally. Reduced motion disables animated transitions and smooth scrolling.

Run the five README checks before publication. Browser verification and deployment results are recorded separately for the exact release; source transfer alone is not evidence that a live deployment succeeded.

## Local integration verification — October 20, 2026

`npm run format:check`, `npm run check`, `npm run build`, `npm run verify`, and `npm run verify:publishing` passed. Astro reported zero errors, warnings, or hints. The restored production build contains 22 HTML pages, all 21 planned routes, 353 verified local links/anchors/assets, and ten correctly excluded draft/placeholder entries. The temporary Markdown publication fixture generated its route, archive listing, date, canonical URL and sitemap entry, and was removed before rebuilding the original output.

The transferred SVG, fonts and favicon matched the accepted source byte-for-byte; the complete license text is preserved with LF line endings. Twenty accepted page paragraphs were checked against built output. JavaScript syntax and Git whitespace checks passed; a bounded scan found no common secret signatures or unexpected private/generated files in the change set.

Desktop browser inspection confirmed the drawing and About screens, light/dark switching, theme persistence across Projects and its Markdown detail route, pointer machine navigation, and keyboard return navigation. This is not a real-device mobile or exhaustive accessibility certification. Local preview initially timed out inside the filesystem/network sandbox; the authorized preview outside it was reachable and used for these checks.
