// NumbersPage.jsx
// Tela separada só com a tabela de números + fluxo de pagamento
import * as React from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import logoNewStore from "./Logo-branca-sem-fundo-768x132.png";
import { SelectionContext } from "./selectionContext";
import PixModal from "./PixModal";
import { createPixPayment, checkPixStatus } from "./services/pix";
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
} from "@mui/material";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";

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

// ===== Helpers de auth + reserva =====
function sanitizeToken(t) {
  if (!t) return "";
  let s = String(t).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  )
    s = s.slice(1, -1);
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
async function reserveNumbers(numbers) {
  const token = getAuthToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const r = await fetch(`${API_BASE}/api/reservations`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ numbers }),
  });

  if (r.status === 409) {
    const j = await r.json().catch(() => ({}));
    const c = j?.conflicts || j?.n || [];
    throw new Error(
      `Alguns números ficaram indisponíveis: ${
        Array.isArray(c) ? c.join(", ") : c
      }`
    );
  }
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j?.error || "Falha ao reservar");
  }
  return r.json();
}

// Checagem do limite no backend
async function checkUserPurchaseLimit({ addCount = 0, drawId } = {}) {
  const qs = new URLSearchParams();
  qs.set("add", String(addCount));
  if (drawId != null) qs.set("draw_id", String(drawId));

  let res = await fetch(`${API_BASE}/api/purchase-limit/check?${qs}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 401) {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    res = await fetch(`${API_BASE}/api/purchase-limit/check?${qs}`, {
      credentials: "include",
      cache: "no-store",
      headers,
    });
  }

  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error(`limit_check_${res.status}`);

  const j = await res.json().catch(() => ({}));
  const blocked = !!(j?.blocked ?? j?.limitReached ?? j?.reached ?? j?.exceeded);
  const current = j?.current ?? j?.cnt ?? j?.count ?? null;
  const max = j?.max ?? j?.limit ?? j?.MAX ?? null;
  return { blocked, current, max };
}

export default function NumbersPage({
  reservados = MOCK_RESERVADOS,
  indisponiveis = MOCK_INDISPONIVEIS,
  groupUrl = "https://chat.whatsapp.com/Byb4qBRseWwC5IVyV8enRC",
}) {
  const navigate = useNavigate();
  const { selecionados, setSelecionados, limparSelecao } =
    React.useContext(SelectionContext);
  const { user, token, logout } = useAuth();
  const isAuthenticated = !!(user?.email || user?.id || token);
  const logoTo = isAuthenticated ? "/conta" : "/";

  // Estados do backend
  const [srvReservados, setSrvReservados] = React.useState([]);
  const [srvIndisponiveis, setSrvIndisponiveis] = React.useState([]);
  const [soldInitials, setSoldInitials] = React.useState({});

  const FALLBACK_PRICE = Number(process.env.REACT_APP_PIX_PRICE) || 55;
  const [unitPrice, setUnitPrice] = React.useState(FALLBACK_PRICE);
  const [bannerTitle, setBannerTitle] = React.useState("");
  const [maxSelect, setMaxSelect] = React.useState(5);
  const [currentDrawId, setCurrentDrawId] = React.useState(null);

  const [limitUsage, setLimitUsage] = React.useState({ current: null, max: null });

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/config`, {
          credentials: "include",
          cache: "no-store",
        });
        if (res.ok) {
          const j = await res.json().catch(() => ({}));

          const cents =
            j?.ticket_price_cents ??
            j?.price_cents ??
            j?.current?.price_cents ??
            j?.current_draw?.price_cents;
          const reais =
            cents != null && Number.isFinite(Number(cents))
              ? Number(cents) / 100
              : Number(j?.ticket_price ?? j?.price);
          if (alive && Number.isFinite(reais) && reais > 0) setUnitPrice(reais);

          const did =
            j?.current_draw_id ??
            j?.draw_id ??
            j?.current?.id ??
            j?.current_draw?.id;
          if (alive && did != null) setCurrentDrawId(did);

          if (alive && typeof j?.banner_title === "string") setBannerTitle(j.banner_title);

          const maxSel =
            j?.max_numbers_per_selection ?? j?.max_select ?? j?.selection_limit;
          if (alive && Number.isFinite(Number(maxSel)) && Number(maxSel) > 0) {
            setMaxSelect(Number(maxSel));
          }
        }
      } catch {}
      finally {
        try {
          const info = await checkUserPurchaseLimit({ addCount: 0, drawId: currentDrawId });
          if (alive) setLimitUsage({ current: info.current, max: info.max });
        } catch {}
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE]);

  // Polling /api/numbers
  React.useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/numbers`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const j = await res.json();

        const reserv = [];
        const indis = [];
        const initials = {};

        for (const it of j?.numbers || []) {
          const st = String(it.status || "").toLowerCase();
          const num = Number(it.n);
          if (st === "reserved") reserv.push(num);
          if (st === "taken" || st === "sold") {
            indis.push(num);
            const rawInit =
              it.initials || it.owner_initials || it.ownerInitials || it.owner || it.oi;
            if (rawInit) initials[num] = String(rawInit).slice(0, 3).toUpperCase();
          }
        }
        if (!alive) return;
        setSrvReservados(Array.from(new Set(reserv)));
        setSrvIndisponiveis(Array.from(new Set(indis)));
        setSoldInitials(initials);
      } catch {}
    }
    load();
    const id = setInterval(load, 15000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const reservadosAll = React.useMemo(
    () => Array.from(new Set([...(reservados || []), ...srvReservados])),
    [reservados, srvReservados]
  );
  const indisponiveisAll = React.useMemo(
    () => Array.from(new Set([...(indisponiveis || []), ...srvIndisponiveis])),
    [indisponiveis, srvIndisponiveis]
  );

  // menu avatar
  const [menuEl, setMenuEl] = React.useState(null);
  const menuOpen = Boolean(menuEl);
  const handleOpenMenu = (e) => setMenuEl(e.currentTarget);
  const handleCloseMenu = () => setMenuEl(null);
  const goConta = () => { handleCloseMenu(); navigate("/conta"); };
  const goLogin = () => { handleCloseMenu(); navigate("/login"); };
  const doLogout = () => { handleCloseMenu(); logout(); navigate("/"); };

  // modal confirmação
  const [open, setOpen] = React.useState(false);
  const handleAbrirConfirmacao = () => setOpen(true);
  const handleFechar = () => setOpen(false);

  // PIX modal
  const [pixOpen, setPixOpen] = React.useState(false);
  const [pixLoading, setPixLoading] = React.useState(false);
  const [pixData, setPixData] = React.useState(null);
  const [pixAmount, setPixAmount] = React.useState(0);

  // sucesso PIX
  const [pixApproved, setPixApproved] = React.useState(false);
  const handlePixApproved = React.useCallback(() => {
    setPixApproved(true);
    setPixOpen(false);
    setPixLoading(false);
  }, []);

  // Modal de limite
  const [limitOpen, setLimitOpen] = React.useState(false);
  const [limitInfo, setLimitInfo] = React.useState({ type: "purchase", current: undefined, max: undefined });
  const openLimitModal = (info) => { setLimitInfo(info || { type: "purchase" }); setLimitOpen(true); };

  const remainingFromServer = (limitUsage.max ?? Infinity) - (limitUsage.current ?? 0);

  const handleIrPagamento = async () => {
    setOpen(false);

    if (!isAuthenticated) {
      navigate("/login", { replace: false, state: { from: "/numeros", wantPay: true } });
      return;
    }

    const addCount = selecionados.length || 1;

    try {
      const { blocked, current, max } = await checkUserPurchaseLimit({ addCount, drawId: currentDrawId });
      const wouldBe = (current ?? 0) + addCount;
      const overByFront = Number.isFinite(max) && wouldBe > max;

      if (blocked || overByFront) {
        openLimitModal({
          type: "purchase",
          current: current ?? limitUsage.current,
          max: max ?? limitUsage.max ?? 5,
        });
        setLimitUsage({ current: current ?? 0, max: max ?? 5 });
        return;
      }
    } catch (e) {
      console.warn("[limit-check] falhou, seguindo fluxo]:", e);
    }

    const amount = selecionados.length * unitPrice;
    setPixAmount(amount);
    setPixOpen(true);
    setPixLoading(true);
    setPixApproved(false);

    try {
      const { reservationId } = await reserveNumbers(selecionados);
      const data = await createPixPayment({
        orderId: String(Date.now()),
        amount,
        numbers: selecionados,
        reservationId,
      });
      setPixData(data);

      setLimitUsage((old) => ({
        current: Number.isFinite(old.current) ? (old.current ?? 0) + addCount : old.current,
        max: old.max,
      }));
    } catch (e) {
      alert(e.message || "Falha ao gerar PIX");
      setPixOpen(false);
    } finally {
      setPixLoading(false);
    }
  };

  // Polling de status PIX
  React.useEffect(() => {
    if (!pixOpen || !pixData?.paymentId || pixApproved) return;
    const id = setInterval(async () => {
      try {
        const st = await checkPixStatus(pixData.paymentId);
        if (st?.status === "approved") handlePixApproved();
      } catch {}
    }, 3500);
    return () => clearInterval(id);
  }, [pixOpen, pixData, pixApproved, handlePixApproved]);

  // Seleção
  const isReservado = (n) => reservadosAll.includes(n);
  const isIndisponivel = (n) => indisponiveisAll.includes(n);
  const isSelecionado = (n) => selecionados.includes(n);
  const handleClickNumero = (n) => {
    if (isIndisponivel(n)) return;
    setSelecionados((prev) => {
      const already = prev.includes(n);
      if (already) return prev.filter((x) => x !== n);

      if (prev.length >= maxSelect) {
        openLimitModal({ type: "selection", current: maxSelect, max: maxSelect });
        return prev;
      }

      if (Number.isFinite(remainingFromServer) && remainingFromServer <= prev.length) {
        openLimitModal({ type: "purchase", current: limitUsage.current ?? 0, max: limitUsage.max ?? 5 });
        return prev;
      }

      return [...prev, n];
    });
  };

  const getCellSx = (n) => {
    if (isIndisponivel(n)) {
      return {
        border: "2px solid",
        borderColor: "error.main",
        bgcolor: "rgba(211,47,47,0.15)",
        color: "grey.300",
        cursor: "not-allowed",
        opacity: 0.85,
      };
    }
    if (isSelecionado(n) || isReservado(n)) {
      return {
        border: "2px solid",
        borderColor: "secondary.main",
        bgcolor: "rgba(255,193,7,0.12)",
      };
    }
    return {
      border: "2px solid rgba(255,255,255,0.08)",
      bgcolor: "primary.main",
      color: "#0E0E0E",
      "&:hover": { filter: "brightness(0.95)" },
      transition: "filter 120ms ease",
    };
  };

  const continuarDisabled =
    !selecionados.length ||
    (Number.isFinite(remainingFromServer) &&
      selecionados.length > Math.max(0, remainingFromServer));

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
            onClick={(e) => {
              e.preventDefault();
              navigate(logoTo);
            }}
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
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
          {/* Cartela (tabela) */}
          <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 3 }, bgcolor: "background.paper" }}>
            {/* Banner dinâmico */}
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
                {bannerTitle || "Escolha seus números e boa sorte!"}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Chip size="small" label="DISPONÍVEL" sx={{ bgcolor: "primary.main", color: "#0E0E0E", fontWeight: 700 }} />
                <Chip
                  size="small"
                  label="RESERVADO"
                  sx={{ bgcolor: "rgba(255,193,7,0.18)", border: "1px solid", borderColor: "secondary.main", color: "secondary.main", fontWeight: 700 }}
                />
                <Chip
                  size="small"
                  label="INDISPONÍVEL"
                  sx={{ bgcolor: "rgba(211,47,47,0.18)", border: "1px solid", borderColor: "error.main", color: "error.main", fontWeight: 700 }}
                />
                <Typography variant="body2" sx={{ ml: 0.5, opacity: 0.9 }}>
                  {Number.isFinite(limitUsage.max) && Number.isFinite(limitUsage.current)
                    ? `• Você tem ${Math.max(0, (limitUsage.max ?? 0) - (limitUsage.current ?? 0))} de ${limitUsage.max} possíveis`
                    : " "}
                </Typography>
                {!!selecionados.length && (
                  <Typography variant="body2" sx={{ ml: 1, opacity: 0.8 }}>
                    • {selecionados.length} selecionado(s) (máx. {maxSelect} por seleção)
                  </Typography>
                )}
              </Stack>

              <Stack direction="row" spacing={1.5}>
                <Button variant="outlined" color="inherit" disabled={!selecionados.length} onClick={limparSelecao}>
                  LIMPAR SELEÇÃO
                </Button>
                <Button variant="contained" color="success" disabled={continuarDisabled} onClick={handleAbrirConfirmacao}>
                  CONTINUAR
                </Button>
              </Stack>
            </Stack>

            {/* Grid 10x10 */}
            <Box
              sx={{
                width: { xs: "calc(100vw - 32px)", sm: "calc(100vw - 64px)", md: "100%" },
                maxWidth: 640,
                aspectRatio: "1 / 1",
                mx: "auto",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
                  gridTemplateRows: "repeat(10, minmax(0, 1fr))",
                  gap: { xs: 1, md: 1.2 },
                  height: "100%",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                {Array.from({ length: 100 }).map((_, idx) => {
                  const sold = indisponiveisAll.includes(idx);
                  const initials = soldInitials[idx];
                  return (
                    <Box
                      key={idx}
                      onClick={() => handleClickNumero(idx)}
                      sx={{
                        ...getCellSx(idx),
                        borderRadius: 1.2,
                        userSelect: "none",
                        cursor: sold ? "not-allowed" : "pointer",
                        aspectRatio: "1 / 1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontVariantNumeric: "tabular-nums",
                        position: "relative",
                      }}
                    >
                      <Box
                        component="span"
                        sx={{ display: { xs: sold ? "none" : "inline", md: "inline" } }}
                      >
                        {pad2(idx)}
                      </Box>

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

            {/* Linha inferior (texto curto) */}
            <Box sx={{ mt: 2.5, textAlign: "center" }}>
              {(() => {
                const d = new Date();
                d.setDate(d.getDate() + 7);
                const dia = String(d.getDate()).padStart(2, "0");
                return (
                  <Typography variant="subtitle1" sx={{ opacity: 0.95, fontWeight: 800 }}>
                    📅 Utilizaremos o sorteio do dia <strong>{dia}</strong> ou o
                    primeiro sorteio da <strong>Lotomania</strong> após a tabela fechada. 🎯
                  </Typography>
                );
              })()}
            </Box>
          </Paper>

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

      {/* Modais */}
      <Dialog open={open} onClose={handleFechar} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontSize: 22, fontWeight: 800, textAlign: "center" }}>
          Confirme sua seleção
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
              <Typography variant="body1" sx={{ mt: 0.5, mb: 1 }}>
                Total: <strong>R$ {(selecionados.length * unitPrice).toFixed(2)}</strong>
              </Typography>
              {Number.isFinite(remainingFromServer) && (
                <Typography variant="caption" sx={{ opacity: 0.75 }}>
                  Você ainda pode comprar {Math.max(0, remainingFromServer)} número(s) neste sorteio.
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
          <Button variant="outlined" onClick={handleFechar} sx={{ py: 1.2, fontWeight: 700 }}>
            SELECIONAR MAIS NÚMEROS
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              limparSelecao();
              setOpen(false);
            }}
            disabled={!selecionados.length}
            sx={{ py: 1.2, fontWeight: 700 }}
          >
            LIMPAR SELEÇÃO
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleIrPagamento}
            disabled={continuarDisabled}
            sx={{ py: 1.2, fontWeight: 700 }}
          >
            IR PARA PAGAMENTO
          </Button>
        </DialogActions>
      </Dialog>

      <PixModal
        open={pixOpen}
        onClose={() => {
          setPixOpen(false);
          setPixApproved(false);
        }}
        loading={pixLoading}
        data={pixData}
        amount={pixAmount}
        onCopy={() => {
          if (pixData) {
            navigator.clipboard.writeText(pixData.copy_paste_code || pixData.qr_code || "");
          }
        }}
        onRefresh={async () => {
          if (!pixData?.paymentId) {
            setPixOpen(false);
            return;
          }
          try {
            const st = await checkPixStatus(pixData.paymentId);
            if (st.status === "approved") {
              handlePixApproved();
            } else {
              alert(`Status: ${st.status || "pendente"}`);
            }
          } catch {
            alert("Não foi possível consultar o status agora.");
          }
        }}
      />

      <Dialog open={pixApproved} onClose={() => setPixApproved(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontSize: 22, fontWeight: 900, textAlign: "center" }}>
          Pagamento confirmado! 🎉
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Seus números foram reservados.
          </Typography>
          <Typography sx={{ opacity: 0.9 }}>
            Boa sorte! Você pode acompanhar tudo na <strong>Área do cliente</strong>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button fullWidth variant="contained" color="success" onClick={() => setPixApproved(false)} sx={{ py: 1.2, fontWeight: 800 }}>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Limite atingido */}
      <Dialog open={limitOpen} onClose={() => setLimitOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontSize: 20, fontWeight: 900, textAlign: "center" }}>
          {limitInfo?.type === "selection"
            ? `Você pode selecionar no máximo ${maxSelect} números`
            : "Número máximo de compras por usuário atingido"}
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography sx={{ opacity: 0.9 }}>
            {limitInfo?.type === "selection"
              ? "Para continuar, remova um número antes de adicionar outro."
              : "Você já alcançou o limite de números neste sorteio."}
          </Typography>
          {(Number.isFinite(limitInfo?.current) || Number.isFinite(limitInfo?.max)) && (
            <Typography sx={{ mt: 1, fontWeight: 700 }}>
              ({limitInfo?.current ?? "-"} de {limitInfo?.max ?? "-"})
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button fullWidth variant="contained" onClick={() => setLimitOpen(false)} sx={{ py: 1.1, fontWeight: 800 }}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
