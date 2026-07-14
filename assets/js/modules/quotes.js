import { $, $$ } from "./dom.js";

const STORE_KEY = "signalGardenQuoteLikes";
const CATEGORY_META = {
  freedom: "FREE SPIRIT",
  love: "SOFT HEART"
};

function loadLikes() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch {
    return {};
  }
}

export function initQuotes(collections) {
  const card = $("#quote-card");
  const text = $("#quote-text");
  const source = $("#quote-source");
  const label = $("#quote-label");
  const refresh = $("#quote-refresh");
  const like = $("#quote-like");
  const likeCount = $("#quote-like-count");
  const tabs = $$("[data-quote-category]");
  if (!card || !text || !source || !label || !refresh || !like || !likeCount || !tabs.length) return;

  const likes = loadLikes();
  const indexes = { freedom: 0, love: 0 };
  let category = "freedom";

  function currentQuote() {
    const list = collections[category] || [];
    return list[indexes[category] % list.length];
  }

  function render() {
    const quote = currentQuote();
    if (!quote) return;
    const liked = Boolean(likes[quote.id]);
    label.textContent = CATEGORY_META[category];
    text.textContent = quote.text;
    source.textContent = quote.source;
    like.classList.toggle("active", liked);
    like.setAttribute("aria-pressed", String(liked));
    like.querySelector("span").textContent = liked ? "♥" : "♡";
    likeCount.textContent = liked ? "1" : "0";
    tabs.forEach(tab => {
      const active = tab.dataset.quoteCategory === category;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    card.classList.remove("quote-change");
    void card.offsetWidth;
    card.classList.add("quote-change");
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      category = tab.dataset.quoteCategory;
      render();
    });
  });

  refresh.addEventListener("click", () => {
    const list = collections[category] || [];
    indexes[category] = (indexes[category] + 1) % list.length;
    render();
  });

  like.addEventListener("click", () => {
    const quote = currentQuote();
    if (!quote) return;
    if (likes[quote.id]) delete likes[quote.id];
    else likes[quote.id] = true;
    localStorage.setItem(STORE_KEY, JSON.stringify(likes));
    render();
  });

  card.addEventListener("animationend", () => card.classList.remove("quote-change"));
  render();
}
