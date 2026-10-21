import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "dist");
const archives = ["projects", "learning", "writing"];
const planned = [
  "/",
  "/about/",
  "/work/",
  "/projects/",
  "/learning/",
  "/writing/",
  "/contact/",
  ...[
    "rikt-kernel",
    "procuretrack",
    "acme-medical",
    "autosales-ai-analytics",
    "financial-stock-planner",
    "alea",
    "atlas-stock-analyzer",
  ].map((slug) => `/projects/${slug}/`),
  ...[
    "enterprise-application-programming",
    "databases",
    "software-testing",
    "mobile-programming",
    "networking-security",
    "independent-study",
  ].map((slug) => `/learning/${slug}/`),
  "/writing/sample-draft/",
];

async function walk(directory) {
  const files = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    files.map((entry) =>
      entry.isDirectory()
        ? walk(path.join(directory, entry.name))
        : [path.join(directory, entry.name)],
    ),
  );
  return nested.flat();
}

const routeFile = (route) =>
  path.join(dist, route.replace(/^\//, ""), "index.html");
const noindex = (html) =>
  /<meta\s+name="robots"\s+content="noindex, follow"/.test(html);

export async function verifyBuild() {
  for (const route of planned) await stat(routeFile(route));
  const home = await readFile(routeFile("/"), "utf8");
  assert.match(home, /id="drawing"/);
  assert.match(home, /id="about"/);
  const machineLinks = [
    ...home.matchAll(/<a class="part" href="([^"]+)" aria-label="([^"]+)"/g),
  ];
  assert.deepEqual(
    machineLinks.map((match) => match[1]).sort(),
    [
      "#about",
      "/work/",
      "/projects/",
      "/learning/",
      "/writing/",
      "/contact/",
    ].sort(),
    "Six ordinary machine links must work without JavaScript",
  );
  assert.equal(new Set(machineLinks.map((match) => match[2])).size, 6);
  for (const font of ["editorial.woff", "editorial-italic.woff"]) {
    const data = await readFile(path.join(dist, "assets", font));
    assert.equal(
      data.subarray(0, 4).toString(),
      "wOFF",
      `${font}: valid bundled font header`,
    );
  }
  await stat(path.join(dist, "assets", "FONT-LICENSE.txt"));
  const files = (await walk(dist)).filter((file) => file.endsWith(".html"));
  const pages = new Map(
    await Promise.all(
      files.map(async (file) => [file, await readFile(file, "utf8")]),
    ),
  );
  const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
  const robots = await readFile(path.join(dist, "robots.txt"), "utf8");
  assert.match(
    robots,
    /Allow: \//,
    "Crawlers need access to see noindex metadata",
  );
  assert.doesNotMatch(robots, /Disallow:\s*\//);
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1]),
  );
  const publishedByArchive = new Map(archives.map((archive) => [archive, []]));
  let linkCount = 0;
  let unpublishedCount = 0;

  for (const [file, html] of pages) {
    const relative = path.relative(dist, file).replaceAll(path.sep, "/");
    const route =
      relative === "index.html"
        ? "/"
        : relative === "404.html"
          ? "/404.html"
          : `/${relative.slice(0, -"index.html".length)}`;
    assert.match(html, /<html lang="en"/);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.match(html, /<meta name="description" content="[^"]+"/);
    assert.equal(
      (html.match(/<h1(?:\s|>)/g) ?? []).length,
      1,
      `${route}: one page heading`,
    );
    assert.match(html, /<main id="main" tabindex="-1"/);
    assert.match(html, /href="#main"/);
    const scripts = [
      ...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g),
    ];
    assert.equal(
      scripts.length,
      route === "/" ? 3 : 2,
      `${route}: only approved theme/enhancement scripts and the homepage apparatus module`,
    );
    assert.match(scripts[0][2], /localStorage\.getItem\("rikt-theme"\)/);
    assert.match(scripts[1][1], /src="\/scripts\/site\.js"/);
    if (route === "/") {
      assert.match(scripts[2][1], /type="module"/);
      assert.match(scripts[2][1], /src="\/_astro\/[^\"]+\.js"/);
      assert.match(html, /data-apparatus/);
      assert.match(html, /data-render-state="static"/);
      assert.match(html, /id="ouro-title"/);
      for (const id of [
        "about",
        "work",
        "projects",
        "learning",
        "writing",
        "contact",
      ])
        assert.match(home, new RegExp(`id="${id}" data-chapter="${id}"`));
    }
    assert.match(html, /class="theme-switch"[^>]*hidden/);
    assert.doesNotMatch(
      html,
      /href="(?:#|)"/,
      `${route}: no dead placeholder links`,
    );

    const status = html.match(/data-content-status="([^"]+)"/)?.[1];
    const archive = html.match(/data-archive="([^"]+)"/)?.[1];
    if (status && status !== "published") {
      unpublishedCount++;
      assert(noindex(html), `${route}: unpublished content must be noindex`);
      assert.match(html, /data-content-notice/);
      assert.match(html, status === "draft" ? /DRAFT/ : /PLACEHOLDER/);
      assert(
        !listed.some((url) => url.pathname === route),
        `${route}: unpublished sitemap entry`,
      );
      for (const name of archives) {
        assert(
          !pages.get(routeFile(`/${name}/`)).includes(`href="${route}"`),
          `${route}: unpublished index link`,
        );
      }
    } else if (status === "published") {
      assert(!noindex(html), `${route}: published entry should be indexable`);
      assert.doesNotMatch(html, /data-content-notice/);
      assert(
        pages.get(routeFile(`/${archive}/`)).includes(`href="${route}"`),
        `${route}: missing archive listing`,
      );
      if (listed.length)
        assert(
          listed.some((url) => url.pathname === route),
          `${route}: missing sitemap entry`,
        );
      publishedByArchive.get(archive).push(route);
    }

    for (const match of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
      const target = match[1].replaceAll("&amp;", "&");
      if (/^(?:https?:|mailto:|tel:|data:)/.test(target)) continue;
      const url = new URL(target, `https://local.invalid${route}`);
      const targetPath = path.join(
        dist,
        decodeURIComponent(url.pathname).replace(/^\//, ""),
      );
      const info = await stat(targetPath).catch(() => null);
      assert(info, `${route}: broken local link ${target}`);
      const targetFile = info.isDirectory()
        ? path.join(targetPath, "index.html")
        : targetPath;
      await stat(targetFile);
      if (url.hash) {
        const targetHtml =
          pages.get(targetFile) ?? (await readFile(targetFile, "utf8"));
        assert(
          targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),
          `${route}: missing anchor ${target}`,
        );
      }
      linkCount++;
    }
    for (const { href } of ["about", "work", ...archives, "contact"].map(
      (name) => ({ href: `/${name}/` }),
    )) {
      assert(
        html.includes(`href="${href}"`) ||
          (route === "/" &&
            href === "/about/" &&
            html.includes('href="#about"')),
        `${route}: missing navigation ${href}`,
      );
    }
  }
  for (const archive of archives) {
    const html = pages.get(routeFile(`/${archive}/`));
    const empty = publishedByArchive.get(archive).length === 0;
    assert.equal(
      noindex(html),
      empty,
      `${archive}: empty indexes must be noindex`,
    );
    if (empty)
      assert.match(
        html,
        /No (?:projects|learning records|articles) have been published yet/,
      );
  }
  assert(
    !noindex(pages.get(routeFile("/work/"))),
    "Approved Work content should be indexable",
  );
  assert(
    noindex(pages.get(routeFile("/contact/"))),
    "Contact email is still being prepared",
  );
  const aboutSource = await readFile(
    path.join(root, "src/content/about.md"),
    "utf8",
  );
  assert.equal(
    noindex(pages.get(routeFile("/about/"))),
    !/^status:\s*published\s*$/m.test(aboutSource),
    "About indexing must follow its Markdown publication status",
  );
  assert(
    noindex(pages.get(path.join(dist, "404.html"))),
    "404 must be noindex",
  );
  assert(!noindex(pages.get(routeFile("/"))), "Homepage should be indexable");
  for (const url of listed) {
    assert(
      !noindex(pages.get(routeFile(url.pathname)) ?? ""),
      `${url.pathname}: noindex URL in sitemap`,
    );
    await stat(routeFile(url.pathname));
  }
  console.log(
    `PASS: ${planned.length} planned routes; ${pages.size} HTML pages; ${linkCount} local links/anchors/assets; ${unpublishedCount} draft/placeholder entries; metadata, archive visibility, robots, sitemap, and empty states.`,
  );
  return {
    planned: planned.length,
    pages: pages.size,
    links: linkCount,
    unpublished: unpublishedCount,
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await verifyBuild();
