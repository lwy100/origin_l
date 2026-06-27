import { $, $$ } from "./dom.js";

function pickRandom(list, count = 3) {
  return [...list].sort(() => Math.random() - 0.5).slice(0, count);
}

function renderRecommendationList(container, list) {
  if (!container) return;
  container.innerHTML = list.map(item => `
    <article class="recommend-card">
      <p>${item.city || item.province}</p>
      <h3>${item.name}</h3>
      <span>${item.tag}</span>
    </article>
  `).join("");
}

function getLocationByTimezone() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  if (zone.includes("Shanghai")) return { province: "上海", city: "上海", source: "timezone" };
  if (zone.includes("Chongqing")) return { province: "重庆", city: "重庆", source: "timezone" };
  if (zone.includes("Urumqi")) return { province: "新疆", city: "乌鲁木齐", source: "timezone" };
  return null;
}

function matchCityWalks(cityWalks, location) {
  if (!location) return [];
  const keys = [location.city, location.province].filter(Boolean);
  return cityWalks.filter(item => item.match?.some(key => keys.includes(key)));
}

async function fetchIpLocation() {
  const fallback = getLocationByTimezone();
  try {
    const response = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!response.ok) throw new Error("location request failed");
    const data = await response.json();
    return {
      province: data.region || fallback?.province || "",
      city: data.city || fallback?.city || "",
      source: "ip"
    };
  } catch {
    return fallback || { province: "", city: "", source: "fallback" };
  }
}

export function initRecommendations({ hotDestinations, cityWalks }) {
  const hotGrid = $("#hot-recommend-grid");
  const cityGrid = $("#city-recommend-grid");
  const locationLabel = $("#location-label");
  const refreshButtons = $$("[data-refresh-recommendations]");

  function renderHot() {
    renderRecommendationList(hotGrid, pickRandom(hotDestinations, 3));
  }

  async function renderCityWalks() {
    const location = await fetchIpLocation();
    const matched = matchCityWalks(cityWalks, location);
    const source = matched.length ? matched : cityWalks;
    renderRecommendationList(cityGrid, pickRandom(source, 3));
    if (locationLabel) {
      const place = [location.province, location.city].filter(Boolean).join(" · ");
      locationLabel.textContent = place ? `基于当前位置附近推荐：${place}` : "暂时没拿到城市，就随机推荐几条城市漫游路线。";
    }
  }

  refreshButtons.forEach(button => {
    button.addEventListener("click", () => {
      renderHot();
      renderCityWalks();
    });
  });

  renderHot();
  renderCityWalks();
}
