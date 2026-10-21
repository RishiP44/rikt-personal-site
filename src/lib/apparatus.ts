export const chapters = [
  {
    id: "about",
    number: "01",
    label: "About",
    part: "The serpent",
    href: "/about/",
    description:
      "Identity is a process of returning, changing, and beginning again.",
  },
  {
    id: "work",
    number: "02",
    label: "Work",
    part: "The builder",
    href: "/work/",
    description: "Deliberate effort. The things I put into practice.",
  },
  {
    id: "projects",
    number: "03",
    label: "Projects",
    part: "The stone",
    href: "/projects/",
    description: "Ideas made tangible, one considered step at a time.",
  },
  {
    id: "learning",
    number: "04",
    label: "Learning",
    part: "The mountain",
    href: "/learning/",
    description: "The terrain changes as understanding grows.",
  },
  {
    id: "writing",
    number: "05",
    label: "Writing",
    part: "The record",
    href: "/writing/",
    description: "Leaving a mark. Making room for a thought to take shape.",
  },
  {
    id: "contact",
    number: "06",
    label: "Contact",
    part: "The return",
    href: "/contact/",
    description: "Every ending can be the beginning of a conversation.",
  },
] as const;

export type ChapterId = (typeof chapters)[number]["id"];
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
