import { $$ } from "./dom.js";

export function initThemes(defaultTheme = "neon") {
  const themeButtons = $$("[data-set-theme]");

  function setTheme(theme) {
    document.body.dataset.theme = theme;
    themeButtons.forEach(button => {
      button.classList.toggle("active", button.dataset.setTheme === theme);
    });
  }

  themeButtons.forEach(button => {
    button.addEventListener("click", () => setTheme(button.dataset.setTheme));
  });

  setTheme(document.body.dataset.theme || defaultTheme);
}
