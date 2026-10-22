import { createFileRoute, Link } from "@tanstack/react-router";
export const Route = createFileRoute("/404")({
  head: () => ({
    meta: [
      { title: "Page not found — Rishi Patel" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: () => (
    <main id="main" tabIndex={-1} className="mx-auto min-h-screen max-w-3xl px-5 pb-32 pt-36">
      <h1 className="text-7xl font-bold">404</h1>
      <p className="mt-4 text-xl">Page not found</p>
      <Link to="/" className="label mt-6 inline-block text-ember">
        Go home →
      </Link>
    </main>
  ),
});
