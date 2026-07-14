import { $, $$ } from "./dom.js";
import { authApi, communityApi } from "./supabase.js?v=20260714-6";

const STORE_KEY = "signalGardenTravelLab";

function loadStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    return {
      visited: parsed.visited || {},
      likes: parsed.likes || {},
      comments: parsed.comments || {},
      openComments: {},
      remoteLikeCounts: {},
      ownerVisited: {}
    };
  } catch {
    return { visited: {}, likes: {}, comments: {}, openComments: {}, remoteLikeCounts: {}, ownerVisited: {} };
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
  let usingSharedData = communityApi.isConfigured();
  let ownerMode = false;
  const ownerLogin = $("#owner-login");
  const ownerLogout = $("#owner-logout");
  const ownerStatus = $("#owner-status");

  function updateStats() {
    const total = flattenPlaces(placesByRegion).length;
    const source = usingSharedData ? store.ownerVisited : store.visited;
    const visitedTotal = Object.values(source).filter(Boolean).length;
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
    return comments.map(comment => `
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
      const isVisited = Boolean((usingSharedData ? store.ownerVisited : store.visited)[key]);
      const liked = Boolean(store.likes[key]);
      const likeCount = usingSharedData ? Number(store.remoteLikeCounts[key] || 0) : (liked ? 1 : 0);
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
            ${ownerMode ? `
              <button class="wish-button ${isVisited ? "active" : ""}" type="button" data-action="visit" data-place-key="${escapeHtml(key)}">
                ${isVisited ? "已点亮 ✓" : "点亮足迹"}
              </button>
            ` : `
              <span class="wish-state ${isVisited ? "active" : ""}">${isVisited ? "站主已点亮 ✓" : "站主还没去"}</span>
            `}
            <button class="like-button ${liked ? "active" : ""}" type="button" data-action="like" data-place-key="${escapeHtml(key)}">
              ${liked ? "❤️" : "🤍"} 我也去过 · ${likeCount}
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
              <p class="comment-form-status" role="status"></p>
              <button type="submit">留下脚印</button>
            </form>
          </div>
        </article>
      `;
    }).join("");
  }

  async function loadSharedActivity() {
    if (!usingSharedData) return;
    try {
      const activity = await communityApi.getPlaceActivity();
      store.remoteLikeCounts = activity.likeCounts;
      store.likes = activity.likedPlaces;
      store.ownerVisited = activity.ownerVisited;
      store.comments = activity.comments;
      updateStats();
      renderPlaces();
    } catch (error) {
      console.warn("Shared travel data unavailable; using local storage.", error);
      usingSharedData = false;
      renderPlaces();
    }
  }

  tabs.addEventListener("click", event => {
    const button = event.target.closest("[data-region]");
    if (!button) return;
    currentRegion = button.dataset.region;
    renderTabs();
    renderPlaces();
  });

  grid.addEventListener("click", async event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const key = button.dataset.placeKey;
    const action = button.dataset.action;

    if (action === "visit") {
      if (!ownerMode) return;
      const nextVisited = !store.ownerVisited[key];
      button.disabled = true;
      try {
        await communityApi.setOwnerVisit(key, nextVisited);
        if (nextVisited) store.ownerVisited[key] = true;
        else delete store.ownerVisited[key];
      } catch (error) {
        console.error("Owner visit update failed.", error);
        if (ownerStatus) ownerStatus.textContent = "点亮失败，请重新登录后再试。";
      }
    }

    if (action === "like") {
      button.disabled = true;
      if (usingSharedData) {
        try {
          const rows = await communityApi.togglePlaceLike(key);
          const result = rows?.[0];
          store.likes[key] = Boolean(result?.liked);
          store.remoteLikeCounts[key] = Number(result?.like_count || 0);
        } catch (error) {
          console.warn("Shared like failed; using local storage.", error);
          usingSharedData = false;
          store.likes[key] = !store.likes[key];
        }
      } else {
        store.likes[key] = !store.likes[key];
      }
      if (!store.likes[key]) delete store.likes[key];
      if (!usingSharedData) store.visited[key] = Boolean(store.likes[key]) || Boolean(store.visited[key]);
    }

    if (action === "toggle-comments") {
      store.openComments[key] = !store.openComments[key];
    }

    saveStore(store);
    renderPlaces();
    updateStats();
  });

  grid.addEventListener("submit", async event => {
    const form = event.target.closest(".comment-form");
    if (!form) return;
    event.preventDefault();
    const key = form.dataset.placeKey;
    const data = new FormData(form);
    const text = String(data.get("text") || "").trim().slice(0, 120);
    const name = String(data.get("name") || "匿名旅人").trim().slice(0, 16) || "匿名旅人";
    const submit = form.querySelector('button[type="submit"]');
    const formStatus = form.querySelector(".comment-form-status");
    if (!text || submit.disabled) return;

    submit.disabled = true;
    formStatus.textContent = usingSharedData ? "正在发布..." : "正在保存...";
    try {
      let comment;
      if (usingSharedData) {
        comment = await communityApi.addPlaceComment({ placeKey: key, name, text });
      } else {
        comment = { name, text, ts: new Date().toISOString() };
      }
      store.comments[key] ||= [];
      store.comments[key].unshift(comment);
      store.openComments[key] = true;
      saveStore(store);
      renderPlaces();
    } catch (error) {
      console.error("Comment publish failed.", error);
      submit.disabled = false;
      formStatus.textContent = "发布失败，请稍后再试。";
    }
  });

  async function refreshOwnerMode() {
    ownerMode = usingSharedData && await authApi.isOwner();
    if (ownerLogin) ownerLogin.hidden = ownerMode || !usingSharedData;
    if (ownerLogout) ownerLogout.hidden = !ownerMode;
    if (ownerStatus) ownerStatus.textContent = ownerMode ? "站主管理模式：可以点亮足迹" : "访客浏览模式：足迹只读";
    renderPlaces();
  }

  ownerLogin?.addEventListener("click", async () => {
    ownerLogin.disabled = true;
    ownerStatus.textContent = "正在发送登录邮件...";
    try {
      await authApi.sendOwnerMagicLink();
      ownerStatus.textContent = "登录链接已发送到站主邮箱，请查收。";
    } catch (error) {
      console.error("Owner login failed.", error);
      ownerStatus.textContent = "登录邮件发送失败，请检查 Supabase Auth 设置。";
    } finally {
      ownerLogin.disabled = false;
    }
  });

  ownerLogout?.addEventListener("click", async () => {
    await authApi.signOut();
    await refreshOwnerMode();
  });

  renderTabs();
  renderPlaces();
  updateStats();
  loadSharedActivity();
  refreshOwnerMode();
}
