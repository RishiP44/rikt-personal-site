import type { APIRoute } from "astro";
import { getPublished } from "../lib/content";

export const GET: APIRoute = async ({ site }) => {
  const paths = ["/"];
  for (const collection of ["projects", "learning", "writing"] as const) {
    const entries = await getPublished(collection);
    if (entries.length) paths.push(`/${collection}/`);
    paths.push(...entries.map(({ data }) => `/${collection}/${data.slug}/`));
  }
  const { frontmatter } = await import("../content/about.md");
  if (frontmatter.status === "published") paths.push("/about/");
  // No invented origin: an unconfigured local build has an empty sitemap.
  const urls = site
    ? paths
        .map((path) => `<url><loc>${new URL(path, site).href}</loc></url>`)
        .join("")
    : "";
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
