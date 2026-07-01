// src/HomePage.jsx
import * as React from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  AppBar, Box, Button, Chip, Container, CssBaseline, Divider, IconButton, Menu, MenuItem,
  Paper, Stack, ThemeProvider, Toolbar, Typography, createTheme, Card, CardContent,
  CardActions, LinearProgress, Link, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import logoNewStore from "./Logo-branca-sem-fundo-768x132.png";
import heroImage from "./hero_image.png";
import lotomaniaLogo from "./lotomania-logo.png";
import { useAuth } from "./authContext";

// PIX
import PixModal from "./PixModal";
import { checkPixStatus } from "./services/pix";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#67C23A" },
    secondary: { main: "#FFC107" },
    background: { default: "#0E0E0E", paper: "#121212" },
    error: { main: "#D32F2F" },
    success: { main: "#59b15f" },
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial"].join(",") },
});

const API_BASE = (
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE ||
  "https://newstore-backend.onrender.com"
).replace(/\/+$/, "");

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/* ---------- helpers ---------- */
function sanitizeToken(t) {
  if (!t) return "";
  let s = String(t).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  if (/^Bearer\s+/i.test(s)) s = s.replace(/^Bearer\s+/i, "").trim();
  return s.replace(/\s+/g, "");
}
function getStoredToken() {
  try {
    const keys = ["ns_auth_token", "authToken", "token", "jwt", "access_token"];
    for (const k of keys) {
      const raw = localStorage.getItem(k) || sessionStorage.getItem(k);
      if (raw) return sanitizeToken(raw);
    }
  } catch {}
  return "";
}
function authHeaders() {
  const t = getStoredToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
function buildAuthHeaders(extra = {}, tokenFromCtx) {
  const h = { ...extra, ...authHeaders() };
  if (tokenFromCtx) h.Authorization = `Bearer ${sanitizeToken(tokenFromCtx)}`;
  return h;
}

async function fetchJSON(url, opts = {}) {
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

/** Torna qualquer cover_url absoluta apontando para o BACKEND. */
function resolveCoverUrl(u) {
  if (!u) return "";
  let s = String(u).trim();
  // já absoluto
  if (/^https?:\/\//i.test(s)) return s;
  // começa com "/" -> prefixa host do backend
  if (s.startsWith("/")) return `${API_BASE}${s}`;
  // só o nome do arquivo -> assume pasta /public/covers
  return `${API_BASE}/public/covers/${encodeURIComponent(s)}`;
}

/** CONFIRMA a compra no backend (credita vouchers). */
async function confirmPurchaseAndGrantVoucher({ paymentId, infoproduct_id, token }) {
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

/* ================================================================
   Pegar SEMPRE o draw via /open-draw (com fallback legado)
   ================================================================ */
function getProductKey(p) {
  return p?.sku || p?.id;
}
async function findOpenDrawForProduct(p) {
  const key = getProductKey(p);
  if (!key) return null;

  try {
    const j = await fetchJSON(`${API_BASE}/api/infoproducts/${encodeURIComponent(key)}/open-draw`);
    const d = j?.draw;
    if (!d) return null;

    const counts = d.counts || {};
    const reserved = Number(counts.reserved || 0);
    const sold = Number(counts.sold || 0) + Number(counts.taken || 0);

    return {
      id: d.id,
      status: d.status ?? "open",
      total_numbers: d.total_numbers ?? 100,
      prize_cents: (d.prize_cents ?? j?.product?.prize_cents ?? p?.prize_cents ?? 0),
      ticket_price_cents: (d.ticket_price_cents_override ?? d.ticket_price_cents ?? p?.price_cents ?? 0),
      reserved,
      sold,
    };
  } catch {
    try {
      const u = `${API_BASE}/api/draws?infoproduct_id=${encodeURIComponent(p.id)}&status=open`;
      const j = await fetchJSON(u);
      const list = Array.isArray(j?.items) ? j.items : Array.isArray(j?.draws) ? j.draws : Array.isArray(j) ? j : [];
      const chosen = list.slice().sort((a,b)=>Number(b?.id||0)-Number(a?.id||0))[0];
      if (!chosen) return null;
      return {
        id: chosen.id,
        status: chosen.status ?? "open",
        total_numbers: chosen.total_numbers ?? 100,
        prize_cents: chosen.prize_cents ?? p?.prize_cents ?? 0,
        ticket_price_cents: (chosen.ticket_price_cents_override ?? chosen.ticket_price_cents ?? p?.price_cents ?? 0),
        reserved: Number(chosen.reserved || 0),
        sold: Number(chosen.sold || chosen.taken || 0),
      };
    } catch {
      return null;
    }
  }
}

/** Carrega infoprodutos + draw vinculado */
function useInfoproductCards(categorySlug = "lotomania") {
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

        const enriched = await Promise.all(
          items.map(async (p) => {
            try {
              const d = await findOpenDrawForProduct(p);

              const prizeCents =
                (p?.prize_cents ?? p?.default_prize_cents ?? (d ? d.prize_cents : 0)) ?? 0;

              const ticketPriceCents =
                d?.ticket_price_cents ?? p?.price_cents ?? 0;

              return {
                product: p,
                draw: d
                  ? d
                  : {
                      id: null,
                      status: "pending",
                      total_numbers: p?.default_total_numbers ?? 100,
                      prize_cents: prizeCents,
                      reserved: 0,
                      sold: 0,
                      ticket_price_cents: ticketPriceCents,
                    },
              };
            } catch {
              const prizeCents = p?.prize_cents ?? p?.default_prize_cents ?? 0;
              return {
                product: p,
                draw: {
                  id: null,
                  status: "pending",
                  total_numbers: p?.default_total_numbers ?? 100,
                  prize_cents: prizeCents,
                  reserved: 0,
                  sold: 0,
                  ticket_price_cents: p?.price_cents ?? 0,
                },
              };
            }
          })
        );

        if (alive) setCards(enriched);
      } catch {
        if (alive) setCards([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [categorySlug]);

  return { loading, cards };
}

function ProgressNumbers({ total = 100, reserved = 0, sold = 0, showUrgency = false }) {
  const used = (reserved || 0) + (sold || 0);
  const left = Math.max(0, total - used);
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const urgent = left <= 20;
  return (
    <Stack spacing={0.75}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 700 }}>
          {left} de {total} números disponíveis
        </Typography>
        {showUrgency && urgent ? (
          <Chip
            size="small"
            icon={<BoltRoundedIcon sx={{ fontSize: 16 }} />}
            label="Quase esgotando"
            color="warning"
            sx={{ fontWeight: 800, height: 24 }}
          />
        ) : null}
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 8,
          borderRadius: 99,
          bgcolor: "rgba(255,255,255,0.08)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 99,
            background: urgent
              ? "linear-gradient(90deg,#FF9800,#FFC107)"
              : "linear-gradient(90deg,#59b15f,#67C23A)",
          },
        }}
      />
    </Stack>
  );
}

function getPrizeCents(p, d) {
  return p?.prize_cents ?? p?.default_prize_cents ?? d?.prize_cents ?? 0;
}

function getPriceCents(p, d) {
  return d?.ticket_price_cents ?? p?.price_cents ?? 0;
}

function pickFeaturedCard(cards) {
  if (!cards?.length) return null;
  return cards.reduce((best, row) => {
    const bestPrize = getPrizeCents(best?.product, best?.draw);
    const rowPrize = getPrizeCents(row?.product, row?.draw);
    return rowPrize > bestPrize ? row : best;
  }, cards[0]);
}

function HowItWorks() {
  const steps = [
    { n: "1", title: "Escolha seu e-book", desc: "Cada unidade = 1 número na rifa" },
    { n: "2", title: "Pague via PIX", desc: "Confirmação rápida e segura" },
    { n: "3", title: "Escolha seu número", desc: "Sorteio pela Lotomania ao esgotar" },
  ];
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        gap: 2,
        mb: 4,
      }}
    >
      {steps.map((s) => (
        <Paper
          key={s.n}
          variant="outlined"
          sx={{
            p: 2,
            borderColor: "rgba(255,255,255,0.1)",
            bgcolor: "rgba(255,255,255,0.02)",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: "secondary.main",
                color: "#0E0E0E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              {s.n}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>{s.title}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.25 }}>
                {s.desc}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}

function PrizeHero({
  loading,
  featured,
  onBuy,
  isAuthenticated,
}) {
  const p = featured?.product || {};
  const d = featured?.draw || {};
  const prize = getPrizeCents(p, d) / 100;
  const price = getPriceCents(p, d) / 100;
  const cover = resolveCoverUrl(p.cover_url);
  const total = d?.total_numbers ?? 100;
  const used = (d?.reserved ?? 0) + (d?.sold ?? 0);
  const left = Math.max(0, total - used);

  const ctaLabel = isAuthenticated ? "Garantir meu número agora" : "Criar conta e participar";
  const ctaSub = isAuthenticated
    ? `A partir de ${BRL.format(price)} por número`
    : "Cadastro rápido • pague com PIX";

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: 4,
        position: "relative",
        overflow: "hidden",
        mb: 4,
        border: "1px solid rgba(255,213,79,0.25)",
        background:
          "radial-gradient(900px 420px at 0% 0%, rgba(255,193,7,0.18), transparent 55%), radial-gradient(900px 420px at 100% 100%, rgba(103,194,58,0.14), transparent 55%), linear-gradient(180deg, rgba(22,22,22,0.98), rgba(14,14,14,0.98))",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.12,
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
          gap: { xs: 3, md: 4 },
          alignItems: "center",
        }}
      >
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            {lotomaniaLogo ? (
              <Box component="img" src={lotomaniaLogo} alt="Lotomania" sx={{ height: 36, objectFit: "contain" }} />
            ) : (
              <Chip label="Lotomania" color="warning" size="small" />
            )}
            <Chip
              size="small"
              icon={<EmojiEventsRoundedIcon sx={{ fontSize: 18 }} />}
              label="Sorteio ativo"
              sx={{ bgcolor: "rgba(103,194,58,0.2)", border: "1px solid rgba(103,194,58,0.5)", fontWeight: 700 }}
            />
          </Stack>

          <Box>
            <Typography
              variant="overline"
              sx={{ letterSpacing: 2, color: "secondary.main", fontWeight: 900, display: "block", mb: 0.5 }}
            >
              PRÊMIO EM DINHEIRO
            </Typography>
            {loading ? (
              <Typography variant="h2" sx={{ fontWeight: 900, opacity: 0.4 }}>
                Carregando…
              </Typography>
            ) : (
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  lineHeight: 1,
                  fontSize: { xs: "2.75rem", sm: "3.5rem", md: "4rem" },
                  background: "linear-gradient(90deg,#FFD54F,#FFF176,#A5D6A7)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {BRL.format(prize)}
              </Typography>
            )}
          </Box>

          <Typography variant="h6" sx={{ opacity: 0.92, maxWidth: 520, fontWeight: 600 }}>
            {loading
              ? "Preparando o sorteio da Lotomania…"
              : p.title
                ? `Participe comprando "${p.title}" e escolha seu número entre 00 e 99.`
                : "Compre o e-book, escolha seu número e concorra ao prêmio quando a tabela fechar."}
          </Typography>

          {!loading && left > 0 ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<CheckCircleRoundedIcon sx={{ fontSize: 18 }} />}
                label={`${left} números restantes`}
                color={left <= 20 ? "warning" : "success"}
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
              <Chip label={`${BRL.format(price)} / número`} variant="outlined" sx={{ fontWeight: 700 }} />
            </Stack>
          ) : null}

          {!loading && d?.total_numbers ? (
            <Box sx={{ maxWidth: 420 }}>
              <ProgressNumbers
                total={d.total_numbers}
                reserved={d.reserved ?? 0}
                sold={d.sold ?? 0}
                showUrgency
              />
            </Box>
          ) : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 0.5 }}>
            <Button
              size="large"
              color="success"
              variant="contained"
              disabled={loading || !featured}
              onClick={() => featured && onBuy(p, getPriceCents(p, d))}
              sx={{
                fontWeight: 900,
                px: 4,
                py: 1.5,
                fontSize: "1.05rem",
                boxShadow: "0 8px 32px rgba(89,177,95,0.35)",
              }}
            >
              {ctaLabel}
            </Button>
            <Typography variant="body2" sx={{ opacity: 0.75, alignSelf: "center" }}>
              {ctaSub}
            </Typography>
          </Stack>
        </Stack>

        <Box
          sx={{
            position: "relative",
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
            aspectRatio: { xs: "16/10", md: "4/5" },
            maxHeight: { md: 420 },
            background: cover
              ? `url(${cover}) center/cover no-repeat`
              : "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 8px, rgba(255,255,255,0.03) 8px 16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!cover && (
            <Typography sx={{ opacity: 0.65, fontWeight: 700, px: 2, textAlign: "center" }}>
              Capa do e-book
            </Typography>
          )}
          {!loading && prize > 0 ? (
            <Box
              sx={{
                position: "absolute",
                bottom: 12,
                left: 12,
                right: 12,
                p: 1.5,
                borderRadius: 2,
                bgcolor: "rgba(0,0,0,0.72)",
                border: "1px solid rgba(255,213,79,0.35)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 700 }}>
                PRÊMIO GARANTIDO
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "secondary.main", lineHeight: 1.1 }}>
                {BRL.format(prize)}
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Paper>
  );
}

function ProductCard({ row, loading, onBuy, isAuthenticated, featured = false }) {
  const p = row?.product || {};
  const d = row?.draw || {};
  const prize = getPrizeCents(p, d) / 100;
  const price = getPriceCents(p, d) / 100;
  const cover = resolveCoverUrl(p.cover_url);
  const ctaLabel = isAuthenticated ? "Comprar e escolher número" : "Entrar e comprar";

  if (loading) {
    return (
      <Card variant="outlined" sx={{ display: "flex", flexDirection: "column", minHeight: 360, opacity: 0.5 }}>
        <Box sx={{ aspectRatio: "16/9", bgcolor: "rgba(255,255,255,0.04)" }} />
        <CardContent><Typography>Carregando…</Typography></CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        borderColor: featured ? "rgba(255,213,79,0.35)" : "rgba(255,255,255,0.12)",
        bgcolor: featured ? "rgba(255,213,79,0.04)" : "transparent",
      }}
    >
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 9",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: cover
            ? `url(${cover}) center/cover no-repeat`
            : "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 8px, rgba(255,255,255,0.03) 8px 16px)",
        }}
      >
        <Chip
          label={`Prêmio ${BRL.format(prize)}`}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            fontWeight: 900,
            bgcolor: "rgba(0,0,0,0.75)",
            color: "secondary.main",
            border: "1px solid rgba(255,213,79,0.4)",
          }}
        />
      </Box>

      <CardContent sx={{ flex: 1 }}>
        <Typography variant="overline" sx={{ opacity: 0.8 }}>
          {p.subtitle || "E-book + rifa"}
        </Typography>
        <Typography variant="h6" fontWeight={900}>
          {p.title || "E-book"}
        </Typography>

        <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 900, color: "secondary.main" }}>
          {BRL.format(prize)}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          por apenas <strong>{BRL.format(price)}</strong> / número
        </Typography>

        {p.description ? (
          <Typography variant="body2" sx={{ mt: 1.5, opacity: 0.85 }}>
            {p.description}
          </Typography>
        ) : null}

        {d?.total_numbers ? (
          <Box sx={{ mt: 2 }}>
            <ProgressNumbers
              total={d.total_numbers}
              reserved={d.reserved ?? 0}
              sold={d.sold ?? 0}
              showUrgency
            />
          </Box>
        ) : null}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, flexDirection: "column", alignItems: "stretch", gap: 1 }}>
        <Button
          fullWidth
          size="large"
          color="success"
          variant="contained"
          onClick={() => onBuy(p, getPriceCents(p, d))}
          sx={{ fontWeight: 900 }}
        >
          {ctaLabel}
        </Button>
        {d?.id ? <NumbersMiniBoard drawId={d.id} productKey={getProductKey(p)} collapsed /> : null}
      </CardActions>
    </Card>
  );
}

/** Loader de números (novo + legado) */
async function loadNumbersForDraw(drawId, productKey) {
  if (drawId == null) return [];

  try {
    const r = await fetch(`${API_BASE}/api/draws/${encodeURIComponent(drawId)}/numbers`, {
      credentials: "include",
      cache: "no-store",
      headers: { ...authHeaders() },
    });
    if (r.ok) {
      const j = await r.json().catch(() => ({}));
      let list = Array.isArray(j) ? j : Array.isArray(j?.numbers) ? j.numbers : Array.isArray(j?.items) ? j.items : [];
      return list
        .map((it) => ({ n: Number(it?.n ?? it?.number ?? it?.idx ?? 0), status: String(it?.status ?? it?.state ?? "available") }))
        .filter((x) => Number.isFinite(x.n) && x.n >= 0 && x.n < 100);
    }
  } catch {}

  if (productKey) {
    try {
      const j = await fetchJSON(`${API_BASE}/api/infoproducts/${encodeURIComponent(productKey)}/open-draw?include=numbers`);
      if (Number(j?.draw?.id) === Number(drawId)) {
        const list = Array.isArray(j?.numbers) ? j.numbers : [];
        return list
          .map((it) => ({ n: Number(it?.n), status: String(it?.status || "available") }))
          .filter((x) => Number.isFinite(x.n) && x.n >= 0 && x.n < 100);
      }
    } catch {}
  }

  return [];
}

function NumbersMiniBoard({ drawId, productKey, collapsed = false }) {
  const [nums, setNums] = React.useState([]);
  const [expanded, setExpanded] = React.useState(!collapsed);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const list = await loadNumbersForDraw(drawId, productKey);
      if (alive) setNums(list);
    })();
    return () => { alive = false; };
  }, [drawId, productKey]);

  const statusByN = React.useMemo(() => {
    const m = {};
    for (const it of nums) m[Number(it.n)] = it.status;
    return m;
  }, [nums]);

  const sxFor = (st) => {
    const s = String(st || "").toLowerCase();
    if (s === "sold" || s === "taken") {
      return { bgcolor: "rgba(211,47,47,0.25)", border: "1px solid", borderColor: "error.main", color: "#fff" };
    }
    if (s === "reserved") {
      return { bgcolor: "rgba(255,193,7,0.22)", border: "1px solid", borderColor: "secondary.main", color: "#0E0E0E" };
    }
    return { bgcolor: "rgba(103,194,58,0.25)", border: "1px solid", borderColor: "success.main", color: "#0E0E0E" };
  };

  return (
    <Box sx={{ mt: 1.5 }}>
      {collapsed ? (
        <Button
          fullWidth
          size="small"
          variant="outlined"
          endIcon={
            <ExpandMoreRoundedIcon
              sx={{ transform: expanded ? "rotate(180deg)" : "none", transition: "0.2s" }}
            />
          }
          onClick={() => setExpanded((v) => !v)}
          sx={{ fontWeight: 700, borderColor: "rgba(255,255,255,0.2)" }}
        >
          {expanded ? "Ocultar tabela de números" : "Ver números disponíveis"}
        </Button>
      ) : null}
      {(!collapsed || expanded) ? (
        <>
          <Typography variant="caption" sx={{ opacity: 0.75, display: "block", mb: 0.5, mt: collapsed ? 1 : 0 }}>
            Tabela (somente leitura)
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 0.5 }}>
            {Array.from({ length: 100 }).map((_, i) => {
              const st = statusByN[i] || "available";
              const label = String(i).padStart(2, "0");
              return (
                <Box
                  key={i}
                  title={`${label} — ${st}`}
                  sx={{
                    aspectRatio: "1 / 1",
                    borderRadius: 0.75,
                    fontSize: 10,
                    fontWeight: 900,
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    userSelect: "none",
                    ...sxFor(st),
                  }}
                >
                  {label}
                </Box>
              );
            })}
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center" flexWrap="wrap">
            <Chip size="small" label="Disponível" sx={{ bgcolor: "rgba(103,194,58,0.25)", border: "1px solid #67C23A" }} />
            <Chip size="small" label="Reservado" sx={{ bgcolor: "rgba(255,193,7,0.22)", border: "1px solid #FFC107" }} />
            <Chip size="small" label="Indisponível" sx={{ bgcolor: "rgba(211,47,47,0.25)", border: "1px solid #D32F2F" }} />
          </Stack>
        </>
      ) : null}
    </Box>
  );
}

/** ====================== FOOTER ====================== */
function Footer() {
  return (
    <Box component="footer" sx={{ mt: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} />
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }}>
          Sorteios lastreados por Títulos de Capitalização, da Modalidade Incentivo, emitidos pela
          VIA Capitalização S.A., inscrita no CNPJ sob nº 88.076.302/0001-94, e aprovados pela SUSEP
          através do registro na SUSEP Sorteio n° <strong>15144.655164/2025-41</strong>. O valor das
          premiações aqui indicados são líquidos, já descontado o devido imposto de renda de 25%.
          O registro deste plano na SUSEP não implica, por parte da Autarquia, incentivo ou
          recomendação à sua comercialização.
        </Typography>

        <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.08)" }} />

        <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }}
               spacing={3} justifyContent="space-between">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={4} alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Títulos emitidos por:</Typography>
              <Chip size="small" label="ViaCap" variant="outlined" />
            </Stack>
          </Stack>
          <Chip size="small" label="Google Safe Browsing" />
        </Stack>

        <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.08)" }} />

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }}
               justifyContent="space-between">
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Link component={RouterLink} to="/termos" underline="hover" color="inherit">Termos de Uso</Link>
            <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
            <Link component={RouterLink} to="/privacidade" underline="hover" color="inherit">Política de Privacidade</Link>
            <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
            <Link component={RouterLink} to="/jogo-responsavel" underline="hover" color="inherit">Jogo Responsável</Link>
          </Stack>

          <Stack spacing={0.5} sx={{ mt: { xs: 2, md: 0 } }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              SAC ViaCap — <Link href="tel:08007407819" underline="hover" color="inherit">0800 740 7819</Link>
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Ouvidoria ViaCap — <Link href="tel:08008741505" underline="hover" color="inherit">0800 874 1505</Link>
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              <strong>Pixão na Mão</strong> — Tironi Tech (CNPJ <strong>58.336.550/0001-66</strong>)
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
/** ==================== /FOOTER ==================== */

function PurchaseQtyDialog({ open, onClose, onConfirm, unitPriceCents = 0 }) {
  const [qty, setQty] = React.useState(1);
  React.useEffect(() => { if (open) setQty(1); }, [open]);

  const inc = () => setQty((q) => Math.min(20, q + 1));
  const dec = () => setQty((q) => Math.max(1, q - 1));
  const total = (unitPriceCents * qty) / 100;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontSize: 20, fontWeight: 900, textAlign: "center" }}>
        Quantos e-books deseja?
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center" }}>
        <Typography sx={{ opacity: 0.85, mb: 2 }}>
          Limite: até <strong>20</strong> unidades por compra.
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ my: 1 }}>
          <Button onClick={dec} variant="outlined" size="large" sx={{ minWidth: 56 }}><RemoveRoundedIcon /></Button>
          <Typography variant="h4" sx={{ fontWeight: 900, minWidth: 64, textAlign: "center" }}>{qty}</Typography>
          <Button onClick={inc} variant="outlined" size="large" sx={{ minWidth: 56 }}><AddRoundedIcon /></Button>
        </Stack>
        <Typography sx={{ mt: 2, fontWeight: 800 }}>
          {qty} × {BRL.format(unitPriceCents / 100)} = <span style={{ color: "#67C23A" }}>{BRL.format(total)}</span>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button fullWidth variant="outlined" onClick={onClose}>Cancelar</Button>
        <Button fullWidth variant="contained" color="success" onClick={() => onConfirm(qty)}>
          Comprar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function HomePage({ groupUrl = "https://chat.whatsapp.com/Byb4qBRseWwC5IVyV8enRC" }) {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const isAuthenticated = !!(user?.email || user?.id || token);

  const [menuEl, setMenuEl] = React.useState(null);
  const menuOpen = Boolean(menuEl);
  const handleOpenMenu = (e) => setMenuEl(e.currentTarget);
  const handleCloseMenu = () => setMenuEl(null);
  const goConta = () => { handleCloseMenu(); navigate("/conta"); };
  const goLogin = () => { handleCloseMenu(); navigate("/login"); };
  const doLogout = () => { handleCloseMenu(); logout(); navigate("/"); };

  const { loading, cards } = useInfoproductCards("lotomania");
  const featured = React.useMemo(() => pickFeaturedCard(cards), [cards]);
  const otherCards = React.useMemo(() => {
    if (!featured || !cards?.length) return cards || [];
    const featuredId = featured?.product?.id;
    return cards.filter((c) => c?.product?.id !== featuredId);
  }, [cards, featured]);

  // PIX modal
  const [pixOpen, setPixOpen] = React.useState(false);
  const [pixLoading, setPixLoading] = React.useState(false);
  const [pixData, setPixData] = React.useState(null);
  const [pixAmount, setPixAmount] = React.useState(0);
  const [pendingProduct, setPendingProduct] = React.useState(null);

  // Modal quantidade antes do PIX
  const [qtyOpen, setQtyOpen] = React.useState(false);
  const [unitPriceCents, setUnitPriceCents] = React.useState(0);

  // Modal intermediária pós-aprovação
  const [handoverOpen, setHandoverOpen] = React.useState(false);
  const [handoverMsg, setHandoverMsg] = React.useState("Pagamento aprovado! Preparando a sua tabela…");
  const [handoverPct, setHandoverPct] = React.useState(10);
  const handoverTimerRef = React.useRef(null);

  function startHandoverProgress() {
    clearInterval(handoverTimerRef.current);
    setHandoverPct(10);
    handoverTimerRef.current = setInterval(() => {
      setHandoverPct((p) => (p < 90 ? p + 5 : 90));
    }, 400);
  }
  function stopHandoverProgress() {
    clearInterval(handoverTimerRef.current);
    handoverTimerRef.current = null;
  }

  React.useEffect(() => {
    if (!pixOpen || !pixData?.paymentId) return;
    const id = setInterval(async () => {
      try {
        const st = await checkPixStatus(pixData.paymentId);
        if (String(st?.status).toLowerCase() === "approved") {
          clearInterval(id);

          setPixOpen(false);
          setPixLoading(false);
          setHandoverOpen(true);
          setHandoverMsg("Pagamento aprovado! Preparando a sua tabela…");
          startHandoverProgress();

          let drawId = null;

          try {
            if (pendingProduct?.id) {
              setHandoverMsg("Confirmando sua compra e liberando seus números…");
              await confirmPurchaseAndGrantVoucher({
                paymentId: pixData.paymentId,
                infoproduct_id: pendingProduct.id,
                token,
              });
              setHandoverPct((p) => Math.max(p, 40));
            }
          } catch (e) {
            console.warn("[purchases/confirm] falhou:", e?.message);
          }

          try {
            setHandoverMsg("Garantindo o sorteio e carregando a tabela de números…");
            const ensure = await fetchJSON(
              `${API_BASE}/api/infoproducts/${encodeURIComponent(pendingProduct?.sku || pendingProduct?.id)}/ensure-open-draw`,
              { method: "POST", headers: buildAuthHeaders({}, token) }
            ).catch(() => ({}));
            drawId = ensure?.draw_id || ensure?.id || null;
            setHandoverPct((p) => Math.max(p, 75));
          } catch {}

          setHandoverMsg("Tudo pronto! Abrindo a tela para você escolher o número…");
          setHandoverPct(100);
          stopHandoverProgress();

          setTimeout(() => {
            setHandoverOpen(false);
            navigate("/numeros", {
              state: { drawId, paymentId: pixData.paymentId, product: pendingProduct },
            });
            setPendingProduct(null);
          }, 600);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, [pixOpen, pixData, pendingProduct, navigate, token]);

  // exige login; abre modal de quantidade
  function onBuyClick(product, priceCents) {
    if (!isAuthenticated) {
      alert("Para comprar e-books é necessário estar autenticado.");
      navigate("/login", {
        state: {
          redirectTo: "/",
          pendingBuy: { productId: product.id, priceCents },
          msg: "Faça login para comprar o e-book.",
        },
        replace: true,
      });
      return;
    }
    setPendingProduct(product);
    setUnitPriceCents(priceCents ?? product.price_cents ?? 0);
    setQtyOpen(true);
  }

  async function handleBuy(product, priceCents, quantity = 1) {
    try {
      setPendingProduct(product);
      setPixOpen(true);
      setPixLoading(true);
      setPixAmount(((priceCents ?? product.price_cents ?? 0) * quantity) / 100);

      const body = {
        infoproduct_id: product.id,
        quantity,
        amount_cents_total: (priceCents ?? product.price_cents ?? 0) * quantity,
      };
      const pix = await fetch(`${API_BASE}/api/payments/infoproduct`, {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }, token),
        credentials: "include",
        body: JSON.stringify(body),
      }).then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j?.error || `HTTP_${r.status}`);
        }
        return r.json();
      });

      setPixData(pix);
      setPixLoading(false);
    } catch (e) {
      setPixLoading(false);
      setPixOpen(false);
      alert("Não foi possível iniciar o pagamento agora.");
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Topbar */}
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Toolbar sx={{ position: "relative", minHeight: 64 }}>
          <IconButton edge="start" color="inherit" />
          <Button component={RouterLink} to="/cadastro" variant="text" sx={{ fontWeight: 700, mt: 1 }}>
            Criar conta
          </Button>

          <Box
            component={RouterLink}
            to={isAuthenticated ? "/conta" : "/"}
            onClick={(e) => { e.preventDefault(); navigate(isAuthenticated ? "/conta" : "/"); }}
            sx={{
              position: "absolute", left: "50%", top: "50%",
              transform: "translate(-50%, -50%)", display: "flex", alignItems: "center",
            }}
          >
            <Box component="img" src={logoNewStore} alt="NEW STORE" sx={{ height: 80, objectFit: "contain" }} />
          </Box>

          <IconButton color="inherit" sx={{ ml: "auto" }} onClick={handleOpenMenu}>
            <AccountCircleRoundedIcon />
          </IconButton>
          <Menu
            anchorEl={menuEl}
            open={menuOpen}
            onClose={handleCloseMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {isAuthenticated
              ? [
                  <MenuItem key="conta" onClick={goConta}>Área do cliente</MenuItem>,
                  <Divider key="div" />,
                  <MenuItem key="sair" onClick={doLogout}>Sair</MenuItem>,
                ]
              : <MenuItem onClick={goLogin}>Entrar</MenuItem>}
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, pb: { xs: 12, md: 5 } }}>
        <PrizeHero
          loading={loading}
          featured={featured}
          onBuy={onBuyClick}
          isAuthenticated={isAuthenticated}
        />

        <HowItWorks />

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 2.5 },
            mb: 4,
            borderColor: "rgba(255,255,255,0.1)",
            bgcolor: "rgba(255,255,255,0.02)",
          }}
        >
          <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
            Como o vencedor é definido
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Quando todos os números forem vendidos, usamos o <strong>próximo sorteio da Lotomania</strong>.
            O ganhador é quem comprou o <strong>último número sorteado</strong> entre os 100 da tabela.
          </Typography>
        </Paper>

        {otherCards.length > 0 ? (
          <>
            <Typography variant="h5" fontWeight={900} sx={{ mb: 2 }}>
              Outras opções de e-book
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: 2.5,
                mb: 4,
              }}
            >
              {otherCards.map((row, idx) => (
                <ProductCard
                  key={row?.product?.id || idx}
                  row={row}
                  loading={false}
                  onBuy={onBuyClick}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </Box>
          </>
        ) : null}

        {/* CTA WhatsApp */}
        <Paper
          variant="outlined"
          sx={{
            mt: 6, p: { xs: 3, md: 4 }, textAlign: "center",
            bgcolor: "linear-gradient(180deg, rgba(255,193,7,0.06), rgba(103,194,58,0.06))",
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>
            Entre no grupo do sorteio!
          </Typography>
          <Typography sx={{ opacity: 0.85, mb: 2 }}>
            Acompanhe novidades, novas rodadas e avisos importantes.
          </Typography>
          <Button
            component="a" href={groupUrl} target="_blank" rel="noopener"
            size="large" variant="contained" color="success"
            sx={{ px: 4, py: 1.5, fontWeight: 800, letterSpacing: 0.5 }}
          >
            ENTRAR NO WHATS 💬
          </Button>
        </Paper>
      </Container>

      {!loading && featured ? (
        <Box
          sx={{
            display: { xs: "block", md: "none" },
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            p: 1.5,
            bgcolor: "rgba(14,14,14,0.95)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700 }}>
                Prêmio
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "secondary.main", lineHeight: 1.1 }}>
                {BRL.format(getPrizeCents(featured.product, featured.draw) / 100)}
              </Typography>
            </Box>
            <Button
              color="success"
              variant="contained"
              onClick={() =>
                onBuyClick(featured.product, getPriceCents(featured.product, featured.draw))
              }
              sx={{ fontWeight: 900, px: 2.5, whiteSpace: "nowrap" }}
            >
              {isAuthenticated ? "Comprar" : "Participar"}
            </Button>
          </Stack>
        </Box>
      ) : null}

      {/* Rodapé */}
      <Footer />

      {/* Modal de Quantidade antes do PIX */}
      <PurchaseQtyDialog
        open={qtyOpen}
        unitPriceCents={unitPriceCents}
        onClose={() => setQtyOpen(false)}
        onConfirm={(qty) => {
          setQtyOpen(false);
          if (pendingProduct) handleBuy(pendingProduct, unitPriceCents, qty);
        }}
      />

      {/* Modal PIX */}
      <PixModal
        open={pixOpen}
        onClose={() => { setPixOpen(false); setPixLoading(false); setPendingProduct(null); setPixData(null); }}
        loading={pixLoading}
        data={pixData}
        amount={pixAmount}
        onCopy={() => { if (pixData) navigator.clipboard.writeText(pixData.copy_paste_code || pixData.qr_code || ""); }}
        onRefresh={async () => {
          if (!pixData?.paymentId) return;
          try { const st = await checkPixStatus(pixData.paymentId); alert(`Status: ${st?.status || "pendente"}`); }
          catch { alert("Não foi possível consultar o status agora."); }
        }}
      />

      {/* Modal intermediária pós-aprovação do PIX */}
      <Dialog open={handoverOpen} onClose={() => {}} maxWidth="xs" fullWidth
              PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontSize: 20, fontWeight: 900, textAlign: "center" }}>
          Pagamento aprovado 🎉
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography sx={{ mb: 2, opacity: 0.95 }}>{handoverMsg}</Typography>
          <LinearProgress variant="determinate" value={handoverPct} />
          <Typography variant="caption" sx={{ mt: 1, display: "block", opacity: 0.75 }}>
            {handoverPct}% concluído
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button fullWidth disabled variant="outlined">Aguarde…</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
