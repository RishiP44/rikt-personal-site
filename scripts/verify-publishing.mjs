import assert from "node:assert/strict";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { root, verifyBuild } from "./verify-build.mjs";

const fixture = path.join(root, "src/content/writing/__publishing-check.md");
const astro = path.join(root, "node_modules/astro/bin/astro.mjs");
const testOrigin = "https://rikt-verification.invalid";
function build(env = process.env) {
  const result = spawnSync(process.execPath, [astro, "build"], {
    cwd: root,
    env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, "Astro production build must succeed");
}

// Exclusive creation refuses to overwrite any existing author content.
await writeFile(
  fixture,
  `---\ntitle: "Temporary publishing verification"\nslug: "publishing-check"\ndescription: "Automated fixture, removed after verification."\nstatus: published\npublishedDate: "2026-10-15"\n---\n\n## Markdown publishing works\n\nThis temporary test article is generated from Markdown alone.\n`,
  { flag: "wx" },
);
try {
  build({ ...process.env, SITE_URL: testOrigin });
  await verifyBuild();
  const article = await readFile(
    path.join(root, "dist/writing/publishing-check/index.html"),
    "utf8",
  );
  const index = await readFile(
    path.join(root, "dist/writing/index.html"),
    "utf8",
  );
  const sitemap = await readFile(path.join(root, "dist/sitemap.xml"), "utf8");
  const robots = await readFile(path.join(root, "dist/robots.txt"), "utf8");
  assert.match(article, /Markdown publishing works/);
  assert.match(article, /<time datetime="2026-10-15"/);
  assert.match(article, /content="index, follow"/);
  assert(article.includes(`href="${testOrigin}/writing/publishing-check/"`));
  assert.match(index, /href="\/writing\/publishing-check\/"/);
  const homepage = await readFile(path.join(root, "dist/index.html"), "utf8");
  assert.match(homepage, /href="\/writing\/publishing-check\/"/);
  assert.doesNotMatch(homepage, /href="\/writing\/sample-draft\/"/);
  assert.doesNotMatch(index, /href="\/writing\/sample-draft\/"/);
  assert(sitemap.includes(`${testOrigin}/writing/publishing-check/`));
  assert(!sitemap.includes("sample-draft"));
  assert(robots.includes(`${testOrigin}/sitemap.xml`));
  console.log(
    "PASS: adding one published Markdown file generated a route, date, public listing, canonical URL, and sitemap entry without application changes.",
  );
} finally {
  await unlink(fixture);
  build();
  await verifyBuild();
  await assert.rejects(
    readFile(path.join(root, "dist/writing/publishing-check/index.html")),
    { code: "ENOENT" },
  );
  console.log(
    "PASS: temporary article removed; original production output rebuilt and verified.",
  );
}
