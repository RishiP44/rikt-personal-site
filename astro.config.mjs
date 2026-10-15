import { defineConfig } from "astro/config";

// Set this to the verified production origin in Cloudflare Pages settings.
const site = process.env.SITE_URL;
if (site) {
  const url = new URL(site);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error(
      "SITE_URL must be an HTTP(S) origin without a path, credentials, query, or fragment.",
    );
  }
}

export default defineConfig({
  output: "static",
  trailingSlash: "ignore",
  site,
});
