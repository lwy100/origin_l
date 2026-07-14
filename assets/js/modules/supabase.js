const VISITOR_KEY = "signalGardenVisitorId";

function getVisitorId() {
  let value = localStorage.getItem(VISITOR_KEY);
  if (value) return value;
  value = crypto.randomUUID();
  localStorage.setItem(VISITOR_KEY, value);
  return value;
}

function getConfig() {
  const config = window.SIGNAL_GARDEN_SUPABASE || {};
  return {
    url: String(config.url || "").replace(/\/$/, ""),
    key: String(config.publishableKey || "")
  };
}

function isConfigured() {
  const config = getConfig();
  return Boolean(config.url && config.key && !config.url.includes("YOUR_PROJECT"));
}

async function request(path, options = {}) {
  const config = getConfig();
  if (!isConfigured()) throw new Error("Supabase is not configured");
  const headers = {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    "Content-Type": "application/json",
    ...options.headers
  };
  const response = await fetch(`${config.url}/rest/v1/${path}`, { ...options, headers });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${detail}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function mapCounts(rows, keyName) {
  return Object.fromEntries((rows || []).map(row => [row[keyName], Number(row.like_count || 0)]));
}

export const communityApi = {
  isConfigured,

  async getPlaceActivity() {
    const [countRows, comments, visitorLikes] = await Promise.all([
      request("place_like_counts?select=place_key,like_count"),
      request("place_comments?select=id,place_key,name,body,created_at&order=created_at.desc&limit=500"),
      request("rpc/get_visitor_place_likes", {
        method: "POST",
        body: JSON.stringify({ p_visitor_id: getVisitorId() })
      })
    ]);
    const commentsByPlace = {};
    for (const comment of comments || []) {
      commentsByPlace[comment.place_key] ||= [];
      commentsByPlace[comment.place_key].push({
        id: comment.id,
        name: comment.name,
        text: comment.body,
        ts: comment.created_at
      });
    }
    return {
      likeCounts: mapCounts(countRows, "place_key"),
      likedPlaces: Object.fromEntries((visitorLikes || []).map(row => [row.place_key, true])),
      comments: commentsByPlace
    };
  },

  async togglePlaceLike(placeKey) {
    return request("rpc/toggle_place_like", {
      method: "POST",
      body: JSON.stringify({ p_place_key: placeKey, p_visitor_id: getVisitorId() })
    });
  },

  async addPlaceComment({ placeKey, name, text }) {
    const rows = await request("place_comments?select=id,place_key,name,body,created_at", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ place_key: placeKey, name, body: text })
    });
    const comment = rows?.[0];
    if (!comment) throw new Error("Supabase returned no comment");
    return {
      id: comment.id,
      name: comment.name,
      text: comment.body,
      ts: comment.created_at
    };
  },

  async getQuoteActivity() {
    const [rows, visitorLikes] = await Promise.all([
      request("quote_like_counts?select=quote_id,like_count"),
      request("rpc/get_visitor_quote_likes", {
        method: "POST",
        body: JSON.stringify({ p_visitor_id: getVisitorId() })
      })
    ]);
    return {
      counts: mapCounts(rows, "quote_id"),
      likedQuotes: Object.fromEntries((visitorLikes || []).map(row => [row.quote_id, true]))
    };
  },

  async toggleQuoteLike(quoteId) {
    return request("rpc/toggle_quote_like", {
      method: "POST",
      body: JSON.stringify({ p_quote_id: quoteId, p_visitor_id: getVisitorId() })
    });
  }
};
