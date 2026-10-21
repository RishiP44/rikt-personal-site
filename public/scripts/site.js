(() => {
  const root = document.documentElement;
  const switcher = document.querySelector(".theme-switch");
  function apply(theme) {
    root.dataset.theme = theme;
    switcher?.setAttribute(
      "aria-label",
      "Switch to " + (theme === "dark" ? "light" : "dark") + " mode",
    );
    switcher?.setAttribute("aria-pressed", String(theme === "dark"));
  }
  apply(root.dataset.theme === "dark" ? "dark" : "light");
  if (switcher) switcher.hidden = false;
  switcher?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    apply(next);
    try {
      localStorage.setItem("rikt-theme", next);
    } catch {}
  });
})();
