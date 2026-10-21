# Apparatus 02 — the Ouroboric Engine

Direction approved October 21, 2026: a scroll-led journey, with optional free 3D inspection. Preserve Astro, static content routes, Markdown publishing, and the current real biography/projects. This is an original conceptual sculpture, not a mechanically certified device or continuation of the separate prototype's gates.

## Reference and composition

The live reference at https://seunghyuk.com/?ref=siteinspire was inspected with scrolling, dragging and About navigation. Its useful behaviors are fixed peripheral navigation, generous monochrome space, radiating vectors, eased spatial transitions, and a deliberate change from the opening statement to an exploratory scene. The artwork, wording and implementation are not copied.

RIKT retains its serif/monospace contrast and local fonts. Warm ivory and ink switch to an obsidian/bone palette. An original low-poly Ouroboros encloses a mountain path, a voxel-like Sisyphus and a faceted stone, leaving visible negative space. Calibration lines and restrained brass details support the drawing rather than adding invented statistics.

## Experience

- Normal document scrolling passes the introduction and six HTML chapters: About, Work, Projects, Learning, Writing and Contact. The sculpture changes view and its pushing pose follows scroll progress. There is no wheel hijacking or idle animation loop.
- Inspect is an explicit mode: pointer/touch drag rotates, keyboard arrows rotate, zoom/reset buttons provide alternatives, Escape returns to the journey. Page position and focus are restored. Part selection reveals a description and an ordinary destination link.
- Existing destinations and Markdown slugs stay unchanged. The biography stays in `src/content/about.md`. Real published project summaries feed the homepage; drafts remain absent from its public project links.
- The unconfirmed email, invented sample projects/articles, sample efficiency figures and unsupported credentials from the supplied design handoff are not published.
- A static SVG illustration and ordinary HTML remain when JavaScript or WebGL is unavailable. Reduced motion uses immediate view changes and still poses. Inspect mode never becomes the only route to content.

## Implementation and verification

Use one locally bundled Three.js dependency with TypeScript definitions, no framework migration, animation library, external model download, CDN, API key, analytics or new service. Keep the model, browser controller and Astro shell separate. Render on demand, cap pixel ratio, release pointer capture predictably, and handle context loss/resizing/theme changes.

Verification will cover formatting, Astro/TypeScript, build, existing route/link/indexing tests, Markdown publication, model/control invariants, and browser checks of scrolling, inspection, reset, keyboard, pointer and theme behavior. Screenshots and actual results will be recorded after execution. Source/build success alone is not visual or device acceptance.

## Local results — October 21, 2026

Executed with Node.js 24.19.0 and framework telemetry disabled. `npm run format:check`, `npm run check`, `npm run build`, `npm run verify`, `npm run verify:apparatus`, and `npm run verify:publishing` all exited 0. Astro reported 33 files, zero errors, warnings or hints. The build produced 22 pages; artifact verification covered 21 planned routes, 370 local links/anchors/assets, and ten unpublished collection entries. The publishing check proved that one Markdown file appears in both the archive and homepage without application edits, then removed it and restored the original output.

The actual model checks cover six mappings and 107 meshes, finite bounded geometry across 241 scroll poses, continuous stone movement, reduced-motion still poses, clamped/returning views, shortest-arc reset and actual ray selection of the stone. These are scene invariants, not mechanical collision certification.

Browser inspection covered desktop at 1270 × 714, mobile at 390 × 844, and a short 390 × 600 viewport. Executed checks included native chapter navigation, pointer dragging, direct stone selection, keyboard rotation, all six Inspect destinations, Escape/focus restoration, light/dark themes, archive navigation and browser Back. The scrolled Projects position before and after Inspect was identical at 2905.60009765625 CSS pixels in the mobile check. No horizontal overflow was found in the inspected mobile views; no browser warnings/errors were captured in the final desktop preview.

Review found overlapping mobile model/details, controls crossing prose, a mobile Contact selector intercepted by the theme cord, and a desktop Learning selector beneath the zoom controls. Layout and hit areas were corrected, short-screen controls made scrollable, and all six destination selections retested successfully. Historical G0/G1 prototype files, existing Markdown content and slugs were not modified.

The production dependency audit exited 0 with zero reported vulnerabilities. Seventy nonignored source/configuration/document files were inspected for credential patterns, sensitive filenames and files over 5 MiB; none were flagged. This is a bounded publication check, not a guarantee that pattern matching detects every possible secret. Three.js is pinned to 0.186.1 and its MIT notice is included; type definitions are pinned to 0.186.0. No Anatomy code, models, textures, external fonts or new services are used.

Vite retains a bundle-size warning: the optional 3D module is approximately 580 kB minified / 147 kB gzip, with an approximately 1.8 kB initial loader. HTML and the static drawing paint before the 3D module loads; the renderer runs only when needed and caps pixel ratio at 1.5. No frame-rate benchmark or physical touch-device test was performed. Reduced-motion stillness was tested at model level; operating-system media emulation, forced WebGL context loss, and a browser with JavaScript disabled were not executed. Static fallback markup and ordinary links were checked in generated HTML.

Raw local command logs and screenshots are retained outside the repository in the Codex visualization workspace's `rikt-ouroboric-engine` folder. GitHub/Cloudflare release results must be verified against the pushed revision and actual public URL; local success alone does not establish deployment.
