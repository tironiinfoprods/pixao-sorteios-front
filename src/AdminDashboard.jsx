// src/AdminDashboard.jsx
import * as React from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  ButtonBase,
  Container,
  CssBaseline,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import logoNewStore from "./Logo-branca-sem-fundo-768x132.png";
import { useAuth } from "./authContext";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#2E7D32" },
    background: { default: "#0E0E0E", paper: "#121212" },
    warning: { main: "#B58900" },
  },
  shape: { borderRadius: 16 },
  typography: { fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial"].join(",") },
});

/* ---------- helpers de API (robusto com /api) ---------- */
const RAW_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE ||
  "/api";
const API_BASE = String(RAW_BASE).replace(/\/+$/, "");

const apiJoin = (path) => {
  let p = path.startsWith("/") ? path : `/${path}`;
  const baseHasApi = /\/api\/?$/.test(API_BASE);
  if (baseHasApi && p.startsWith("/api/")) p = p.slice(4);
  if (!baseHasApi && !p.startsWith("/api/")) p = `/api${p}`;
  return `${API_BASE}${p}`;
};

const authHeaders = () => {
  const tk =
    localStorage.getItem("ns_auth_token") ||
    sessionStorage.getItem("ns_auth_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token");
  return tk
    ? { Authorization: `Bearer ${String(tk).replace(/^Bearer\s+/i, "").replace(/^["']|["']$/g, "")}` }
    : {};
};

async function getJSON(path) {
  const r = await fetch(apiJoin(path), {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "omit",
    cache: "no-store", // evita cache 304
  });
  if (!r.ok) {
    let err = `${r.status}`;
    try { const j = await r.json(); if (j?.error) err = j.error; } catch {}
    throw new Error(err);
  }
  return r.json();
}
async function postJSON(path, body, method = "POST") {
  const r = await fetch(apiJoin(path), {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "omit",
    body: JSON.stringify(body || {}),
  });
  if (!r.ok) {
    let err = `${r.status}`;
    try { const j = await r.json(); if (j?.error) err = j.error; } catch {}
    throw new Error(err);
  }
  return r.json().catch(() => ({}));
}

/* ---------- Card grande clicável (as 3 listas) ---------- */
function BigCard({ children, color, outlined = false, onClick }) {
  return (
    <ButtonBase onClick={onClick} sx={{ width: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          bgcolor: outlined ? "transparent" : color,
          border: outlined ? "1px solid rgba(255,255,255,0.16)" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: { xs: 120, md: 140 },
          transition: "transform 120ms ease, filter 120ms ease",
          "&:hover": { transform: "translateY(-2px)", filter: "brightness(1.02)" },
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontWeight: 900,
            letterSpacing: 2,
            fontSize: { xs: 18, md: 28 },
            lineHeight: 1.25,
            color: outlined ? "rgba(255,255,255,0.85)" : "#fff",
            textTransform: "uppercase",
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        >
          {children}
        </Typography>
      </Paper>
    </ButtonBase>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // resumo
  const [drawId, setDrawId] = React.useState(null);
  const [sold, setSold] = React.useState(0);
  const [remaining, setRemaining] = React.useState(0);

  // preço (em centavos)
  const [price, setPrice] = React.useState("");

  // novos campos
  const [maxSelect, setMaxSelect] = React.useState(5);
  const [bannerTitle, setBannerTitle] = React.useState("");

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  // ===== NOVO: dados para tabela de sorteios e mapeamento de infoprodutos =====
  const [draws, setDraws] = React.useState([]);
  const [loadingDraws, setLoadingDraws] = React.useState(true);
  const [infoproducts, setInfoproducts] = React.useState([]);
  const [ipByDraw, setIpByDraw] = React.useState({}); // draw_id -> {id,title,price_cents}

  // ======= carregamento de resumo/topo =======
  const loadSummary = React.useCallback(async () => {
    setLoading(true);
    try {
      // resumo do dashboard
      const r = await getJSON("/admin/dashboard/summary");
      setDrawId(r.draw_id ?? null);
      setSold(r.sold ?? 0);
      setRemaining(r.remaining ?? 0);
      if (Number.isFinite(Number(r.price_cents))) {
        setPrice(String(Number(r.price_cents)));
      }

      // configurações públicas
      try {
        const cfg = await getJSON("/config");

        const cfgCents =
          cfg?.ticket_price_cents ??
          cfg?.price_cents ??
          cfg?.current?.price_cents ??
          cfg?.current_draw?.price_cents ??
          null;
        if (cfgCents != null && Number.isFinite(Number(cfgCents))) {
          setPrice(String(Number(cfgCents)));
        }

        const maxSel =
          cfg?.max_numbers_per_selection ??
          cfg?.max_per_selection ??
          cfg?.max_select ??
          null;
        if (maxSel != null && !Number.isNaN(Number(maxSel))) {
          setMaxSelect(Number(maxSel));
        }

        const banner =
          cfg?.banner_title ??
          cfg?.promo_title ??
          cfg?.headline ??
          "";
        if (banner != null) setBannerTitle(String(banner));
      } catch (e) {
        console.warn("[AdminDashboard] GET /config opcional:", e?.message || e);
      }
    } catch (e) {
      console.error("[AdminDashboard] GET /summary failed:", e);
      setDrawId(null);
      setSold(0);
      setRemaining(0);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { loadSummary(); }, [loadSummary]);

  // ======= NOVO: carrega infoprodutos e cria mapa draw_id -> infoproduto =======
  const loadInfoproductsAndMap = React.useCallback(async () => {
    try {
      // pega MUITOS de uma vez (evita paginação pequena)
      const listResp = await getJSON("/infoproducts?limit=200");
      const items = Array.isArray(listResp?.items) ? listResp.items : (Array.isArray(listResp) ? listResp : []);
      const ips = items.map(p => ({
        id: p.id,
        title: p.title || p.sku || `#${p.id}`,
        price_cents: Number(p.price_cents ?? 0),
      }));
      setInfoproducts(ips);

      // para mapear com segurança, buscamos os draws de cada infoproduto via GET /infoproducts/:id
      const pairs = {};
      for (const p of ips) {
        try {
          const det = await getJSON(`/infoproducts/${p.id}`);
          const dlist = det?.draws || [];
          for (const d of dlist) {
            const did = d?.id;
            if (did != null) {
              pairs[String(did)] = {
                id: p.id,
                title: p.title,
                // preço do sorteio vem do produto (price_cents) – coerente com seu backend
                price_cents: p.price_cents,
              };
            }
          }
        } catch {}
      }
      setIpByDraw(pairs);
    } catch (e) {
      console.warn("[AdminDashboard] loadInfoproductsAndMap skipped:", e?.message || e);
      setInfoproducts([]);
      setIpByDraw({});
    }
  }, []);

  // ======= carrega sorteios e funde com mapa de infoprodutos quando possível =======
  const normalizeDraw = (d) => {
    const ip = d?.infoproduct || d?.product || d?.ip || null;
    const ipId =
      d?.infoproduct_id ??
      d?.product_id ??
      d?.info_product_id ??
      d?.infoproductid ??
      d?.metadata?.infoproduct_id ??
      ip?.id ??
      null;

    const ipTitle =
      d?.infoproduct_title ??
      d?.product_title ??
      d?.metadata?.infoproduct_title ??
      d?.infoproduct_sku ??
      d?.sku ??
      ip?.title ??
      ip?.name ??
      null;

    const ipPrice =
      d?.infoproduct_price_cents ??
      d?.product_price_cents ??
      d?.price_cents_from_infoproduct ??
      d?.metadata?.price_cents ??
      ip?.price_cents ??
      ip?.amount_cents ??
      ip?.price ??
      null;

    return {
      id: d?.id ?? d?.draw_id ?? d?._id ?? null,
      title: d?.title ?? d?.name ?? `Sorteio #${d?.id ?? d?.draw_id ?? "?"}`,
      status: String(d?.status ?? d?.state ?? "open").toLowerCase(),
      price_cents: Number(
        d?.price_cents ??
        d?.ticket_price_cents ??
        d?.price ??
        d?.ticket_price ??
        0
      ),
      numbers_total: Number(d?.numbers_total ?? d?.total_numbers ?? d?.numbers_count ?? 100),
      max_per_user: Number(
        d?.max_per_user ??
        d?.limit_per_user ??
        d?.purchase_limit ??
        d?.max_per_user_per_draw ??
        1
      ),
      infoproduct_id: ipId,
      ipTitle: ipTitle,
      ipPriceCents: ipPrice != null ? Number(ipPrice) : null,
    };
  };

  const annotateFromMap = (d, map) => {
    const m = map[String(d.id)];
    if (!m) return d;
    return {
      ...d,
      infoproduct_id: d.infoproduct_id ?? m.id ?? null,
      ipTitle: d.ipTitle ?? m.title ?? null,
      ipPriceCents: d.ipPriceCents ?? m.price_cents ?? null,
    };
  };

  const loadDraws = React.useCallback(async () => {
    setLoadingDraws(true);
    try {
      let list = [];
      try {
        const r = await getJSON("/admin/draws");
        list = Array.isArray(r) ? r : r?.draws || r?.items || [];
      } catch {
        const r = await getJSON("/draws");
        list = Array.isArray(r) ? r : r?.draws || r?.items || [];
      }
      const base = list.map(normalizeDraw);
      // aplica mapeamento conhecido (se já carregado)
      const merged = base.map(d => annotateFromMap(d, ipByDraw));
      setDraws(merged);
    } catch (e) {
      console.error("[AdminDashboard] load draws failed:", e?.message || e);
      setDraws([]);
    } finally {
      setLoadingDraws(false);
    }
  }, [ipByDraw]);

  React.useEffect(() => {
    // primeiro carrega infoprodutos + mapa; depois sorteios
    (async () => {
      await loadInfoproductsAndMap();
      await loadDraws();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // quando o mapa for atualizado depois, reanotar a lista atual
  React.useEffect(() => {
    if (!draws.length) return;
    setDraws(prev => prev.map(d => annotateFromMap(d, ipByDraw)));
  }, [ipByDraw]); // eslint-disable-line react-hooks/exhaustive-deps

  // SALVAR: mantém o fluxo do preço que já funciona e tenta salvar os novos campos
  const onSaveAll = async () => {
    setSaving(true);
    let msg = "Configurações atualizadas.";
    try {
      // 1) preço — usa a rota que já funciona hoje
      const priceCents = Math.max(0, Math.floor(Number(price || 0)));
      await postJSON("/admin/dashboard/ticket-price", { price_cents: priceCents });

      // 2) banner + max — tenta POST /config (se seu backend ainda não tiver, isso cairá no catch)
      try {
        await postJSON("/config", {
          banner_title: String(bannerTitle || ""),
          max_numbers_per_selection: Math.max(1, Math.floor(Number(maxSelect || 1))),
        });
      } catch (e) {
        console.warn("[AdminDashboard] POST /config falhou:", e?.message || e);
        msg =
          "Preço atualizado. Para salvar 'Frase promocional' e 'Máximo de tickets', habilite POST /api/config no backend.";
      }

      await loadSummary();
      alert(msg);
    } catch (e) {
      console.error("[AdminDashboard] salvar configs falhou:", e);
      alert("Não foi possível atualizar as configurações agora.");
    } finally {
      setSaving(false);
    }
  };

  const onNewDraw = async () => {
    try {
      setCreating(true);
      await postJSON("/admin/dashboard/new", {});
      await loadSummary();
      await loadDraws();
    } catch (e) {
      console.error("[AdminDashboard] POST /new failed:", e);
    } finally {
      setCreating(false);
    }
  };

  // ===== CRUD local dos sorteios (edição rápida) =====
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState({
    id: null,
    title: "",
    status: "open",
    price_cents: 0,
    numbers_total: 100,
    max_per_user: 1,
    infoproduct_id: null,
  });
  const openNew = () => {
    setEditing({
      id: null,
      title: "",
      status: "open",
      price_cents: 0,
      numbers_total: 100,
      max_per_user: 1,
      infoproduct_id: null,
    });
    setEditOpen(true);
  };
  const openEdit = (d) => {
    let ipId = d.infoproduct_id;
    if (!ipId && d.ipTitle) {
      const found = infoproducts.find((p) => String(p.title).toLowerCase() === String(d.ipTitle).toLowerCase());
      if (found) ipId = found.id;
    }
    setEditing({ ...d, infoproduct_id: ipId || null });
    setEditOpen(true);
  };
  const closeEdit = () => setEditOpen(false);

  const saveEditing = async () => {
    const payload = {
      title: editing.title,
      name: editing.title,
      status: editing.status,
      price_cents: Math.max(0, Math.floor(Number(editing.price_cents || 0))),
      ticket_price_cents: Math.max(0, Math.floor(Number(editing.price_cents || 0))),
      numbers_total: Math.max(1, Math.floor(Number(editing.numbers_total || 100))),
      total_numbers: Math.max(1, Math.floor(Number(editing.numbers_total || 100))),
      max_per_user: Math.max(0, Math.floor(Number(editing.max_per_user || 0))),
      limit_per_user: Math.max(0, Math.floor(Number(editing.max_per_user || 0))),
      infoproduct_id: editing.infoproduct_id || null,
    };

    try {
      if (editing.id) {
        try { await postJSON(`/admin/draws/${editing.id}`, payload, "PUT"); }
        catch { await postJSON(`/draws/${editing.id}`, payload, "PUT"); }
      } else {
        try { await postJSON("/admin/draws", payload, "POST"); }
        catch { await postJSON("/draws", payload, "POST"); }
      }
      closeEdit();
      await loadDraws();
    } catch (e) {
      console.error("[AdminDashboard] save draw failed:", e?.message || e);
      alert("Falha ao salvar o sorteio.");
    }
  };

  const deleteDraw = async (id) => {
    if (!window.confirm("Deseja realmente excluir este sorteio?")) return;
    try {
      try { await postJSON(`/admin/draws/${id}`, null, "DELETE"); }
      catch { await postJSON(`/draws/${id}`, null, "DELETE"); }
      await loadDraws();
    } catch (e) {
      console.error("[AdminDashboard] delete draw failed:", e?.message || e);
      alert("Não foi possível excluir.");
    }
  };

  const toggleStatus = async (d) => {
    const newStatus = d.status === "open" ? "closed" : "open";
    try {
      const body = { status: newStatus };
      try { await postJSON(`/admin/draws/${d.id}`, body, "PATCH"); }
      catch { await postJSON(`/draws/${d.id}`, body, "PATCH"); }
      await loadDraws();
    } catch (e) {
      console.error("[AdminDashboard] toggle status failed:", e?.message || e);
      alert("Não foi possível alterar o status.");
    }
  };

  // menu
  const [menuEl, setMenuEl] = React.useState(null);
  const open = Boolean(menuEl);
  const openMenu = (e) => setMenuEl(e.currentTarget);
  const closeMenu = () => setMenuEl(null);
  const goPainel = () => { closeMenu(); navigate("/admin"); };
  const doLogout = () => { closeMenu(); logout(); navigate("/"); };

  const configPriceCents = Math.max(0, Math.floor(Number(price || 0)));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Toolbar sx={{ position: "relative", minHeight: 64 }}>
          <IconButton edge="start" color="inherit" onClick={() => navigate("/admin")} aria-label="Voltar">
            <ArrowBackIosNewRoundedIcon />
          </IconButton>

          <Box component={RouterLink} to="/admin"
               sx={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
            <Box component="img" src={logoNewStore} alt="NEW STORE" sx={{ height: 40 }} />
          </Box>

          <IconButton color="inherit" sx={{ ml: "auto" }} onClick={openMenu}>
            <AccountCircleRoundedIcon />
          </IconButton>
          <Menu
            anchorEl={menuEl}
            open={open}
            onClose={closeMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={goPainel}>Painel (Admin)</MenuItem>
            <Divider />
            <MenuItem onClick={doLogout}>Sair</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        <Stack spacing={4} alignItems="center">
          <Typography sx={{ fontWeight: 900, textAlign: "center", lineHeight: 1.1, fontSize: { xs: 28, md: 56 } }}>
            Painel de Controle
            <br /> dos Sorteios
          </Typography>

          {/* Painel (resumo + preço e configs) */}
          <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, width: "100%" }}>
            <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap">
              <Stack>
                <Typography sx={{ opacity: 0.7, fontWeight: 700 }}>Nº Sorteio Atual</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  {loading ? "…" : drawId ?? "-"}
                </Typography>
              </Stack>

              <Stack>
                <Typography sx={{ opacity: 0.7, fontWeight: 700 }}>Nºs Vendidos</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  {loading ? "…" : sold}
                </Typography>
              </Stack>

              <Stack>
                <Typography sx={{ opacity: 0.7, fontWeight: 700 }}>Nºs Restantes</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  {loading ? "…" : remaining}
                </Typography>
              </Stack>

              <Box sx={{ flex: 1 }} />

              <Button
                onClick={onNewDraw}
                disabled={creating}
                variant="outlined"
                sx={{ borderRadius: 999, px: 3 }}
              >
                {creating ? "Criando..." : "NOVO SORTEIO"}
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* Valor por Ticket (centavos) */}
            <Typography sx={{ opacity: 0.7, fontWeight: 700, mb: 1 }}>Valor por Ticket</Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <TextField
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="em centavos (ex.: 100 = R$ 1,00)"
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                sx={{ maxWidth: 320 }}
              />
            </Stack>

            {/* Máximo de tickets por seleção */}
            <Typography sx={{ opacity: 0.7, fontWeight: 700, mb: 1 }}>
              Máximo de Tickets permitidos
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <TextField
                type="number"
                value={maxSelect}
                onChange={(e) => setMaxSelect(e.target.value)}
                placeholder="Ex.: 5"
                inputProps={{ min: 1 }}
                sx={{ maxWidth: 320 }}
              />
            </Stack>

            {/* Frase promocional */}
            <Typography sx={{ opacity: 0.7, fontWeight: 700, mb: 1 }}>
              Frase promocional
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <TextField
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                placeholder="Ex.: Sorteio de um Watch Winder…"
                fullWidth
              />
            </Stack>

            <Button
              onClick={onSaveAll}
              disabled={saving}
              variant="contained"
              color="primary"
              sx={{ borderRadius: 999, px: 3 }}
            >
              {saving ? "Salvando..." : "ATUALIZAR"}
            </Button>
          </Paper>

          {/* === CRUD DE SORTEIOS (com Infoproduto) === */}
          <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, width: "100%" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Gerenciar Sorteios
              </Typography>
              <Button
                startIcon={<AddCircleRoundedIcon />}
                variant="contained"
                color="primary"
                onClick={openNew}
                sx={{ borderRadius: 999 }}
              >
                Novo
              </Button>
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Título</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Preço (¢)</TableCell>
                  <TableCell align="right">Qtde números</TableCell>
                  <TableCell align="right">Máx/Usuário</TableCell>
                  <TableCell>Infoproduto</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingDraws ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ opacity: 0.7 }}>
                      Carregando…
                    </TableCell>
                  </TableRow>
                ) : draws.length ? (
                  draws.map((d) => {
                    const ipById = d.infoproduct_id
                      ? infoproducts.find((p) => String(p.id) === String(d.infoproduct_id))
                      : null;

                    const priceFromTitle = (!ipById && d.ipTitle)
                      ? (infoproducts.find((p) => String(p.title).toLowerCase() === String(d.ipTitle).toLowerCase())?.price_cents ?? null)
                      : null;

                    const displayPrice =
                      (d.price_cents && d.price_cents > 0 ? d.price_cents : null) ??
                      (ipById?.price_cents ?? null) ??
                      (priceFromTitle ?? null) ??
                      (d.ipPriceCents ?? null) ??
                      Math.max(0, Math.floor(Number(price || 0)));

                    const displayIpTitle =
                      ipById?.title ??
                      d.ipTitle ??
                      (d.infoproduct_id ? `#${d.infoproduct_id}` : "—");

                    return (
                      <TableRow key={d.id}>
                        <TableCell>{d.id}</TableCell>
                        <TableCell>{d.title}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={d.status}
                            color={d.status === "open" ? "success" : "default"}
                            onClick={() => toggleStatus(d)}
                            sx={{ cursor: "pointer" }}
                          />
                        </TableCell>
                        <TableCell align="right">{displayPrice || 0}</TableCell>
                        <TableCell align="right">{d.numbers_total}</TableCell>
                        <TableCell align="right">{d.max_per_user}</TableCell>
                        <TableCell>{displayIpTitle}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEdit(d)} title="Editar">
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => deleteDraw(d.id)} title="Excluir">
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ opacity: 0.7 }}>
                      Nenhum sorteio cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>

          {/* As 3 listas */}
          <Stack  spacing={3} sx={{ width: "100%" }}>
             <BigCard color="green"  onClick={() => navigate("/admin/AdminClientesUser")}>
              CADASTRO E MANUTENÇÃO
              <br /> CLIENTES
            </BigCard>

            <BigCard color="blue"  onClick={() => navigate("/admin/infoproducts")}>
              CADASTRO INFOPRODUTOS
              <br /> 
            </BigCard>

            <BigCard color="red"  onClick={() => navigate("/admin/AdminClientesUser")}>
              CADASTRO CATEGORIAS
              <br /> 
            </BigCard>

            <br />
            <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.18)", borderBottomWidth: 2 }} />
            <br />
            <BigCard color="info.dark" onClick={() => navigate("/admin/sorteiosAtivos")}>
              SORTEIO ATIVO<br /> COMPRADORES
            </BigCard>
            <br />
            <BigCard outlined onClick={() => navigate("/admin/sorteios")}>
              LISTA DE SORTEIOS
              <br /> REALIZADOS
            </BigCard>

            <BigCard color="primary.main" onClick={() => navigate("/admin/clientes")}>
              LISTA DE CLIENTES
              <br /> COM SALDO ATIVO
            </BigCard>

            <BigCard color="warning.main" onClick={() => navigate("/admin/vencedores")}>
              LISTA DE VENCEDORES
              <br /> DOS SORTEIOS
            </BigCard>
          </Stack>
        </Stack>
      </Container>

      {/* Modal de edição/criação */}
      <Dialog open={creating || editOpen} onClose={() => { setCreating(false); setEditOpen(false); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>
          {editing?.id ? "Editar sorteio" : "Novo sorteio"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Título"
              value={editing.title}
              onChange={(e) => setEditing((s) => ({ ...s, title: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={editing.status}
                onChange={(e) => setEditing((s) => ({ ...s, status: e.target.value }))}
              >
                <MenuItem value="open">open</MenuItem>
                <MenuItem value="closed">closed</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Preço (centavos)"
              value={editing.price_cents}
              onChange={(e) => setEditing((s) => ({ ...s, price_cents: e.target.value }))}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              helperText="Se selecionar um infoproduto, o preço virá dele."
            />
            <TextField
              label="Quantidade de números"
              value={editing.numbers_total}
              onChange={(e) => setEditing((s) => ({ ...s, numbers_total: e.target.value }))}
              type="number"
              inputProps={{ min: 1, max: 1000 }}
            />
            <TextField
              label="Limite por usuário"
              value={editing.max_per_user}
              onChange={(e) => setEditing((s) => ({ ...s, max_per_user: e.target.value }))}
              type="number"
              inputProps={{ min: 0 }}
              helperText="0 = sem limite"
            />
            <FormControl fullWidth>
              <InputLabel>Infoproduto (opcional)</InputLabel>
              <Select
                label="Infoproduto (opcional)"
                value={editing.infoproduct_id ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const pick = infoproducts.find((p) => String(p.id) === String(val));
                  setEditing((s) => ({
                    ...s,
                    infoproduct_id: val || null,
                    price_cents: pick?.price_cents ?? s.price_cents,
                  }));
                }}
              >
                <MenuItem value="">—</MenuItem>
                {infoproducts.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.title} (#{p.id}) — {p.price_cents}¢
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setCreating(false); setEditOpen(false); }} variant="outlined">Cancelar</Button>
          <Button onClick={saveEditing} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
