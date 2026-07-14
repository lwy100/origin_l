import { $, $$ } from "./dom.js";

const CELL_WIDTH = 192;
const CELL_HEIGHT = 208;

const STATES = {
  idle: { row: 0, frames: 6, durations: [280, 110, 110, 140, 140, 320], loop: true, label: "桃桃正在花园里发呆" },
  wave: { row: 3, frames: 4, durations: [140, 140, 140, 280], loop: false, label: "桃桃在向你挥手" },
  jump: { row: 4, frames: 5, durations: [140, 140, 140, 140, 280], loop: false, label: "桃桃开心地跳了一下" },
  failed: { row: 5, frames: 8, durations: [140, 140, 140, 140, 140, 140, 140, 240], loop: false, label: "桃桃需要一点安慰" },
  waiting: { row: 6, frames: 6, durations: [150, 150, 150, 150, 150, 260], loop: true, label: "桃桃在等你选一个互动" },
  thinking: { row: 7, frames: 6, durations: [120, 120, 120, 120, 120, 220], loop: true, label: "桃桃正在认真想路线" },
  review: { row: 8, frames: 6, durations: [150, 150, 150, 150, 150, 280], loop: false, label: "桃桃陪你一起看地图" }
};

const LOOK_ROWS = [
  { row: 9, start: 0 },
  { row: 10, start: 8 }
];

export function initPet() {
  const stage = $("#pet-stage");
  const character = $("#pet-character");
  const sprite = $("#pet-sprite");
  const status = $("#pet-status");
  const actionButtons = $$('[data-pet-action]');
  if (!stage || !character || !sprite || !status) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let state = "idle";
  let frame = 0;
  let timer = 0;
  let actionToken = 0;
  let lookTimer = 0;
  let lastPointer = { x: 0, y: 0 };

  function draw(row, column) {
    sprite.style.setProperty("--pet-x", `${-column * CELL_WIDTH}px`);
    sprite.style.setProperty("--pet-y", `${-row * CELL_HEIGHT}px`);
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function clearTimer() {
    window.clearTimeout(timer);
    timer = 0;
  }

  function play(name, { returnToIdle = true } = {}) {
    const config = STATES[name];
    window.clearTimeout(lookTimer);
    if (!config) return;
    actionToken += 1;
    const token = actionToken;
    clearTimer();
    state = name;
    frame = 0;
    stage.dataset.petState = name;
    setStatus(config.label);

    function step() {
      if (token !== actionToken) return;
      draw(config.row, frame);
      const duration = reducedMotion.matches ? Math.max(config.durations[frame], 500) : config.durations[frame];
      timer = window.setTimeout(() => {
        frame += 1;
        if (frame >= config.frames) {
          if (config.loop) frame = 0;
          else if (returnToIdle) {
            play("idle");
            return;
          } else frame = config.frames - 1;
        }
        step();
      }, duration);
    }

    step();
  }

  function showLookDirection(clientX, clientY) {
    if (reducedMotion.matches || state !== "idle") return;
    const rect = stage.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy);
    if (distance < Math.min(rect.width, rect.height) * 0.15) return;

    const angle = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
    const direction = Math.round(angle / 22.5) % 16;
    const look = direction < 8 ? LOOK_ROWS[0] : LOOK_ROWS[1];
    actionToken += 1;
    clearTimer();
    draw(look.row, direction - look.start);
    setStatus("桃桃正看着你");
    window.clearTimeout(lookTimer);
    lookTimer = window.setTimeout(() => play("idle"), 680);
  }

  function react(name) {
    stage.classList.remove("pet-pop");
    void stage.offsetWidth;
    stage.classList.add("pet-pop");
    play(name);
  }

  window.addEventListener("pointermove", event => {
    lastPointer = { x: event.clientX, y: event.clientY };
    showLookDirection(event.clientX, event.clientY);
  }, { passive: true });

  character.addEventListener("click", () => {
    const choices = ["wave", "jump", "waiting"];
    react(choices[Math.floor(Math.random() * choices.length)]);
  });

  actionButtons.forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.petAction;
      react(action === "review" ? "review" : action);
    });
  });

  $("#spark-button")?.addEventListener("click", () => react("jump"));
  $$('[data-set-theme]').forEach(button => button.addEventListener("click", () => react("wave")));
  $$('[data-refresh-recommendations]').forEach(button => {
    button.addEventListener("click", () => {
      play("thinking");
      window.setTimeout(() => {
        if (state === "thinking") play("review");
      }, 1100);
    });
  });
  $("#place-grid")?.addEventListener("click", event => {
    if (event.target.closest('[data-action="visit"]')) react("jump");
    if (event.target.closest('[data-action="toggle-comments"]')) play("waiting");
  });

  stage.addEventListener("animationend", () => stage.classList.remove("pet-pop"));
  stage.addEventListener("pointerleave", () => {
    if (state === "idle") play("idle");
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearTimer();
    else play("idle");
  });

  reducedMotion.addEventListener?.("change", () => play("idle"));
  draw(0, 0);
  play("idle");

  window.setTimeout(() => {
    if (state === "idle") play("waiting");
  }, 9000);

  window.addEventListener("focus", () => {
    if (lastPointer.x || lastPointer.y) showLookDirection(lastPointer.x, lastPointer.y);
  });
}
