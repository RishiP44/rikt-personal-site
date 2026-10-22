import { createFileRoute } from "@tanstack/react-router";
import { Entry, PageShell } from "@/components/SiteHeader";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, follow" },
      { title: "Work — Rishi Patel" },
      { name: "description", content: "Rishi Patel's work experience and roles." },
      { property: "og:title", content: "Work — Rishi Patel" },
      { property: "og:description", content: "Rishi Patel's work experience and roles." },
    ],
  }),
  component: () => (
    <PageShell
      eyebrow="02 — Work"
      title="Where the days go"
      intro="Roles, teams and the problems I've helped solve."
    >
      <p className="label mb-8 rounded-xl border p-4 text-muted-foreground" data-content-notice>
        PLACEHOLDER — Example entries awaiting confirmed content.
      </p>
      <Entry
        meta="2024 — Now"
        title="Company Name"
        body="Role title. A line about what you build and the impact it has."
        tag="Current"
      />
      <Entry
        meta="2022 — 2024"
        title="Previous Company"
        body="Role title. What you owned, shipped and learned."
      />
      <Entry meta="2020 — 2022" title="First Role" body="Role title. Where it all started." />
    </PageShell>
  ),
});
