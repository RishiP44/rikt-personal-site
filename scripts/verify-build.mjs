import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";
const root = path.resolve("dist/client");
const routes = [
  "/",
  "/about",
  "/work",
  "/projects",
  "/learning",
  "/tabloid",
  "/tabloid/the-rock-is-the-point",
  "/tabloid/first-issue",
  "/404",
];
const placeholders = new Set(["/work", "/projects", "/learning"]);
const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
const redirects = await readFile(path.join(root, "_redirects"), "utf8");
let links = 0;
for (const route of routes) {
  const html = await readFile(path.join(root, route, "index.html"), "utf8");
  const doc = new JSDOM(html).window.document;
  assert.equal(doc.documentElement.lang, "en");
  assert(doc.title.includes("Rishi Patel"));
  assert.equal(doc.querySelectorAll("h1").length, 1, route + ": one h1");
  assert(doc.querySelector("main#main"), route + ": main landmark");
  assert(doc.querySelector('a[href="#main"]'), route + ": skip link");
  assert(doc.querySelector('meta[name="description"]')?.getAttribute("content"));
  const noindex = doc
    .querySelector('meta[name="robots"]')
    ?.getAttribute("content")
    ?.includes("noindex");
  if (placeholders.has(route)) {
    assert(noindex, route + ": placeholder noindex");
    assert(doc.querySelector("[data-content-notice]")?.textContent.includes("PLACEHOLDER"));
    assert(!sitemap.includes("<loc>https://rikt-personal-site.pages.dev" + route + "</loc>"));
  }
  if (route === "/404") assert(noindex);
  assert(!html.includes("hello@rishipatel.com"));
  assert(!html.includes("fonts.googleapis.com"));
  assert(!html.includes("lovable.js"));
  for (const node of doc.querySelectorAll("a[href],img[src],script[src],link[href],image[href]")) {
    const raw = node.getAttribute("href") ?? node.getAttribute("src");
    if (!raw || /^(https?:|mailto:|data:)/.test(raw)) continue;
    const url = new URL(raw, "https://site.invalid" + route + "/");
    let target = path.join(root, decodeURIComponent(url.pathname));
    const info = await stat(target).catch(() => null);
    assert(info, route + ": local target exists " + raw);
    if (info.isDirectory()) target = path.join(target, "index.html");
    await stat(target);
    if (url.hash) {
      const targetDoc = new JSDOM(await readFile(target, "utf8")).window.document;
      assert(
        targetDoc.getElementById(decodeURIComponent(url.hash.slice(1))),
        route + ": hash target " + raw,
      );
    }
    links++;
  }
}
const html = await readFile(path.join(root, "index.html"), "utf8");
for (const text of [
  "The Endless Push",
  "The One Who Pushes",
  "The Rock",
  "The Coils",
  "The Eye",
  "The Cycle",
])
  assert(html.includes(text));
for (const route of ["/about", "/work", "/projects", "/learning", "/tabloid"])
  assert(html.includes('href="' + route));
assert.equal(
  await readFile(path.join(root, "404.html"), "utf8"),
  await readFile(path.join(root, "404/index.html"), "utf8"),
);
assert(redirects.includes("/writing /tabloid/ 301"));
assert(redirects.includes("/contact /about/ 301"));
for (const font of ["hanken-grotesk.ttf", "instrument-serif.ttf", "instrument-serif-italic.ttf"])
  assert((await readFile(path.join(root, "fonts", font))).length > 50000);
const assets = await readdir(path.join(root, "assets"));
assert(assets.some((file) => file.startsWith("sisyphus-") && file.endsWith(".png")));
assert(assets.some((file) => file.startsWith("sisyphus-sprite-") && file.endsWith(".png")));
console.log(
  "PASS: " +
    routes.length +
    " prerendered routes; " +
    links +
    " local links/assets/anchors; accepted chapters and artwork; placeholder noindex; sitemap; local fonts; custom 404 and legacy redirect configuration.",
);

assert(!redirects.includes("/projects/*"), "Collection root must not match its own redirect");
assert(!redirects.includes("/learning/*"), "Collection root must not match its own redirect");
assert(redirects.includes("/contact/ /about/ 301"));
assert(redirects.includes("/projects/procuretrack/ /projects/ 301"));
assert(redirects.includes("/learning/databases/ /learning/ 301"));
