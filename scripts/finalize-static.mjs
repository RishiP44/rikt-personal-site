import { copyFile, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
const dir = path.resolve("dist/client");
await copyFile(path.join(dir, "404/index.html"), path.join(dir, "404.html"));
const origin = process.env.SITE_URL || "https://rikt-personal-site.pages.dev";
const urls = ["/", "/about", "/tabloid", "/tabloid/the-rock-is-the-point", "/tabloid/first-issue"];
for (const route of [
  "/",
  "/about",
  "/work",
  "/projects",
  "/learning",
  "/tabloid",
  "/tabloid/the-rock-is-the-point",
  "/tabloid/first-issue",
])
  await stat(path.join(dir, route, "index.html"));
await writeFile(
  path.join(dir, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.map((route) => "<url><loc>" + new URL(route, origin).href + "</loc></url>").join("") +
    "</urlset>",
);
await writeFile(
  path.join(dir, "robots.txt"),
  "User-agent: *\nAllow: /\nSitemap: " + new URL("/sitemap.xml", origin).href + "\n",
);
const html = await readFile(path.join(dir, "index.html"), "utf8");
if (!html.includes("The Endless Push")) throw Error("Homepage was not prerendered");
console.log("Static Pages output prepared in dist/client.");
