import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Rishi Patel" },
      { name: "description", content: "Who Rishi Patel is and what drives him." },
      { property: "og:title", content: "About — Rishi Patel" },
      { property: "og:description", content: "Who Rishi Patel is and what drives him." },
    ],
  }),
  component: () => (
    <PageShell
      eyebrow="01 — About"
      title="The one who pushes"
      intro="I'm Rishi — a builder who believes the climb is the reward. I make things, break things, and write about it."
    >
      <div className="grid gap-10 text-xl leading-relaxed text-muted-foreground md:grid-cols-2">
        <p>
          I care about craft, clarity and the quiet satisfaction of shipping something well. Most
          days I'm learning something new and trying to apply it the same week.
        </p>
        <p>
          Outside of work you'll find me reading philosophy, sketching ideas, and occasionally
          publishing them in the <span className="text-ember">Tabloid</span>.
        </p>
      </div>
    </PageShell>
  ),
});
