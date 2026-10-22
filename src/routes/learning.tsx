import { createFileRoute } from "@tanstack/react-router";
import { Entry, PageShell } from "@/components/SiteHeader";

export const Route = createFileRoute("/learning")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, follow" },
      { title: "Learning — Rishi Patel" },
      { name: "description", content: "What Rishi Patel is currently studying and reading." },
      { property: "og:title", content: "Learning — Rishi Patel" },
      {
        property: "og:description",
        content: "What Rishi Patel is currently studying and reading.",
      },
    ],
  }),
  component: () => (
    <PageShell
      eyebrow="04 — Learning"
      title="Still climbing"
      intro="A living list of what I'm studying, reading and practising."
    >
      <p className="label mb-8 rounded-xl border p-4 text-muted-foreground" data-content-notice>
        PLACEHOLDER — Example entries awaiting confirmed content.
      </p>
      <Entry
        meta="Reading"
        title="The Myth of Sisyphus"
        body="Albert Camus — on absurdity and finding meaning anyway."
        tag="In progress"
      />
      <Entry
        meta="Course"
        title="A Topic You're Studying"
        body="Where you're learning it and why it matters to you."
      />
      <Entry
        meta="Practice"
        title="A Skill You're Building"
        body="How often, and what progress looks like."
      />
    </PageShell>
  ),
});
