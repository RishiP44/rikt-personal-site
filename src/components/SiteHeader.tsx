import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/** The rock travels round the ouroboros: top = day (the ascent), bottom = night (the descent). */
function RockToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Keep the theme usable when browser storage is unavailable.
    }
  };
  return (
    <button
      onClick={toggle}
      aria-label={
        dark
          ? "Push the rock up — switch to light mode"
          : "Let the rock roll down — switch to dark mode"
      }
      title={dark ? "Push the rock up" : "Let it roll down"}
      className="group flex items-center gap-3"
    >
      <span className="label hidden text-muted-foreground transition-colors group-hover:text-foreground sm:inline">
        {dark ? "The descent" : "The ascent"}
      </span>
      <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden>
        <circle
          cx="24"
          cy="24"
          r="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="3 2.2"
        />
        {/* serpent head biting tail at top */}
        <path d="M20 5.5 L27 7 L22 9.5 Z" fill="currentColor" />
        <g
          style={{
            transform: `rotate(${dark ? 180 : 0}deg)`,
            transformOrigin: "24px 24px",
            transition: "transform 1.1s cubic-bezier(.65,0,.35,1)",
          }}
        >
          <circle
            cx="24"
            cy="15"
            r="5"
            className="fill-ember transition-transform duration-300 group-hover:scale-110"
            style={{ transformOrigin: "24px 15px" }}
          />
        </g>
      </svg>
    </button>
  );
}

export function SiteHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 md:px-10">
      <Link to="/" className="label pointer-events-auto text-sm tracking-[0.12em]">
        Rishi Patel
      </Link>
      <div className="pointer-events-auto">
        <RockToggle />
      </div>
    </header>
  );
}

const PAGES = [
  { to: "/about", label: "About" },
  { to: "/work", label: "Work" },
  { to: "/projects", label: "Projects" },
  { to: "/learning", label: "Learning" },
  { to: "/tabloid", label: "Tabloid" },
] as const;

// Placeholder contact links — replace with real ones.
const CONTACT = [
  { href: "", label: "Email — forthcoming" },
  { href: "", label: "LinkedIn — forthcoming" },
  { href: "https://github.com/RishiP44", label: "GitHub" },
  { href: "", label: "X / Twitter — forthcoming" },
];

export function SiteFooter({ sprite }: { sprite: string }) {
  const reduced = useReducedMotion();
  // Climb path in viewBox units (1600 x 560)
  const climb = "M60 545 L1180 60";
  return (
    <footer className="overflow-hidden border-t border-dashed">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-10">
        <div>
          <p className="text-2xl font-medium uppercase">Rishi Patel</p>
          <p className="mt-3 max-w-xs text-muted-foreground">
            The endless push. Building, learning and writing — one boulder at a time.
          </p>
          <p className="label mt-4 text-muted-foreground">
            © {new Date().getFullYear()} Rishi Patel
          </p>
        </div>
        <div>
          <p className="label mb-4 text-ember">The machine</p>
          <ul className="space-y-2">
            {PAGES.map((p) => (
              <li key={p.to}>
                <Link
                  to={p.to}
                  className="opacity-75 transition-opacity hover:opacity-100"
                  activeProps={{
                    className: "!opacity-100 underline decoration-dashed underline-offset-4",
                  }}
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label mb-4 text-ember">Contact</p>
          <ul className="space-y-2">
            {CONTACT.map((c) => (
              <li key={c.label}>
                {c.href ? (
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="opacity-75 transition-opacity hover:opacity-100"
                  >
                    {c.label}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{c.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label mb-4 text-ember">Colophon</p>
          <p className="font-serif text-lg italic leading-snug text-muted-foreground">
            "The struggle itself toward the heights is enough to fill a man's heart."
          </p>
          <p className="label mt-2 text-muted-foreground">— Camus</p>
        </div>
      </div>

      <svg viewBox="0 0 1600 560" className="mt-6 block w-full text-foreground" aria-hidden>
        <defs>
          <pattern
            id="hatch"
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-35)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="7"
              stroke="currentColor"
              strokeWidth="1.1"
              opacity="0.45"
            />
          </pattern>
          <pattern
            id="hatch2"
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(40)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="5"
              stroke="currentColor"
              strokeWidth="0.8"
              opacity="0.3"
            />
          </pattern>
        </defs>
        {/* distant peak */}
        <path d="M900 560 L1250 140 L1340 210 L1450 90 L1600 220 L1600 560 Z" fill="url(#hatch2)" />
        {/* the hill */}
        <path
          d="M0 560 L60 545 L1180 60 L1230 52 L1290 75 L1600 300 L1600 560 Z"
          fill="url(#hatch)"
        />
        <path
          d="M0 560 L60 545 L1180 60 L1230 52 L1290 75 L1600 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* strata strokes */}
        {[0.25, 0.45, 0.65].map((t) => (
          <path
            key={t}
            d={`M${60 + 1120 * t} ${545 - 485 * t + 30} l140 -40 l90 10`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.6"
          />
        ))}
        <g transform={reduced ? "translate(60 545)" : undefined}>
          <image href={sprite} width="230" height="202" x="-14" y="-199" className="art" />
          {!reduced && (
            <animateMotion
              dur="16s"
              repeatCount="indefinite"
              path={climb}
              keyPoints="0;0.76;0.76;0"
              keyTimes="0;0.7;0.78;1"
              calcMode="linear"
            />
          )}
          {!reduced && (
            <animate
              attributeName="opacity"
              dur="16s"
              repeatCount="indefinite"
              values="1;1;0;0;1"
              keyTimes="0;0.72;0.76;0.98;1"
            />
          )}
        </g>
      </svg>
    </footer>
  );
}

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-5 pb-32 pt-36 md:px-10">
      <p className="label rise text-ember">{eyebrow}</p>
      <h1
        className="rise mt-4 text-5xl font-medium uppercase leading-[0.9] md:text-7xl"
        style={{ animationDelay: "60ms" }}
      >
        {title}
      </h1>
      {intro && (
        <p
          className="rise mt-8 max-w-2xl text-xl leading-snug text-muted-foreground md:text-2xl"
          style={{ animationDelay: "120ms" }}
        >
          {intro}
        </p>
      )}
      <div className="dashed-rule my-14" />
      <div className="rise" style={{ animationDelay: "180ms" }}>
        {children}
      </div>
    </main>
  );
}

export function Entry({
  meta,
  title,
  body,
  tag,
}: {
  meta: string;
  title: string;
  body: string;
  tag?: string;
}) {
  return (
    <div className="grid gap-3 border-b border-dashed py-8 md:grid-cols-[180px_1fr_auto] md:gap-10">
      <p className="label text-muted-foreground">{meta}</p>
      <div>
        <h3 className="text-2xl font-medium uppercase leading-none">{title}</h3>
        <p className="mt-3 text-lg leading-snug text-muted-foreground">{body}</p>
      </div>
      {tag && <p className="label text-ember">{tag}</p>}
    </div>
  );
}
