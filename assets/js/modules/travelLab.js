import { $, $$ } from "./dom.js";

const STORE_KEY = "signalGardenTravelLab";

function loadStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    return {
      visited: parsed.visited || {},
      likes: parsed.likes || {},
      comments: parsed.comments || {},
      openComments: {}
    };
  } catch {
    return { visited: {}, likes: {}, comments: {}, openComments: {} };
  }
}

function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify({
    visited: store.visited,
    likes: store.likes,
    comments: store.comments
  }));
}

function flattenPlaces(placesByRegion) {
  return Object.values(placesByRegion).flat();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[char]));
}

function placeKey(place) {
  return `${place.province}-${place.city}-${place.name}`;
}

function formatTime(ts) {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
}

export function initTravelLab(placesByRegion) {
  const tabs = $("#region-tabs");
  const grid = $("#place-grid");
  const visitedCount = $("#visited-count");
  const placeCount = $("#place-count");
  const wishlistCount = $("#wishlist-count");
  if (!tabs || !grid || !visitedCount || !placeCount || !wishlistCount) return;

  const regions = Object.keys(placesByRegion);
  let currentRegion = regions[0];
  const store = loadStore();

  function updateStats() {
    const total = flattenPlaces(placesByRegion).length;
    const visitedTotal = Object.values(store.visited).filter(Boolean).length;
    visitedCount.textContent = visitedTotal;
    placeCount.textContent = total;
    wishlistCount.textContent = Math.max(total - visitedTotal, 0);
  }

  function renderTabs() {
    tabs.innerHTML = regions.map(region => `
      <button class="region-tab ${region === currentRegion ? "active" : ""}" type="button" data-region="${escapeHtml(region)}">
        ${escapeHtml(region)}
      </button>
    `).join("");
  }

  function renderCommentList(key) {
    const comments = store.comments[key] || [];
    if (!comments.length) return `<p class="comment-empty">还没有留言，来当第一个种草的人。</p>`;
    return comments.slice().reverse().map(comment => `
      <div class="comment-item">
        <div><b>${escapeHtml(comment.name || "匿名旅人")}</b><span>${formatTime(comment.ts)}</span></div>
        <p>${escapeHtml(comment.text)}</p>
      </div>
    `).join("");
  }

  function renderPlaces() {
    const list = placesByRegion[currentRegion] || [];
    grid.innerHTML = list.map(place => {
      const key = placeKey(place);
      const isVisited = Boolean(store.visited[key]);
      const liked = Boolean(store.likes[key]);
      const comments = store.comments[key] || [];
      const commentsOpen = Boolean(store.openComments[key]);
      return `
        <article class="place-card ${isVisited ? "visited" : "not-visited"}">
          <div class="place-card-top">
            <div>
              <p class="place-city">${escapeHtml(place.province)} · ${escapeHtml(place.city)}</p>
              <h3>${escapeHtml(place.name)}</h3>
            </div>
            <span class="place-pin" aria-hidden="true">${isVisited ? "📍" : "🧭"}</span>
          </div>
          <p class="place-tag">${escapeHtml(place.tag)}</p>
          <div class="place-card-foot">
            <span class="visit-state">${isVisited ? "我去过" : "还没去"}</span>
            <button class="wish-button ${isVisited ? "active" : ""}" type="button" data-action="visit" data-place-key="${escapeHtml(key)}">
              ${isVisited ? "已点亮 ✓" : "点亮足迹"}
            </button>
            <button class="like-button ${liked ? "active" : ""}" type="button" data-action="like" data-place-key="${escapeHtml(key)}">
              ${liked ? "❤️ 我也去过 ✓" : "🤍 我也去过"}
            </button>
            <button class="comment-toggle ${commentsOpen ? "active" : ""}" type="button" data-action="toggle-comments" data-place-key="${escapeHtml(key)}">
              💬 留言 · ${comments.length}
            </button>
          </div>
          <div class="comment-box ${commentsOpen ? "show" : ""}">
            <div class="comment-list">${renderCommentList(key)}</div>
            <form class="comment-form" data-place-key="${escapeHtml(key)}">
              <input name="name" type="text" maxlength="16" placeholder="昵称，可不填" />
              <textarea name="text" maxlength="120" rows="3" placeholder="给这个地方留一句话，比如：想去看日落！" required></textarea>
              <button type="submit">留下脚印</button>
            </form>
          </div>
        </article>
      `;
    }).join("");
  }

  tabs.addEventListener("click", event => {
    const button = event.target.closest("[data-region]");
    if (!button) return;
    currentRegion = button.dataset.region;
    renderTabs();
    renderPlaces();
  });

  grid.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const key = button.dataset.placeKey;
    const action = button.dataset.action;

    if (action === "visit") {
      store.visited[key] = !store.visited[key];
      if (!store.visited[key]) delete store.visited[key];
    }

    if (action === "like") {
      store.likes[key] = !store.likes[key];
      if (!store.likes[key]) delete store.likes[key];
      store.visited[key] = Boolean(store.likes[key]) || Boolean(store.visited[key]);
    }

    if (action === "toggle-comments") {
      store.openComments[key] = !store.openComments[key];
    }

    saveStore(store);
    renderPlaces();
    updateStats();
  });

  grid.addEventListener("submit", event => {
    const form = event.target.closest(".comment-form");
    if (!form) return;
    event.preventDefault();
    const key = form.dataset.placeKey;
    const data = new FormData(form);
    const text = String(data.get("text") || "").trim();
    const name = String(data.get("name") || "匿名旅人").trim().slice(0, 16) || "匿名旅人";
    if (!text) return;

    store.comments[key] = store.comments[key] || [];
    store.comments[key].push({ name, text: text.slice(0, 120), ts: Date.now() });
    store.openComments[key] = true;
    saveStore(store);
    renderPlaces();
  });

  renderTabs();
  renderPlaces();
  updateStats();
}
