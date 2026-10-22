import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteHeader";

const PROJECTS = [
  {
    n: "Project One",
    y: "2026",
    d: "A short description of what it is and why it exists.",
    t: "Web",
  },
  { n: "Project Two", y: "2025", d: "Another experiment, tool or product you built.", t: "AI" },
  {
    n: "Project Three",
    y: "2025",
    d: "Something small that taught you something big.",
    t: "Design",
  },
  { n: "Project Four", y: "2024", d: "An old favourite worth keeping around.", t: "Open source" },
];

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, follow" },
      { title: "Projects — Rishi Patel" },
      { name: "description", content: "Things Rishi Patel has built." },
      { property: "og:title", content: "Projects — Rishi Patel" },
      { property: "og:description", content: "Things Rishi Patel has built." },
    ],
  }),
  component: () => (
    <PageShell
      eyebrow="03 — Projects"
      title="Rocks I've rolled"
      intro="Side projects, experiments and things built for the joy of it."
    >
      <p className="label mb-8 rounded-xl border p-4 text-muted-foreground" data-content-notice>
        PLACEHOLDER — Example entries awaiting confirmed content.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {PROJECTS.map((p) => (
          <article
            key={p.n}
            className="group rounded-xl border bg-card p-6 transition-transform duration-500 hover:-translate-y-1"
          >
            <div className="flex justify-between">
              <span className="label text-ember">{p.t}</span>
              <span className="label text-muted-foreground">{p.y}</span>
            </div>
            <div className="dashed-rule my-5" />
            <h3 className="text-3xl font-medium uppercase leading-none">{p.n}</h3>
            <p className="mt-3 text-lg text-muted-foreground">{p.d}</p>
          </article>
        ))}
      </div>
    </PageShell>
  ),
});
