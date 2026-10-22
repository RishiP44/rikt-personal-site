import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteHeader";
import { posts } from "@/lib/posts";

export const Route = createFileRoute("/tabloid/")({
  head: () => ({
    meta: [
      { title: "Tabloid — Rishi Patel" },
      {
        name: "description",
        content: "Essays and notes by Rishi Patel, published whenever he feels like it.",
      },
      { property: "og:title", content: "Tabloid — Rishi Patel" },
      {
        property: "og:description",
        content: "Essays and notes, published whenever the mood strikes.",
      },
    ],
  }),
  component: () => (
    <PageShell
      eyebrow="05 — Tabloid"
      title="The Tabloid"
      intro="Essays, notes and half-formed thoughts. Published whenever I feel like it."
    >
      {posts.map((p) => (
        <Link
          key={p.slug}
          to="/tabloid/$slug"
          params={{ slug: p.slug }}
          className="group grid gap-3 border-b border-dashed py-8 md:grid-cols-[180px_1fr]"
        >
          <p className="label text-muted-foreground">
            {new Date(p.date).toLocaleDateString("en-GB", {
              timeZone: "UTC",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
          <div>
            <h3 className="text-3xl font-medium uppercase leading-none transition-colors group-hover:text-ember">
              {p.title}
            </h3>
            <p className="mt-3 font-serif text-xl italic text-muted-foreground">{p.excerpt}</p>
          </div>
        </Link>
      ))}
    </PageShell>
  ),
});
