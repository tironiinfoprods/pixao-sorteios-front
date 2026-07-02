import * as React from "react";
import { getCached, setCached } from "./requestCache";

export const API_BASE = (
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE ||
  "https://newstore-backend.onrender.com"
).replace(/\/+$/, "");

export function sanitizeToken(t) {
  if (!t) return "";
  let s = String(t).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  if (/^Bearer\s+/i.test(s)) s = s.replace(/^Bearer\s+/i, "").trim();
  return s.replace(/\s+/g, "");
}

export function getStoredToken() {
  try {
    const keys = ["ns_auth_token", "authToken", "token", "jwt", "access_token"];
    for (const k of keys) {
      const raw = localStorage.getItem(k) || sessionStorage.getItem(k);
      if (raw) return sanitizeToken(raw);
    }
  } catch {
    /* ignore */
  }
  return "";
}

export function authHeaders() {
  const t = getStoredToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function buildAuthHeaders(extra = {}, tokenFromCtx) {
  const h = { ...extra, ...authHeaders() };
  if (tokenFromCtx) h.Authorization = `Bearer ${sanitizeToken(tokenFromCtx)}`;
  return h;
}

export async function fetchJSON(url, opts = {}) {
  const r = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    headers: { ...(opts.headers || {}), ...authHeaders() },
    ...opts,
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const ct = r.headers.get("content-type") || "";
  return ct.includes("application/json") ? r.json() : {};
}

export function resolveCoverUrl(u) {
  if (!u) return "";
  let s = String(u).trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) return `${API_BASE}${s}`;
  return `${API_BASE}/public/covers/${encodeURIComponent(s)}`;
}

export async function confirmPurchaseAndGrantVoucher({ paymentId, infoproduct_id, token }) {
  const r = await fetch(`${API_BASE}/api/purchases/confirm`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }, token),
    credentials: "include",
    body: JSON.stringify({ payment_id: paymentId, infoproduct_id }),
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j?.error || `purchases_confirm_${r.status}`);
  }
  return r.json().catch(() => ({}));
}

function normalizeNumbersList(list) {
  return (list || [])
    .map((it) => ({
      n: Number(it?.n ?? it?.number ?? it?.idx ?? 0),
      status: String(it?.status ?? it?.state ?? "available"),
    }))
    .filter((x) => Number.isFinite(x.n) && x.n >= 0 && x.n < 100);
}

function buildPlaceholderDraw(p) {
  const prizeCents = p?.prize_cents ?? p?.default_prize_cents ?? 0;
  return {
    id: null,
    status: "pending",
    total_numbers: p?.default_total_numbers ?? 100,
    prize_cents: prizeCents,
    reserved: 0,
    sold: 0,
    ticket_price_cents: p?.price_cents ?? 0,
    numbers: null,
    numbersLoading: false,
  };
}

function mapDrawFromResponse(p, j, { includeNumbers = false } = {}) {
  const d = j?.draw;
  if (!d) return null;

  const counts = d.counts || {};
  const reserved = Number(counts.reserved || 0);
  const sold = Number(counts.sold || 0) + Number(counts.taken || 0);
  const numbers = includeNumbers ? normalizeNumbersList(j?.numbers) : null;

  return {
    id: d.id,
    status: d.status ?? "open",
    total_numbers: d.total_numbers ?? 100,
    prize_cents: d.prize_cents ?? j?.product?.prize_cents ?? p?.prize_cents ?? 0,
    ticket_price_cents: d.ticket_price_cents_override ?? d.ticket_price_cents ?? p?.price_cents ?? 0,
    reserved,
    sold,
    numbers,
    numbersLoading: false,
  };
}

async function findOpenDrawForProduct(p, { includeNumbers = true } = {}) {
  const key = p?.sku || p?.id;
  if (!key) return null;

  const cacheKey = `open-draw:${key}:${includeNumbers ? "numbers" : "basic"}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const qs = includeNumbers ? "?include=numbers" : "";

  try {
    const j = await fetchJSON(`${API_BASE}/api/infoproducts/${encodeURIComponent(key)}/open-draw${qs}`);
    const mapped = mapDrawFromResponse(p, j, { includeNumbers });
    if (mapped) {
      setCached(cacheKey, mapped);
      return mapped;
    }
  } catch {
    /* fallback legado */
  }

  try {
    const u = `${API_BASE}/api/draws?infoproduct_id=${encodeURIComponent(p.id)}&status=open`;
    const j = await fetchJSON(u);
    const list = Array.isArray(j?.items) ? j.items : Array.isArray(j?.draws) ? j.draws : Array.isArray(j) ? j : [];
    const chosen = list.slice().sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0];
    if (!chosen) return null;

    const mapped = {
      id: chosen.id,
      status: chosen.status ?? "open",
      total_numbers: chosen.total_numbers ?? 100,
      prize_cents: chosen.prize_cents ?? p?.prize_cents ?? 0,
      ticket_price_cents: chosen.ticket_price_cents_override ?? chosen.ticket_price_cents ?? p?.price_cents ?? 0,
      reserved: Number(chosen.reserved || 0),
      sold: Number(chosen.sold || chosen.taken || 0),
      numbers: includeNumbers ? null : null,
      numbersLoading: false,
    };
    setCached(cacheKey, mapped);
    return mapped;
  } catch {
    return null;
  }
}

function buildCardRow(p, draw) {
  const prizeCents = (p?.prize_cents ?? p?.default_prize_cents ?? draw?.prize_cents ?? 0) ?? 0;
  const ticketPriceCents = draw?.ticket_price_cents ?? p?.price_cents ?? 0;

  return {
    product: p,
    draw: draw
      ? { ...draw, prize_cents: draw.prize_cents ?? prizeCents, ticket_price_cents: ticketPriceCents }
      : buildPlaceholderDraw(p),
  };
}

export function useInfoproductCards(categorySlug = "lotomania") {
  const [loading, setLoading] = React.useState(true);
  const [cards, setCards] = React.useState([]);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const list = await fetchJSON(
          `${API_BASE}/api/infoproducts?category=${encodeURIComponent(categorySlug)}&status=open&limit=12`
        );
        const items = Array.isArray(list?.items) ? list.items : Array.isArray(list) ? list : [];

        if (!alive) return;

        setCards(items.map((p) => buildCardRow(p, null)));
        setLoading(false);

        const enriched = await Promise.all(
          items.map(async (p) => {
            try {
              const d = await findOpenDrawForProduct(p, { includeNumbers: false });
              return buildCardRow(p, d);
            } catch {
              return buildCardRow(p, null);
            }
          })
        );

        if (alive) setCards(enriched);
      } catch {
        if (alive) {
          setCards([]);
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [categorySlug]);

  return { loading, cards };
}

export async function loadNumbersForDraw(drawId, productKey) {
  if (drawId == null) return [];

  const cacheKey = `numbers:${drawId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (productKey) {
    const openDrawCache = getCached(`open-draw:${productKey}:numbers`);
    if (openDrawCache?.numbers?.length) {
      setCached(cacheKey, openDrawCache.numbers);
      return openDrawCache.numbers;
    }
  }

  try {
    const r = await fetch(`${API_BASE}/api/draws/${encodeURIComponent(drawId)}/numbers`, {
      credentials: "include",
      cache: "no-store",
      headers: { ...authHeaders() },
    });
    if (r.ok) {
      const j = await r.json().catch(() => ({}));
      const list = Array.isArray(j) ? j : Array.isArray(j?.numbers) ? j.numbers : Array.isArray(j?.items) ? j.items : [];
      const normalized = normalizeNumbersList(list);
      setCached(cacheKey, normalized);
      return normalized;
    }
  } catch {
    /* fallback */
  }

  if (productKey) {
    try {
      const j = await fetchJSON(`${API_BASE}/api/infoproducts/${encodeURIComponent(productKey)}/open-draw?include=numbers`);
      if (Number(j?.draw?.id) === Number(drawId)) {
        const normalized = normalizeNumbersList(j?.numbers);
        setCached(cacheKey, normalized);
        setCached(`open-draw:${productKey}:numbers`, {
          ...mapDrawFromResponse({ id: productKey }, j),
          numbers: normalized,
        });
        return normalized;
      }
    } catch {
      /* ignore */
    }
  }

  return [];
}
