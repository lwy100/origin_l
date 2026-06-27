import { $ } from "./dom.js";

export function initInspiration(inspirations) {
  const sparkButton = $("#spark-button");
  const sparkCard = $("#spark-card");
  if (!sparkButton || !sparkCard || inspirations.length === 0) return;

  let inspirationIndex = 0;
  sparkButton.addEventListener("click", () => {
    inspirationIndex = (inspirationIndex + 1) % inspirations.length;
    sparkCard.textContent = inspirations[inspirationIndex];
  });
}
