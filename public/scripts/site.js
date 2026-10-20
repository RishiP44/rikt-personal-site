(() => {
  const root = document.documentElement;
  const switcher = document.querySelector(".theme-switch");
  if (switcher) switcher.hidden = false;
  function applyTheme(theme) {
    root.dataset.theme = theme;
    switcher?.setAttribute(
      "aria-label",
      `Pull cord to switch to ${theme === "dark" ? "light" : "dark"} mode`,
    );
    switcher?.setAttribute("aria-pressed", String(theme === "dark"));
    const hint = switcher?.querySelector(".switch-hint");
    if (hint)
      hint.textContent = theme === "dark" ? "LET THERE BE LIGHT" : "LIGHTS OUT";
  }
  let stored;
  try {
    stored = localStorage.getItem("rikt-theme");
  } catch {}
  applyTheme(stored === "dark" ? "dark" : "light");
  let timer;
  switcher?.addEventListener("click", () => {
    clearTimeout(timer);
    switcher.classList.add("pulling");
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem("rikt-theme", next);
    } catch {}
    timer = setTimeout(() => switcher.classList.remove("pulling"), 250);
  });
  switcher?.addEventListener("pointerdown", (e) => {
    switcher.setPointerCapture(e.pointerId);
    switcher.classList.add("pulling");
  });
  switcher?.addEventListener("pointerup", () => {
    switcher.classList.remove("pulling");
  });
  switcher?.addEventListener("pointercancel", () => {
    switcher.classList.remove("pulling");
  });
  const status = document.querySelector(".drawing-status");
  const defaultStatus = status?.textContent;
  document.querySelectorAll(".machine .part").forEach((part) => {
    const show = () => {
      if (status) status.textContent = part.dataset.description;
    };
    const reset = () => {
      if (status) status.textContent = defaultStatus;
    };
    part.addEventListener("pointerenter", show);
    part.addEventListener("pointerleave", reset);
    part.addEventListener("focus", show);
    part.addEventListener("blur", reset);
  });
  const dots = document.querySelectorAll(".page-dots a");
  if (dots.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            dots.forEach((dot) =>
              dot.setAttribute(
                "aria-current",
                String(dot.hash === "#" + entry.target.id),
              ),
            );
        }),
      { threshold: 0.55 },
    );
    document
      .querySelectorAll(".screen")
      .forEach((section) => observer.observe(section));
  }
})();
