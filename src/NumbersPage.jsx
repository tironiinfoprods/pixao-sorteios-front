// NumbersPage.jsx
// Nova lógica: usa vouchers do e-book (sem PIX).
// Quando a cartela esgota (sem números disponíveis), chama
// POST /api/infoproducts/:idOrSku/ensure-open-draw para fechar a atual
// e abrir automaticamente a próxima rodada vinculada ao mesmo infoproduto.

import * as React from "react";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import logoNewStore from "./Logo-branca-sem-fundo-768x132.png";
import { SelectionContext } from "./selectionContext";
import { useAuth } from "./authContext";

import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
} from "@mui/material";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import { trackEvent, AnalyticsEvents } from "./utils/analytics";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#67C23A" },
    secondary: { main: "#FFC107" },
    error: { main: "#D32F2F" },
    background: { default: "#0E0E0E", paper: "#121212" },
    success: { main: "#59b15f" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial"].join(","),
  },
});

const pad2 = (n) => n.toString().padStart(2, "0");
const MOCK_RESERVADOS = [];
const MOCK_INDISPONIVEIS = [];
const API_BASE = (
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE ||
  "https://newstore-backend.onrender.com"
).replace(/\/+$/, "");

/* ===================== Helpers de auth/header ===================== */
function sanitizeToken(t) {
  if (!t) return "";
  let s = String(t).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  if (/^Bearer\s+/i.test(s)) s = s.replace(/^Bearer\s+/i, "").trim();
  return s.replace(/\s+/g, "");
}
function getAuthToken() {
  try {
    const keys = ["ns_auth_token", "authToken", "token", "jwt", "access_token"];
    for (const k of keys) {
      const raw = localStorage.getItem(k) || sessionStorage.getItem(k);
      if (raw) return sanitizeToken(raw);
    }
    return "";
  } catch {
    return "";
  }
}
function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
async function getJSON(path) {
  const r = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json().catch(() => ({}));
}
async function postJSON(path, body, method = "POST") {
  const r = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify(body || {}),
  });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json().catch(() => ({}));
}

/* ===================== Reservar & Confirmar por vouchers ===================== */
async function reserveNumbers(numbers, { drawId } = {}) {
  const uniq = Array.from(new Set((numbers || []).map((n) => Number(n))))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  const payload = { numbers: uniq };
  if (Number.isFinite(drawId)) payload.draw_id = drawId;

  const r = await fetch(`${API_BASE}/api/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (r.status === 409) {
    const j = await r.json().catch(() => ({}));
    const conflicts = j?.conflicts || j?.n || j?.numbers || [];
    const list = Array.isArray(conflicts) ? conflicts.map((x) => pad2(Number(x))).join(", ") : String(conflicts);
    throw new Error(list ? `Alguns números ficaram indisponíveis/reservados: ${list}` : "numbers_conflict");
  }
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j?.error || "Falha ao reservar");
  }
  return r.json();
}

async function redeemVouchers({ numbers, reservationId, drawId, userId }) {
  const payload = {
    numbers,
    reservationId,
    reservation_id: reservationId,
    draw_id: drawId,
    user_id: userId,
  };
  const urls = [
    "/api/vouchers/consume",
    "/api/vouchers/redeem",
    "/api/numbers/confirm",
    "/api/payments/confirm-voucher",
    "/api/reservations/confirm",
  ];
  for (const path of urls) {
    const r = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (r.ok) return r.json().catch(() => ({}));
    if (r.status === 409) {
      const j = await r.json().catch(() => ({}));
      const conflicts = j?.conflicts || j?.n || j?.numbers || [];
      const list = Array.isArray(conflicts) ? conflicts.map((x) => pad2(Number(x))).join(", ") : String(conflicts || "");
      throw new Error(list ? `Alguns números entraram em conflito na confirmação: ${list}` : "numbers_conflict");
    }
    if (![404, 405].includes(r.status)) {
      const j = await r.json().catch(() => ({}));
      throw new Error(j?.error || `Falha ao confirmar (${r.status})`);
    }
  }
  throw new Error("Endpoint de confirmação por voucher não encontrado no backend.");
}

/* ============ Consulta do limite de vouchers restantes do usuário ============ */
async function fetchVouchersRemaining({ drawId, userId } = {}) {
  const qs = new URLSearchParams();
  if (drawId != null) qs.set("draw_id", String(drawId));
  if (Number.isFinite(userId)) {
    qs.set("user_id", String(userId));
    qs.set("uid", String(userId));
  }

  const urls = [
    `/api/vouchers/remaining?${qs}`,
    `/api/vouchers/me?${qs}`,
    `/api/user/vouchers?${qs}`,
    `/api/purchase-limit/check?${qs}`,
  ];

  for (const path of urls) {
    const r = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      cache: "no-store",
      headers: { ...authHeaders() },
    });
    if (!r.ok) continue;
    const j = await r.json().catch(() => ({}));

    const remaining =
      j?.vouchers_user_remaining_idx ??
      j?.remaining ??
      j?.left ??
      j?.available ??
      (Number.isFinite(j?.max) && Number.isFinite(j?.current) ? Math.max(0, j.max - j.current) : undefined);

    const max =
      j?.max ??
      j?.limit ??
      j?.total ??
      (Number.isFinite(j?.remaining) && Number.isFinite(j?.used) ? j.remaining + j.used : undefined);

    if (Number.isFinite(remaining)) {
      return { remaining: Number(remaining), max: Number.isFinite(max) ? Number(max) : null };
    }
  }
  return { remaining: 0, max: null };
}

/* ===== Helpers para esgotar -> abrir próximo draw do mesmo infoproduto ===== */
async function findInfoproductForDraw(drawId) {
  // 1) tenta /api/draws/:id
  try {
    const d1 = await getJSON(`/api/draws/${encodeURIComponent(drawId)}`);
    const ipId =
      d1?.infoproduct_id ??
      d1?.product_id ??
      d1?.info_product_id ??
      d1?.infoproduct?.id ??
      d1?.metadata?.infoproduct_id ??
      null;
    if (ipId) return { id: ipId };
  } catch {}

  // 2) tenta varrer infoprodutos e encontrar o draw dentro de /api/infoproducts/:id
  try {
    const list = await getJSON(`/api/infoproducts?limit=200`);
    const items = Array.isArray(list?.items) ? list.items : (Array.isArray(list) ? list : []);
    for (const p of items) {
      try {
        const det = await getJSON(`/api/infoproducts/${p.id}`);
        const has = Array.isArray(det?.draws) && det.draws.some((d) => Number(d?.id) === Number(drawId));
        if (has) return { id: p.id, sku: p.sku };
      } catch {}
    }
  } catch {}

  return null;
}
async function ensureOpenNextDrawFor(drawId) {
  const ip = await findInfoproductForDraw(drawId);
  if (!ip?.id && !ip?.sku) throw new Error("infoproduct_not_found_for_draw");
  const idOrSku = ip.id ?? ip.sku;
  const r = await postJSON(`/api/infoproducts/${encodeURIComponent(idOrSku)}/ensure-open-draw`, {});
  return { newDrawId: r?.draw_id ?? r?.id ?? null, total_numbers: r?.total_numbers ?? 100 };
}

/* ===================== Página ===================== */
export default function NumbersPage({
  reservados = MOCK_RESERVADOS,
  indisponiveis = MOCK_INDISPONIVEIS,
  groupUrl = "https://chat.whatsapp.com/Byb4qBRseWwC5IVyV8enRC",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const routeDrawId = location?.state?.drawId ?? null;
  const routeProduct = location?.state?.product ?? null;

  const { selecionados, setSelecionados, limparSelecao } = React.useContext(SelectionContext);
  const { user, token, logout } = useAuth();
  const isAuthenticated = !!(user?.email || user?.id || token);
  const logoTo = isAuthenticated ? "/conta" : "/";

  // Estados de números (tempo real)
  const [srvReservados, setSrvReservados] = React.useState([]);
  const [srvIndisponiveis, setSrvIndisponiveis] = React.useState([]);
  const [soldInitials, setSoldInitials] = React.useState({});
  const [currentDrawId, setCurrentDrawId] = React.useState(routeDrawId);

  // Limite por vouchers
  const [vouchers, setVouchers] = React.useState({ remaining: 0, max: null });

  // Carrossel de sorteios fechados (não sorteados)
  const [closedDraws, setClosedDraws] = React.useState([]);

  // Evita múltiplos ensures na mesma rodada (debounce do polling)
  const [ensureRequestedFor, setEnsureRequestedFor] = React.useState(null);

  // Menu avatar
  const [menuEl, setMenuEl] = React.useState(null);
  const menuOpen = Boolean(menuEl);
  const handleOpenMenu = (e) => setMenuEl(e.currentTarget);
  const handleCloseMenu = () => setMenuEl(null);
  const goConta = () => { handleCloseMenu(); navigate("/conta"); };
  const goLogin = () => { handleCloseMenu(); navigate("/login"); };
  const doLogout = () => { handleCloseMenu(); logout(); navigate("/"); };

  // Carrega config básica + draw atual (se não veio por rota)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (currentDrawId == null) {
        try {
          const r = await fetch(`${API_BASE}/api/config`, { credentials: "include", cache: "no-store" });
          if (r.ok) {
            const j = await r.json().catch(() => ({}));
            const did = j?.current_draw_id ?? j?.draw_id ?? j?.current?.id ?? j?.current_draw?.id;
            if (alive && did != null) setCurrentDrawId(did);
          }
        } catch {}
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carrega saldo de vouchers quando souber o draw
  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (currentDrawId == null) return;
      try {
        const { remaining, max } = await fetchVouchersRemaining({
          drawId: currentDrawId,
          userId: Number.isFinite(user?.id) ? Number(user.id) : undefined,
        });
        if (alive) setVouchers({ remaining, max });
      } catch {}
    })();
    return () => { alive = false; };
  }, [currentDrawId, user?.id]);

  // ★ loader reutilizável para os números do sorteio ATUAL
  const refreshNumbers = React.useCallback(async () => {
    if (currentDrawId == null) return;
    try {
      const url = `${API_BASE}/api/numbers?draw_id=${encodeURIComponent(currentDrawId)}`;
      const res = await fetch(url, { credentials: "include", cache: "no-store" });
      if (!res.ok) return;
      const j = await res.json().catch(() => ({}));

      const reserv = [];
      const indis = [];
      const initials = {};
      let total = 0;
      for (const it of j?.numbers || []) {
        total += 1;
        const st = String(it.status || "").toLowerCase();
        const num = Number(it.n);
        if (st === "reserved") reserv.push(num);
        if (st === "taken" || st === "sold") {
          indis.push(num);
          const rawInit = it.initials || it.owner_initials || it.ownerInitials || it.owner || it.oi;
          if (rawInit) initials[num] = String(rawInit).slice(0, 3).toUpperCase();
        }
      }
      // aplica estados
      setSrvReservados(Array.from(new Set(reserv)));
      setSrvIndisponiveis(Array.from(new Set(indis)));
      setSoldInitials(initials);

      // ======= AUTO-ESGOTOU? Fecha e abre a próxima rodada vinculada =======
      const availableCount = Math.max(0, total - (reserv.length + indis.length));
      if (
        total > 0 &&
        availableCount === 0 &&
        currentDrawId != null &&
        ensureRequestedFor !== currentDrawId
      ) {
        setEnsureRequestedFor(currentDrawId);
        try {
          const { newDrawId } = await ensureOpenNextDrawFor(currentDrawId);
          if (newDrawId && Number(newDrawId) !== Number(currentDrawId)) {
            // atualiza draw atual e estados/limites
            setCurrentDrawId(Number(newDrawId));
            limparSelecao();
            try {
              const fresh = await fetchVouchersRemaining({
                drawId: Number(newDrawId),
                userId: Number.isFinite(user?.id) ? Number(user.id) : undefined,
              });
              setVouchers(fresh);
            } catch {}
            // feedback visual
            setSuccessMsg(`Tabela esgotada! Nova rodada (#${newDrawId}) aberta automaticamente.`);
            setSuccessOpen(true);
          }
        } catch (e) {
          // falha silenciosa; próxima iteração tenta de novo se necessário
          console.warn("[ensure-open-draw] falhou:", e?.message || e);
        }
      }
    } catch {}
  }, [currentDrawId, ensureRequestedFor, limparSelecao, user?.id]);

  // Polling dos números (agora dependente do draw atual)
  React.useEffect(() => {
    let alive = true;
    (async () => { if (alive) await refreshNumbers(); })();
    const id = setInterval(() => { if (alive) refreshNumbers(); }, 15000);
    return () => { alive = false; clearInterval(id); };
  }, [refreshNumbers]);

  // Carregar sorteios fechados (sem vencedor)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const urls = ["/api/draws?status=closed", "/api/draws/closed", "/api/draws"];
        let list = [];
        for (const p of urls) {
          const r = await fetch(`${API_BASE}${p}`, { credentials: "include", cache: "no-store" });
          if (!r.ok) continue;
          const j = await r.json().catch(() => ({}));
          list = Array.isArray(j) ? j : (j?.draws || j?.items || []);
          if (list.length) break;
        }
        const filtered = (list || []).filter((d) => {
          const status = String(d?.status || d?.state || "").toLowerCase();
          const hasWinner = d?.winner_user_id || d?.winner || d?.winner_userid || d?.winnerId;
          return (status.includes("closed") || status.includes("fechado")) && !hasWinner;
        });
        if (alive) setClosedDraws(filtered.slice(0, 12));
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  // Seleção com limite = vouchers.remaining
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState("");
  const [lastSelected, setLastSelected] = React.useState(null);
  const maxSelectPerClick = 10; // apenas UX

  const handleClickNumero = (n) => {
    // não deixa clicar em vendidos/tomados NEM reservados
    if (srvIndisponiveis.includes(n) || srvReservados.includes(n)) return;

    setSelecionados((prev) => {
      const already = prev.includes(n);
      if (already) {
        setLastSelected(null);
        return prev.filter((x) => x !== n);
      }

      const remaining = Number.isFinite(vouchers.remaining) ? vouchers.remaining : 0;
      if (remaining <= prev.length) {
        trackEvent(AnalyticsEvents.SELECTION_ERROR, { reason: "voucher_limit", number: n });
        setSuccessMsg("Você atingiu seu limite de números disponíveis neste sorteio.");
        setSuccessOpen(true);
        return prev;
      }
      if (prev.length >= maxSelectPerClick) {
        trackEvent(AnalyticsEvents.SELECTION_ERROR, { reason: "max_per_selection", number: n });
        return prev;
      }
      trackEvent(AnalyticsEvents.NUMBER_SELECT, { number: n, totalSelected: prev.length + 1 });
      setLastSelected(n);
      return [...prev, n];
    });
  };

  const continuarDisabled =
    !selecionados.length ||
    (Number.isFinite(vouchers.remaining) && selecionados.length > Math.max(0, vouchers.remaining));

  // Confirmar usando vouchers (sem PIX)
  const [openConfirm, setOpenConfirm] = React.useState(false);

  const handleConfirmar = async () => {
    setOpenConfirm(false);

    if (!isAuthenticated) {
      navigate("/login", { replace: false, state: { from: "/numeros" } });
      return;
    }

    try {
      await refreshNumbers();
      // inclui indisponíveis (sold/taken) E reservados (por outros)
      const conflictsPre = selecionados.filter(
        (n) => srvIndisponiveis.includes(n) || srvReservados.includes(n)
      );
      if (conflictsPre.length) {
        setSuccessMsg(`Alguns números ficaram indisponíveis/reservados: ${conflictsPre.map(pad2).join(", ")}`);
        setSuccessOpen(true);
        return;
      }

      const { reservationId } = await reserveNumbers(selecionados, { drawId: currentDrawId });

      await redeemVouchers({
        numbers: selecionados,
        reservationId,
        drawId: currentDrawId,
        userId: Number.isFinite(user?.id) ? Number(user.id) : undefined,
      });

      try {
        const fresh = await fetchVouchersRemaining({
          drawId: currentDrawId,
          userId: Number.isFinite(user?.id) ? Number(user.id) : undefined,
        });
        setVouchers(fresh);
      } catch {}

      await refreshNumbers();

      setSuccessMsg("Números confirmados com sucesso! Boa sorte 🍀");
      setSuccessOpen(true);
      limparSelecao();
    } catch (e) {
      await refreshNumbers();
      setSuccessMsg(String(e?.message || "Não foi possível confirmar seus números agora."));
      setSuccessOpen(true);
    }
  };

  const reservadosAll = React.useMemo(
    () => Array.from(new Set([...(reservados || []), ...srvReservados])),
    [reservados, srvReservados]
  );
  const indisponiveisAll = React.useMemo(
    () => Array.from(new Set([...(indisponiveis || []), ...srvIndisponiveis])),
    [indisponiveis, srvIndisponiveis]
  );

  const getCellSx = (n) => {
    if (indisponiveisAll.includes(n)) {
      return {
        border: "2px solid",
        borderColor: "error.main",
        bgcolor: "rgba(211,47,47,0.3)",
        color: "#fff",
        cursor: "not-allowed",
        opacity: 0.9,
      };
    }
    if (reservadosAll.includes(n) && !selecionados.includes(n)) {
      return {
        border: "2px solid",
        borderColor: "secondary.main",
        bgcolor: "rgba(255,193,7,0.25)",
        color: "#fff",
        cursor: "not-allowed",
        opacity: 0.95,
      };
    }
    if (selecionados.includes(n)) {
      return {
        border: "2px solid",
        borderColor: "secondary.main",
        bgcolor: "rgba(255,193,7,0.35)",
        color: "#050805",
        boxShadow: "0 0 12px rgba(255,193,7,0.35)",
        transform: lastSelected === n ? "scale(1.05)" : "scale(1)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      };
    }
    return {
      border: "2px solid",
      borderColor: "primary.light",
      bgcolor: "rgba(103,194,58,0.35)",
      color: "#fff",
      minHeight: { xs: 36, sm: 32 },
      "&:hover": { bgcolor: "rgba(103,194,58,0.5)" },
      transition: "background-color 120ms ease, transform 120ms ease",
    };
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Topo */}
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Toolbar sx={{ position: "relative", minHeight: 64 }}>
          <IconButton edge="start" color="inherit" />
          <Button component={RouterLink} to="/cadastro" variant="text" sx={{ fontWeight: 700, mt: 1 }}>
            Criar conta
          </Button>

          <Box
            component={RouterLink}
            to={logoTo}
            onClick={(e) => { e.preventDefault(); navigate(logoTo); }}
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
            {isAuthenticated ? (
              <>
                <MenuItem onClick={goConta}>Área do cliente</MenuItem>
                <Divider />
                <MenuItem onClick={doLogout}>Sair</MenuItem>
              </>
            ) : (
              <MenuItem onClick={goLogin}>Entrar</MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={4}>
          {/* Cartela */}
          <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 3 }, bgcolor: "background.paper" }}>
            <Box
              sx={{
                mb: 2,
                p: { xs: 1.25, md: 1.5 },
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "linear-gradient(90deg, rgba(103,194,58,0.12), rgba(255,193,7,0.10))",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  textAlign: "center",
                  letterSpacing: 1,
                  background: "linear-gradient(90deg, #67C23A, #FFC107)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 0 12px rgba(103,194,58,0.18)",
                }}
              >
                Escolha seus números e confirme usando seus vouchers
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 2, flexWrap: "wrap", position: "sticky", top: 64, zIndex: 10, py: 1, bgcolor: "background.paper", borderRadius: 1 }}
              aria-label="Legenda dos números"
            >
              <Chip size="small" label="Disponível" sx={{ bgcolor: "rgba(103,194,58,0.35)", border: "2px solid #7CFF4D", color: "#fff", fontWeight: 700 }} />
              <Chip size="small" label="Reservado" sx={{ bgcolor: "rgba(255,193,7,0.25)", border: "2px solid #FFC107", color: "#fff", fontWeight: 700 }} />
              <Chip size="small" label="Indisponível" sx={{ bgcolor: "rgba(211,47,47,0.3)", border: "2px solid #EF5350", color: "#fff", fontWeight: 700 }} />
              <Chip size="small" label="Selecionado" sx={{ bgcolor: "rgba(255,193,7,0.35)", border: "2px solid #FFD54F", color: "#050805", fontWeight: 700 }} />
            </Stack>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Typography variant="body2" sx={{ ml: 0.5, opacity: 0.9, fontWeight: 700 }}>
                  {Number.isFinite(vouchers.remaining)
                    ? `Você pode escolher ${vouchers.remaining} número(s) agora`
                    : ""}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 900,
                    color: selecionados.length ? "secondary.main" : "text.secondary",
                  }}
                >
                  Você selecionou {selecionados.length} número(s)
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.5}>
                <Button variant="outlined" color="inherit" disabled={!selecionados.length} onClick={limparSelecao}>
                  LIMPAR SELEÇÃO
                </Button>
                <Button variant="contained" color="success" disabled={continuarDisabled} onClick={() => setOpenConfirm(true)}>
                  CONFIRMAR
                </Button>
              </Stack>
            </Stack>

            {selecionados.length > 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  mb: 2,
                  p: 1.5,
                  borderColor: "rgba(255,213,79,0.35)",
                  bgcolor: "rgba(255,193,7,0.06)",
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.85, display: "block", mb: 0.5 }}>
                  Resumo da seleção
                </Typography>
                {routeProduct?.title ? (
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Plano: {routeProduct.title}
                  </Typography>
                ) : null}
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  Números: {selecionados.slice().sort((a, b) => a - b).map(pad2).join(", ")}
                </Typography>
              </Paper>
            ) : null}

            {/* Grid 10x10 */}
            <Box sx={{ width: { xs: "calc(100vw - 32px)", sm: "calc(100vw - 64px)", md: "100%" }, maxWidth: 640, aspectRatio: "1 / 1", mx: "auto" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
                  gridTemplateRows: "repeat(10, minmax(0, 1fr))",
                  gap: { xs: 1.1, md: 1.2 },
                  height: "100%",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                {Array.from({ length: 100 }).map((_, idx) => {
                  const sold = indisponiveisAll.includes(idx);
                  const reserved = reservadosAll.includes(idx);
                  const initials = soldInitials[idx];
                  return (
                    <Box
                      key={idx}
                      onClick={() => handleClickNumero(idx)}
                      className={selecionados.includes(idx) && lastSelected === idx ? "number-selected-pulse" : undefined}
                      sx={{
                        ...getCellSx(idx),
                        borderRadius: 1.2,
                        userSelect: "none",
                        cursor: sold || reserved ? "not-allowed" : "pointer",
                        aspectRatio: "1 / 1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontVariantNumeric: "tabular-nums",
                        position: "relative",
                      }}
                    >
                      <Box component="span" sx={{ display: { xs: sold ? "none" : "inline", md: "inline" } }}>
                        {pad2(idx)}
                      </Box>

                      {/* Mobile overlay quando vendido */}
                      {sold && (
                        <Box
                          sx={{
                            display: { xs: "flex", md: "none" },
                            position: "absolute",
                            inset: 0,
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: 0.25,
                            pointerEvents: "none",
                          }}
                        >
                          <Box sx={{ fontWeight: 900, lineHeight: 1 }}>{pad2(idx)}</Box>
                          {initials && (
                            <Box
                              sx={{
                                mt: 0.25,
                                px: 0.5,
                                py: 0.1,
                                borderRadius: 0.75,
                                fontSize: 10,
                                fontWeight: 900,
                                lineHeight: 1,
                                backgroundColor: "rgba(0,0,0,0.45)",
                                color: "#fff",
                                letterSpacing: 0.5,
                              }}
                            >
                              {initials}
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Desktop badge com iniciais */}
                      {sold && initials && (
                        <Box
                          sx={{
                            display: { xs: "none", md: "block" },
                            position: "absolute",
                            right: 4,
                            bottom: 4,
                            px: 0.5,
                            py: 0.1,
                            borderRadius: 0.75,
                            fontSize: 10,
                            fontWeight: 900,
                            lineHeight: 1,
                            backgroundColor: "rgba(0,0,0,0.45)",
                            color: "#fff",
                            letterSpacing: 0.5,
                            pointerEvents: "none",
                            zIndex: 2,
                          }}
                        >
                          {initials}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Observação */}
            <Box sx={{ mt: 2.5, textAlign: "center" }}>
              {(() => {
                const d = new Date();
                d.setDate(d.getDate() + 7);
                const dia = String(d.getDate()).padStart(2, "0");
                return (
                  <Typography variant="subtitle1" sx={{ opacity: 0.95, fontWeight: 800 }}>
                    📅 Utilizaremos o sorteio do dia <strong>{dia}</strong> ou o primeiro sorteio da{" "}
                    <strong>Lotomania</strong> após a tabela fechada. 🎯
                  </Typography>
                );
              })()}
            </Box>
          </Paper>

          {/* Carrossel — Sorteios fechados (não sorteados) */}
          {!!closedDraws.length && (
            <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "background.paper" }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                Sorteios fechados (aguardando sorteio)
              </Typography>
              <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1 }}>
                {closedDraws.map((d) => {
                  const id = d?.id ?? d?.draw_id ?? d?._id ?? Math.random();
                  const title = d?.title || d?.name || `Sorteio #${id}`;
                  const img =
                    d?.cover_url || d?.image || d?.banner || d?.thumb ||
                    "https://via.placeholder.com/200x120?text=Sorteio";
                  return (
                    <Card key={id} sx={{ minWidth: 220, maxWidth: 240, flex: "0 0 auto" }}>
                      <CardActionArea disabled>
                        <CardMedia component="img" height="120" image={img} alt={title} />
                        <CardContent sx={{ py: 1.25 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap title={title}>
                            {title}
                          </Typography>
                          <Chip size="small" label="Fechado" color="warning" variant="outlined" sx={{ mt: 0.75 }} />
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  );
                })}
              </Box>
            </Paper>
          )}

          {/* Convite para o grupo */}
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              bgcolor: "rgba(103, 194, 58, 0.05)",
              borderColor: "primary.main",
            }}
          >
            <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>
              Clique no link abaixo e faça parte do <br /> grupo do sorteio!
            </Typography>
            <Typography sx={{ opacity: 0.85, mb: 2 }}>
              Lá você acompanha novidades, abertura de novas rodadas e avisos importantes.
            </Typography>
            <Button
              component="a"
              href={groupUrl}
              target="_blank"
              rel="noopener"
              size="large"
              variant="contained"
              color="success"
              sx={{ px: 4, py: 1.5, fontWeight: 800, letterSpacing: 0.5 }}
            >
              SIM, EU QUERO PARTICIPAR!
            </Button>
          </Paper>
        </Stack>
      </Container>

      {/* Confirmar seleção */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontSize: 22, fontWeight: 800, textAlign: "center" }}>
          Confirmar números usando vouchers
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          {selecionados.length ? (
            <>
              <Typography variant="body2" sx={{ opacity: 0.85, mb: 1 }}>
                Você selecionou {selecionados.length} {selecionados.length === 1 ? "número" : "números"}:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, mb: 1 }}>
                {selecionados.slice().sort((a, b) => a - b).map(pad2).join(", ")}
              </Typography>
              {Number.isFinite(vouchers.remaining) && (
                <Typography variant="caption" sx={{ opacity: 0.75 }}>
                  Você ainda pode confirmar {Math.max(0, vouchers.remaining)} número(s) neste sorteio.
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Nenhum número selecionado.
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            gap: 1.2,
            flexWrap: "wrap",
            flexDirection: { xs: "column", sm: "row" },
            "& > *": { flex: 1 },
          }}
        >
          <Button variant="outlined" onClick={() => setOpenConfirm(false)} sx={{ py: 1.2, fontWeight: 700 }}>
            VOLTAR
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              limparSelecao();
              setOpenConfirm(false);
            }}
            disabled={!selecionados.length}
            sx={{ py: 1.2, fontWeight: 700 }}
          >
            LIMPAR SELEÇÃO
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmar}
            disabled={continuarDisabled}
            sx={{ py: 1.2, fontWeight: 700 }}
          >
            CONFIRMAR
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mensagens de sucesso/erro */}
      <Dialog open={successOpen} onClose={() => setSuccessOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontSize: 20, fontWeight: 900, textAlign: "center" }}>Aviso</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography sx={{ opacity: 0.95 }}>{successMsg}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button fullWidth variant="contained" color="success" onClick={() => setSuccessOpen(false)} sx={{ py: 1.1, fontWeight: 800 }}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
