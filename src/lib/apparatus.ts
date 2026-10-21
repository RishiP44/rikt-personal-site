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
export function viewAt(progress: number) {
  const shots = [
    [-0.13, -0.35, 0.08],
    [0.1, 0.45, -0.06],
    [-0.15, -0.15, 0.03],
    [0.13, -0.7, -0.12],
    [-0.25, 0.85, 0.04],
    [0.28, -0.45, 0.18],
    [-0.13, -0.35, 0.08],
  ];
  const p = clamp(progress, 0, 1) * (shots.length - 1);
  const index = Math.min(Math.floor(p), shots.length - 2);
  const t = p - index;
  const eased = t * t * (3 - 2 * t);
  const from = shots[index],
    to = shots[index + 1];
  return {
    x: from[0] + (to[0] - from[0]) * eased,
    y: from[1] + (to[1] - from[1]) * eased,
    z: from[2] + (to[2] - from[2]) * eased,
  };
}

export const angleDifference = (from: number, to: number) =>
  Math.atan2(Math.sin(to - from), Math.cos(to - from));

export function chapterAt(
  position: number,
  sections: { id: string; top: number; height: number }[],
) {
  return (
    sections.findLast(
      (section) => position >= section.top - section.height * 0.35,
    )?.id ?? "drawing"
  );
}
