import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const fields = {
  title: z.string().trim().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(1),
  status: z.enum(["placeholder", "draft", "published"]),
};

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(parsed.valueOf()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, "Use a real calendar date in YYYY-MM-DD format.");

const projectSchema = z.object({
  ...fields,
  subtitle: z.string().optional(),
  tags: z.array(z.string()).optional(),
  order: z.number().int().positive().optional(),
});
const datedSchema = z
  .object({ ...fields, publishedDate: date.optional() })
  .refine(
    (entry) => entry.status !== "published" || Boolean(entry.publishedDate),
    {
      message: "Published entries require publishedDate.",
      path: ["publishedDate"],
    },
  );
const learningSchema = z
  .object({
    ...fields,
    publishedDate: date.optional(),
    subject: z.string().trim().min(1),
  })
  .refine(
    (entry) => entry.status !== "published" || Boolean(entry.publishedDate),
    {
      message: "Published entries require publishedDate.",
      path: ["publishedDate"],
    },
  );

export const collections = {
  projects: defineCollection({
    loader: glob({
      pattern: "**/*.md",
      base: "./src/content/projects",
      generateId: ({ entry }) => entry,
    }),
    schema: projectSchema,
  }),
  learning: defineCollection({
    loader: glob({
      pattern: "**/*.md",
      base: "./src/content/learning",
      generateId: ({ entry }) => entry,
    }),
    schema: learningSchema,
  }),
  writing: defineCollection({
    loader: glob({
      pattern: "**/*.md",
      base: "./src/content/writing",
      generateId: ({ entry }) => entry,
    }),
    schema: datedSchema,
  }),
};
