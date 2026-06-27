import { $, $$ } from "./dom.js";

export function initLoop(loopCopy) {
  const loopSteps = $$(".loop-step");
  const loopLabel = $("#loop-label");
  const loopTitle = $("#loop-title");
  const loopBody = $("#loop-body");
  if (!loopSteps.length || !loopLabel || !loopTitle || !loopBody) return;

  function setLoopStep(index) {
    const item = loopCopy[index];
    if (!item) return;
    loopSteps.forEach(step => step.classList.toggle("active", Number(step.dataset.step) === index));
    loopLabel.textContent = item.label;
    loopTitle.textContent = item.title;
    loopBody.textContent = item.body;
  }

  loopSteps.forEach(step => {
    step.addEventListener("click", () => setLoopStep(Number(step.dataset.step)));
  });
}
