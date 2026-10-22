import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { posts } from "@/lib/posts";
describe("Accepted site routes", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
  for (const route of ["/", "/about", "/work", "/projects", "/learning", "/tabloid/", "/404"]) {
    it("matches " + route, () => {
      expect(router.matchRoutes(route).at(-1)?.routeId).not.toBe("__root__");
    });
  }
  it("keeps supplied article URLs unique and reachable", () => {
    expect(new Set(posts.map((post) => post.slug)).size).toBe(posts.length);
    for (const post of posts) {
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isFinite(Date.parse(post.date))).toBe(true);
      expect(router.matchRoutes("/tabloid/" + post.slug).at(-1)?.routeId).toBe("/tabloid/$slug");
    }
  });
});
