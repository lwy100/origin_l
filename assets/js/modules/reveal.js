import { $$ } from "./dom.js";

export function initReveal() {
  const items = $$('[data-reveal], .section-shell:not(.hero) > *');
  if (!items.length || !("IntersectionObserver" in window)) return;

  items.forEach((item, index) => {
    item.classList.add("reveal-item");
    if (!item.style.getPropertyValue("--reveal-delay")) {
      item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 55}ms`);
    }
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

  items.forEach(item => observer.observe(item));
}
