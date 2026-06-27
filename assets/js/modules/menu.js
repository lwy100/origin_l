import { $ } from "./dom.js";

export function initMenu() {
  const menuButton = $(".menu-button");
  const nav = $(".site-nav");
  if (!menuButton || !nav) return;

  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", event => {
    if (event.target.tagName === "A") {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}
