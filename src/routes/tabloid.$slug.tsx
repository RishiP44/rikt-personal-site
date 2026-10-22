import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { posts } from "@/lib/posts";

export const Route = createFileRoute("/tabloid/$slug")({
  loader: ({ params }) => {
    const post = posts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Tabloid / Rishi Patel` },
          { name: "description", content: loaderData.excerpt },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.excerpt },
          { property: "og:type", content: "article" },
        ]
      : [{ title: "Not found — Tabloid" }, { name: "robots", content: "noindex" }],
  }),
  component: PostPage,
});

function PostPage() {
  const post = Route.useLoaderData();
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-5 pb-32 pt-36 md:px-10">
      <Link to="/tabloid" className="label text-ember">
        ← Tabloid
      </Link>
      <h1 className="rise mt-6 text-5xl font-medium uppercase leading-[0.9] md:text-6xl">
        {post.title}
      </h1>
      <p className="label mt-6 text-muted-foreground">{post.date}</p>
      <div className="dashed-rule my-10" />
      <div className="rise space-y-6 text-xl leading-relaxed md:text-2xl">
        {post.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </main>
  );
}
