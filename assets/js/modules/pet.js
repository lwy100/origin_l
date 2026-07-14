import { $, $$ } from "./dom.js";

const CELL_WIDTH = 192;
const CELL_HEIGHT = 208;
const DIRECTION_STEP = 22.5;
const DIRECTION_LABELS = [
  "上方", "右上方", "右上方", "右侧", "右侧", "右下方", "右下方", "下方",
  "下方", "左下方", "左下方", "左侧", "左侧", "左上方", "左上方", "上方"
];

const STATES = {
  idle: { row: 0, frames: 6, durations: [280, 110, 110, 140, 140, 320], label: "桃桃正在花园里发呆" },
  wave: { row: 3, frames: 4, durations: [140, 140, 140, 280], label: "桃桃在向你挥手" },
  jump: { row: 4, frames: 5, durations: [140, 140, 140, 140, 280], label: "桃桃开心地跳了一下" },
  failed: { row: 5, frames: 8, durations: [140, 140, 140, 140, 140, 140, 140, 240], label: "桃桃需要一点安慰" },
  waiting: { row: 6, frames: 6, durations: [150, 150, 150, 150, 150, 260], label: "桃桃在等你选一个互动" },
  thinking: { row: 7, frames: 6, durations: [120, 120, 120, 120, 120, 220], label: "桃桃正在认真想路线" },
  review: { row: 8, frames: 6, durations: [150, 150, 150, 150, 150, 280], label: "桃桃陪你一起看地图" }
};

export function initPet() {
  const stage = $("#pet-stage");
  const character = $("#pet-character");
  const sprite = $("#pet-sprite");
  const floor = $(".pet-floor", stage);
  const status = $("#pet-status");
  const actionButtons = $$('[data-pet-action]');
  if (!stage || !character || !sprite || !floor || !status) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer = 0;
  let sequenceToken = 0;
  let actionActive = false;
  let moving = false;
  let hasPointer = false;
  let lastDirection = -1;
  let lastPointer = { x: 0, y: 0 };
  let settleTimer = 0;

  function draw(row, column, flipped = false) {
    sprite.style.setProperty("--pet-x", `${-column * CELL_WIDTH}px`);
    sprite.style.setProperty("--pet-y", `${-row * CELL_HEIGHT}px`);
    sprite.style.setProperty("--pet-flip", flipped ? "-1" : "1");
    stage.dataset.petRow = String(row);
    stage.dataset.petColumn = String(column);
    stage.dataset.petFlipped = String(flipped);
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function stopSequence() {
    sequenceToken += 1;
    window.clearTimeout(timer);
    timer = 0;
  }

  function clearSettleTimer() {
    window.clearTimeout(settleTimer);
    settleTimer = 0;
  }

  function settleFacingFront() {
    if (actionActive || moving || !hasPointer) return;
    stopSequence();
    lastDirection = -1;
    draw(0, 0);
    stage.dataset.petState = "front";
    delete stage.dataset.petDirection;
    setStatus("桃桃正看着你");
  }

  function scheduleSettle() {
    clearSettleTimer();
    settleTimer = window.setTimeout(settleFacingFront, 800);
  }

  function startIdle() {
    if (actionActive || moving) return;
    stopSequence();
    lastDirection = -1;
    stage.dataset.petState = "idle";
    delete stage.dataset.petDirection;
    setStatus("桃桃正看着你");
    const token = sequenceToken;
    let frame = 0;

    function step() {
      if (token !== sequenceToken || actionActive || moving) return;
      draw(STATES.idle.row, frame);
      const baseDuration = STATES.idle.durations[frame];
      const duration = reducedMotion.matches ? Math.max(baseDuration, 600) : baseDuration;
      timer = window.setTimeout(() => {
        frame = (frame + 1) % STATES.idle.frames;
        step();
      }, duration);
    }

    step();
  }

  function directionFromPointer(clientX, clientY) {
    const rect = character.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height * 0.42;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const deadzone = Math.max(12, Math.min(rect.width, rect.height) * 0.055);
    if (Math.hypot(dx, dy) <= deadzone) return -1;

    const angle = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
    return Math.round(angle / DIRECTION_STEP) % 16;
  }

  function drawDirection(direction) {
    // The source atlas has reliable up/right/down poses, but its left-facing cells
    // still face right. Mirror the matching right pose to provide a true 360° turn.
    if (direction === 8) {
      draw(10, 0);
      return;
    }
    if (direction > 8) {
      const mirroredDirection = 16 - direction;
      draw(9, mirroredDirection, true);
      return;
    }
    draw(9, direction);
  }

  function renderLook(clientX, clientY, { force = false } = {}) {
    if (actionActive || moving || !hasPointer) return;
    const direction = directionFromPointer(clientX, clientY);
    if (direction < 0) {
      if (stage.dataset.petState !== "idle") startIdle();
      return;
    }
    if (!force && direction === lastDirection && stage.dataset.petState === "look") return;

    stopSequence();
    lastDirection = direction;
    drawDirection(direction);
    stage.dataset.petState = "look";
    stage.dataset.petDirection = String(direction);
    setStatus(`桃桃正看向${DIRECTION_LABELS[direction]}`);
    scheduleSettle();
  }

  function restoreLookOrIdle() {
    actionActive = false;
    clearSettleTimer();
    moving = false;
    character.classList.remove("is-moving");
    floor.classList.remove("is-moving");
    if (hasPointer) renderLook(lastPointer.x, lastPointer.y, { force: true });
    else startIdle();
  }

  function playAction(name, { cycles = 1, onComplete } = {}) {
    const config = STATES[name];
    clearSettleTimer();
    if (!config) return;
    stopSequence();
    actionActive = true;
    moving = false;
    lastDirection = -1;
    stage.dataset.petState = name;
    delete stage.dataset.petDirection;
    setStatus(config.label);
    const token = sequenceToken;
    let frame = 0;
    let completedCycles = 0;

    function step() {
      if (token !== sequenceToken) return;
      draw(config.row, frame);
      const baseDuration = config.durations[frame];
      const duration = reducedMotion.matches ? Math.max(baseDuration, 450) : baseDuration;
      timer = window.setTimeout(() => {
        frame += 1;
        if (frame >= config.frames) {
          frame = 0;
          completedCycles += 1;
          if (completedCycles >= cycles) {
            actionActive = false;
            if (onComplete) onComplete();
            else restoreLookOrIdle();
            return;
          }
        }
        step();
      }, duration);
    }

    step();
  }

  function moveTo(clientX, clientY) {
    clearSettleTimer();
    const rect = stage.getBoundingClientRect();
    const currentRect = character.getBoundingClientRect();
    const quoteRect = $("#quote-card")?.getBoundingClientRect();
    const quoteSafeTop = quoteRect
      ? quoteRect.top - rect.top - currentRect.height / 2 - 14
      : rect.height - 104;
    const maxTargetY = Math.max(150, Math.min(rect.height - 104, quoteSafeTop));
    const targetX = Math.max(92, Math.min(rect.width - 92, clientX - rect.left));
    const targetY = Math.max(150, Math.min(maxTargetY, clientY - rect.top));
    const currentX = currentRect.left + currentRect.width / 2 - rect.left;
    const distance = Math.hypot(targetX - currentX, targetY - (currentRect.top + currentRect.height / 2 - rect.top));
    const duration = reducedMotion.matches ? 0 : Math.max(360, Math.min(1100, distance * 2.4));
    const movingLeft = targetX < currentX;

    stopSequence();
    actionActive = false;
    moving = true;
    lastDirection = -1;
    stage.dataset.petState = "moving";
    delete stage.dataset.petDirection;
    setStatus(movingLeft ? "桃桃正在往左边走" : "桃桃正在往右边走");
    character.classList.add("is-moving");
    floor.classList.add("is-moving");
    character.style.setProperty("--pet-move-duration", `${duration}ms`);
    floor.style.setProperty("--pet-move-duration", `${duration}ms`);
    character.style.setProperty("--pet-left", `${targetX}px`);
    character.style.setProperty("--pet-top", `${targetY}px`);
    floor.style.setProperty("--pet-left", `${targetX}px`);
    floor.style.setProperty("--pet-top", `${targetY + 88}px`);

    if (!duration) {
      restoreLookOrIdle();
      return;
    }

    const token = sequenceToken;
    const row = movingLeft ? 2 : 1;
    let frame = 0;
    const startedAt = performance.now();

    function step(now = performance.now()) {
      if (token !== sequenceToken || !moving) return;
      draw(row, frame);
      frame = (frame + 1) % 8;
      if (now - startedAt >= duration) {
        restoreLookOrIdle();
        return;
      }
      timer = window.setTimeout(() => step(performance.now()), 120);
    }

    step();
  }

  function react(name, options) {
    stage.classList.remove("pet-pop");
    void stage.offsetWidth;
    stage.classList.add("pet-pop");
    playAction(name, options);
  }

  window.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") return;
    hasPointer = true;
    lastPointer = { x: event.clientX, y: event.clientY };
    renderLook(event.clientX, event.clientY);
    scheduleSettle();
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () => {
    hasPointer = false;
    clearSettleTimer();
    if (!actionActive && !moving) startIdle();
  });

  window.addEventListener("resize", () => {
    if (hasPointer && !actionActive && !moving) renderLook(lastPointer.x, lastPointer.y, { force: true });
  }, { passive: true });

  stage.addEventListener("click", event => {
    if (event.target.closest("button, .quote-card")) return;
    hasPointer = true;
    lastPointer = { x: event.clientX, y: event.clientY };
    moveTo(event.clientX, event.clientY);
  });

  character.addEventListener("click", event => {
    event.stopPropagation();
    const choices = ["wave", "jump", "waiting"];
    react(choices[Math.floor(Math.random() * choices.length)]);
  });

  character.addEventListener("pointerdown", event => {
    if (event.pointerType !== "touch") return;
    hasPointer = true;
    lastPointer = { x: event.clientX, y: event.clientY };
  });

  actionButtons.forEach(button => {
    button.addEventListener("click", () => react(button.dataset.petAction));
  });

  $("#spark-button")?.addEventListener("click", () => react("jump"));
  $$('[data-set-theme]').forEach(button => button.addEventListener("click", () => react("wave")));
  $$('[data-refresh-recommendations]').forEach(button => {
    button.addEventListener("click", () => {
      playAction("thinking", { onComplete: () => playAction("review") });
    });
  });
  $("#place-grid")?.addEventListener("click", event => {
    if (event.target.closest('[data-action="visit"]')) react("jump");
    if (event.target.closest('[data-action="toggle-comments"]')) playAction("waiting");
  });

  stage.addEventListener("animationend", () => stage.classList.remove("pet-pop"));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopSequence();
      clearSettleTimer();
    } else restoreLookOrIdle();
  });
  reducedMotion.addEventListener?.("change", restoreLookOrIdle);

  startIdle();
}
