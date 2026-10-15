import type { APIRoute } from "astro";

// Crawlers must be able to fetch previews to see their noindex directive.
export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nAllow: /\n${site ? `Sitemap: ${new URL("/sitemap.xml", site).href}\n` : ""}`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
