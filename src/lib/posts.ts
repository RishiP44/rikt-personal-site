// Tabloid posts. Add a new object to publish a new entry.
export type Post = { slug: string; title: string; date: string; excerpt: string; body: string[] };

export const posts: Post[] = [
  {
    slug: "the-rock-is-the-point",
    title: "The Rock Is the Point",
    date: "2026-10-01",
    excerpt: "On choosing difficult work and finding joy in the repetition.",
    body: [
      "Camus ends his essay with a line that has stuck with me for years: one must imagine Sisyphus happy.",
      "This site is my attempt at that — a place to keep pushing, publicly, and see where the rock rolls.",
    ],
  },
  {
    slug: "first-issue",
    title: "Issue No. 1",
    date: "2026-09-12",
    excerpt: "Why I started a tabloid instead of a blog.",
    body: [
      "A blog sounds like a commitment. A tabloid sounds like fun. I'll write when I feel like it.",
    ],
  },
];
