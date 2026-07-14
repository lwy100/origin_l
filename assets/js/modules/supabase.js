const VISITOR_KEY = "signalGardenVisitorId";
const AUTH_KEY = "signalGardenSupabaseSession";

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
    key: String(config.publishableKey || ""),
    ownerGithubLogin: String(config.ownerGithubLogin || "").trim().toLowerCase()
  };
}

function isConfigured() {
  const config = getConfig();
  return Boolean(config.url && config.key && !config.url.includes("YOUR_PROJECT"));
}

function decodeJwtPayload(token) {
  try {
    const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(atob(encoded).split("").map(char => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")));
  } catch {
    return {};
  }
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (session) localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  else localStorage.removeItem(AUTH_KEY);
}

async function authRequest(path, options = {}) {
  const config = getConfig();
  if (!isConfigured()) throw new Error("Supabase is not configured");
  const response = await fetch(`${config.url}/auth/v1/${path}`, {
    ...options,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  if (!response.ok) throw new Error(`Supabase auth failed: ${response.status} ${await response.text()}`);
  if (response.status === 204) return null;
  return response.json();
}

async function refreshSession(session) {
  if (!session?.refresh_token) return null;
  const next = await authRequest("token?grant_type=refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: session.refresh_token })
  });
  const updated = {
    access_token: next.access_token,
    refresh_token: next.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + Number(next.expires_in || 3600)
  };
  saveSession(updated);
  return updated;
}

async function getAccessToken() {
  let session = loadSession();
  if (!session) return "";
  if (Number(session.expires_at || 0) <= Math.floor(Date.now() / 1000) + 60) {
    try {
      session = await refreshSession(session);
    } catch {
      saveSession(null);
      return "";
    }
  }
  return session?.access_token || "";
}

async function request(path, options = {}) {
  const config = getConfig();
  if (!isConfigured()) throw new Error("Supabase is not configured");
  const { accessToken = "", ...fetchOptions } = options;
  const headers = {
    apikey: config.key,
    Authorization: `Bearer ${accessToken || config.key}`,
    "Content-Type": "application/json",
    ...options.headers
  };
  const response = await fetch(`${config.url}/rest/v1/${path}`, { ...fetchOptions, headers });
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

export const authApi = {
  async initialize() {
    const params = new URLSearchParams(location.hash.slice(1));
    const accessToken = params.get("access_token");
    if (accessToken) {
      saveSession({
        access_token: accessToken,
        refresh_token: params.get("refresh_token") || "",
        expires_at: Math.floor(Date.now() / 1000) + Number(params.get("expires_in") || 3600)
      });
      history.replaceState(null, "", `${location.pathname}${location.search}`);
    }
    await getAccessToken();
  },

  async isOwner() {
    const token = await getAccessToken();
    if (!token) return false;
    const payload = decodeJwtPayload(token);
    const metadata = payload.user_metadata || {};
    const githubLogin = String(
      metadata.user_name || metadata.preferred_username || metadata.name || ""
    ).trim().toLowerCase();
    return githubLogin === getConfig().ownerGithubLogin;
  },

  signInWithGithub() {
    const config = getConfig();
    if (!config.ownerGithubLogin) throw new Error("Owner GitHub login is not configured");
    const redirectTo = `${location.origin}${location.pathname}`;
    const authorizeUrl = new URL(`${config.url}/auth/v1/authorize`);
    authorizeUrl.searchParams.set("provider", "github");
    authorizeUrl.searchParams.set("redirect_to", redirectTo);
    location.assign(authorizeUrl.toString());
  },

  async signOut() {
    const token = await getAccessToken();
    if (token) {
      try {
        await authRequest("logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      } catch {
        // Local sign-out still completes if the remote session already expired.
      }
    }
    saveSession(null);
  },

  async accessToken() {
    return getAccessToken();
  }
};

export const communityApi = {
  isConfigured,

  async getPlaceActivity() {
    const [countRows, comments, visitorLikes, ownerVisits] = await Promise.all([
      request("place_like_counts?select=place_key,like_count"),
      request("place_comments?select=id,place_key,name,body,created_at&order=created_at.desc&limit=500"),
      request("rpc/get_visitor_place_likes", {
        method: "POST",
        body: JSON.stringify({ p_visitor_id: getVisitorId() })
      }),
      request("owner_visits?select=place_key")
    ]);
    const commentsByPlace = {};
    for (const comment of comments || []) {
      commentsByPlace[comment.place_key] ||= [];
      commentsByPlace[comment.place_key].push({ id: comment.id, name: comment.name, text: comment.body, ts: comment.created_at });
    }
    return {
      likeCounts: mapCounts(countRows, "place_key"),
      likedPlaces: Object.fromEntries((visitorLikes || []).map(row => [row.place_key, true])),
      ownerVisited: Object.fromEntries((ownerVisits || []).map(row => [row.place_key, true])),
      comments: commentsByPlace
    };
  },

  async setOwnerVisit(placeKey, visited) {
    const accessToken = await authApi.accessToken();
    if (!accessToken) throw new Error("Owner login required");
    if (visited) {
      await request("owner_visits", {
        method: "POST",
        accessToken,
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ place_key: placeKey })
      });
    } else {
      await request(`owner_visits?place_key=eq.${encodeURIComponent(placeKey)}`, { method: "DELETE", accessToken });
    }
  },

  async togglePlaceLike(placeKey) {
    return request("rpc/toggle_place_like", { method: "POST", body: JSON.stringify({ p_place_key: placeKey, p_visitor_id: getVisitorId() }) });
  },

  async addPlaceComment({ placeKey, name, text }) {
    const rows = await request("place_comments?select=id,place_key,name,body,created_at", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ place_key: placeKey, name, body: text })
    });
    const comment = rows?.[0];
    if (!comment) throw new Error("Supabase returned no comment");
    return { id: comment.id, name: comment.name, text: comment.body, ts: comment.created_at };
  },

  async getQuoteActivity() {
    const [rows, visitorLikes] = await Promise.all([
      request("quote_like_counts?select=quote_id,like_count"),
      request("rpc/get_visitor_quote_likes", { method: "POST", body: JSON.stringify({ p_visitor_id: getVisitorId() }) })
    ]);
    return {
      counts: mapCounts(rows, "quote_id"),
      likedQuotes: Object.fromEntries((visitorLikes || []).map(row => [row.quote_id, true]))
    };
  },

  async toggleQuoteLike(quoteId) {
    return request("rpc/toggle_quote_like", { method: "POST", body: JSON.stringify({ p_quote_id: quoteId, p_visitor_id: getVisitorId() }) });
  }
};
