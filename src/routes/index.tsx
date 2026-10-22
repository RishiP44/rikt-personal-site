import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import art from "@/assets/sisyphus.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rishi Patel — The Endless Push" },
      {
        name: "description",
        content: "Rishi Patel's personal site: work, projects, learning and the Tabloid.",
      },
      { property: "og:title", content: "Rishi Patel — The Endless Push" },
      {
        property: "og:description",
        content: "Work, projects, learning and writing by Rishi Patel.",
      },
    ],
  }),
  component: Index,
});

// Focal points in % of the artwork; s = zoom scale
const KEYS = [
  { fx: 50, fy: 50, s: 0.85 }, // intro — whole machine
  { fx: 51, fy: 64, s: 3 }, // About — Sisyphus
  { fx: 71, fy: 54, s: 2.8 }, // Work — the rock
  { fx: 10, fy: 50, s: 2.6 }, // Projects — the serpent's coils
  { fx: 50, fy: 11, s: 2.6 }, // Learning — the serpent's eye
  { fx: 50, fy: 50, s: 0.85 }, // Tabloid — the full cycle
];

type Chapter = {
  no: string;
  title: string;
  body: string;
  page?: string;
  to?: "/about" | "/work" | "/projects" | "/learning" | "/tabloid";
};
const CHAPTERS: Chapter[] = [
  {
    no: "00",
    title: "The Endless Push",
    body: "Every part of this machine is a door. Scroll to travel through it.",
  },
  {
    no: "01",
    title: "The One Who Pushes",
    body: "Me — curious, stubborn, learning in public, one step at a time.",
    page: "About",
    to: "/about",
  },
  {
    no: "02",
    title: "The Rock",
    body: "The weight worth carrying. The work I've chosen and the teams I've pushed with.",
    page: "Work",
    to: "/work",
  },
  {
    no: "03",
    title: "The Coils",
    body: "Each scale a thing I've built. Projects, experiments, side quests.",
    page: "Projects",
    to: "/projects",
  },
  {
    no: "04",
    title: "The Eye",
    body: "Always watching, always learning. What I'm studying right now.",
    page: "Learning",
    to: "/learning",
  },
  {
    no: "05",
    title: "The Cycle",
    body: "The end feeds the beginning. Notes and essays, published whenever I feel like it.",
    page: "Tabloid",
    to: "/tabloid",
  },
];

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function Index() {
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      setP(Math.min(1, Math.max(0, -r.top / total)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const seg = p * (KEYS.length - 1);
  const i = Math.min(KEYS.length - 2, Math.floor(seg));
  const local = seg - i;
  // hold on each chapter, move between them
  const t = ease(Math.min(1, Math.max(0, (local - 0.35) / 0.65)));
  const a = KEYS[i]!,
    b = KEYS[i + 1]!;
  const fx = reduced ? 50 : a.fx + (b.fx - a.fx) * t;
  const fy = reduced ? 50 : a.fy + (b.fy - a.fy) * t;
  const s = reduced ? 0.85 : a.s + (b.s - a.s) * t;
  const active = Math.round(seg);

  return (
    <main id="main" tabIndex={-1}>
      <div ref={wrap} style={{ height: `${CHAPTERS.length * 100}vh` }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="aspect-square h-[min(88vh,92vw)]"
              style={{
                transform: `scale(${s}) translate(${50 - fx}%, ${50 - fy}%)`,
                willChange: "transform",
              }}
            >
              <img
                src={art}
                alt="Sisyphus pushing a boulder inside an ouroboros"
                width={1024}
                height={1024}
                className="art h-full w-full select-none object-contain"
                draggable={false}
              />
            </div>
          </div>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 35%, var(--background) 85%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[55vh]"
            style={{
              background:
                "linear-gradient(to top, var(--background) 0%, color-mix(in oklab, var(--background) 88%, transparent) 40%, transparent 100%)",
            }}
          />

          <span
            className="label absolute right-3 top-1/2 hidden origin-center translate-x-1/2 rotate-90 text-muted-foreground md:block"
            style={{ right: "1.5rem" }}
          >
            R.P. — Vol. 01
          </span>

          {CHAPTERS[active]?.to && (
            <Link
              to={CHAPTERS[active]!.to!}
              aria-label={`Open ${CHAPTERS[active]!.page}`}
              className="absolute left-1/2 top-1/2 h-[40vh] w-[40vh] -translate-x-1/2 -translate-y-1/2 cursor-zoom-in rounded-full"
            />
          )}

          {CHAPTERS.map((c, k) => (
            <div
              key={c.no}
              className="absolute inset-x-5 bottom-10 grid gap-4 transition-all duration-700 md:inset-x-10 md:bottom-14 md:grid-cols-2 md:items-end"
              style={{
                opacity: active === k ? 1 : 0,
                pointerEvents: active === k ? "auto" : "none",
                transform: `translateY(${active === k ? 0 : active > k ? -20 : 20}px)`,
                filter: active === k ? "none" : "blur(6px)",
              }}
              aria-hidden={active !== k}
            >
              <div>
                <p className="label text-ember">
                  {c.no} / 05{c.page ? ` — ${c.page}` : ""}
                </p>
                {k === 0 ? (
                  <h1 className="mt-3 text-5xl font-medium uppercase leading-[0.9] md:text-7xl">
                    {c.title}
                  </h1>
                ) : (
                  <h2 className="mt-3 text-5xl font-medium uppercase leading-[0.9] md:text-7xl">
                    {c.title}
                  </h2>
                )}
              </div>
              <div className="md:justify-self-end">
                <p className="max-w-md text-xl leading-snug text-foreground/85 md:text-2xl">
                  {c.body}
                </p>
                {c.to && (
                  <Link
                    to={c.to}
                    tabIndex={active === k ? 0 : -1}
                    className="label mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground transition-transform hover:scale-105"
                  >
                    Enter {c.page} →
                  </Link>
                )}
              </div>
            </div>
          ))}

          <div className="absolute left-5 top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:left-10 md:flex">
            {CHAPTERS.map((c, k) => (
              <button
                key={c.no}
                aria-label={c.page ?? "Intro"}
                onClick={() => {
                  const el = wrap.current;
                  if (el)
                    window.scrollTo({
                      top:
                        el.offsetTop +
                        (k / (CHAPTERS.length - 1)) * (el.offsetHeight - window.innerHeight),
                      behavior: reduced ? "auto" : "smooth",
                    });
                }}
                className="group flex items-center gap-3 py-1"
              >
                <span
                  className="h-px bg-foreground transition-all duration-500"
                  style={{ width: active === k ? 32 : 12, opacity: active === k ? 1 : 0.35 }}
                />
                <span className="label opacity-0 transition-opacity group-hover:opacity-70">
                  {c.page ?? "Intro"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
