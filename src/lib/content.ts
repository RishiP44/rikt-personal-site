import { getCollection } from "astro:content";

export type Archive = "projects" | "learning" | "writing";
export type ContentStatus = "published" | "draft" | "placeholder";

export async function getEntries<T extends Archive>(collection: T) {
  const entries = await getCollection(collection);
  const slugs = new Set<string>();
  for (const entry of entries) {
    if (slugs.has(entry.data.slug)) {
      throw new Error(`Duplicate slug in ${collection}: ${entry.data.slug}`);
    }
    slugs.add(entry.data.slug);
  }
  return entries;
}

export async function getPublished<T extends Archive>(collection: T) {
  const entries = await getEntries(collection);
  return entries
    .filter((entry) => entry.data.status === "published")
    .sort((a, b) => {
      const aDate =
        "publishedDate" in a.data ? (a.data.publishedDate ?? "") : "";
      const bDate =
        "publishedDate" in b.data ? (b.data.publishedDate ?? "") : "";
      return (
        bDate.localeCompare(aDate) ||
        a.data.title.localeCompare(b.data.title, "en")
      );
    });
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
