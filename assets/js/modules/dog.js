import { $ } from "./dom.js";

export function initDog() {
  const stage = $("#dog-stage");
  const head = $("#dog-head");
  if (!stage || !head) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  function render() {
    currentX += (targetX - currentX) * 0.14;
    currentY += (targetY - currentY) * 0.14;
    head.style.setProperty("--look-x", `${currentX.toFixed(2)}deg`);
    head.style.setProperty("--look-y", `${currentY.toFixed(2)}deg`);
    stage.style.setProperty("--pupil-x", `${(currentX * 0.26).toFixed(2)}px`);
    stage.style.setProperty("--pupil-y", `${(currentY * 0.18).toFixed(2)}px`);

    if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
      frame = requestAnimationFrame(render);
    } else {
      frame = 0;
    }
  }

  function moveTo(clientX, clientY) {
    if (reducedMotion.matches) return;
    const rect = stage.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    targetX = Math.max(-1, Math.min(1, x)) * 13;
    targetY = Math.max(-1, Math.min(1, y)) * -8;
    if (!frame) frame = requestAnimationFrame(render);
  }

  window.addEventListener("pointermove", event => moveTo(event.clientX, event.clientY), { passive: true });
  document.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
    if (!frame) frame = requestAnimationFrame(render);
  });

  stage.addEventListener("pointerdown", event => {
    moveTo(event.clientX, event.clientY);
    stage.classList.remove("is-happy");
    void stage.offsetWidth;
    stage.classList.add("is-happy");
  });

  stage.addEventListener("animationend", event => {
    if (event.animationName === "dog-bounce") stage.classList.remove("is-happy");
  });
}
