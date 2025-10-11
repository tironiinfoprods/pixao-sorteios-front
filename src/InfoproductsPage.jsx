// src/admin/InfoproductsPage.jsx
import * as React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Paper,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Box,
  Divider,
  LinearProgress,
  Alert,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Global } from "@emotion/react";
import { useNavigate } from "react-router-dom";

// LOGO (mantenha como você já estava usando)
import logoNewStore from "./Logo-branca-sem-fundo-768x132.png";

/* =========================
   MESMA JUNÇÃO DE BASE DA API DO AdminClientes.jsx
   ========================= */
const RAW_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE ||
  "";
const API_BASE = String(RAW_BASE).replace(/\/+$/, "");
const apiJoin = (path) => {
  let p = path.startsWith("/") ? path : `/${path}`;
  const baseEndsApi = API_BASE.endsWith("/api");
  const pathStartsApi = p.startsWith("/api/");
  if (!API_BASE) return pathStartsApi ? p : `/api${p}`;
  if (baseEndsApi && pathStartsApi) p = p.slice(4);      // evita .../api/api/...
  if (!baseEndsApi && !pathStartsApi) p = `/api${p}`;    // garante /api quando base não tem
  return `${API_BASE}${p}`;
};

/* ======= Auth headers igual ao AdminClientes.jsx ======= */
const authHeaders = () => {
  const tk =
    localStorage.getItem("ns_auth_token") ||
    sessionStorage.getItem("ns_auth_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token");
  return tk
    ? {
        Authorization: `Bearer ${String(tk)
          .replace(/^Bearer\s+/i, "")
          .replace(/^["']|["']$/g, "")}`,
      }
    : {};
};

function cents(n) {
  if (n == null) return "";
  return (Number(n) / 100).toFixed(2);
}

export default function InfoproductsPage() {
  const navigate = useNavigate();

  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [err, setErr] = React.useState("");

  const empty = {
    sku: "",
    title: "",
    subtitle: "",
    description: "",
    cover_url: "",
    file_url: "",
    file_sha256: "",
    price: "",
    prize: "",
    total_numbers: 100,
    active: true,
    category_id: "",
    category_slug: "",
  };
  const [form, setForm] = React.useState(empty);

  /* ======= Helpers de fetch (com Authorization + cookies) ======= */
  async function apiGet(path) {
    const url = apiJoin(path);
    const r = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...authHeaders() },
    });
    const ct = r.headers.get("content-type") || "";
    if (r.status === 401) throw new Error("401: Sessão expirada ou sem permissão.");
    if (!r.ok) {
      const body = ct.includes("application/json") ? await r.json() : await r.text();
      throw new Error(typeof body === "string" ? body : body?.error || `HTTP ${r.status}`);
    }
    return ct.includes("application/json") ? r.json() : {};
  }

  async function apiSend(path, method, payload) {
    const url = apiJoin(path);
    const r = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const ct = r.headers.get("content-type") || "";
    if (r.status === 401) throw new Error("401: Sessão expirada ou sem permissão.");
    if (!r.ok) {
      const body = ct.includes("application/json") ? await r.json() : await r.text();
      throw new Error(typeof body === "string" ? body : body?.error || `HTTP ${r.status}`);
    }
    return ct.includes("application/json") ? r.json() : {};
  }

  async function fetchList() {
    setErr("");
    setLoading(true);
    try {
      const data = await apiGet(`/admin/infoproducts?search=${encodeURIComponent(search)}`);
      setItems(data.items || []);
    } catch (e) {
      setItems([]);
      const msg = String(e?.message || "");
      setErr(
        msg.startsWith("<")
          ? "Falha ao carregar (resposta HTML do servidor). Verifique a URL base."
          : msg || "Não foi possível carregar os infoprodutos."
      );
    } finally {
      setLoading(false);
    }
  }
  React.useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(row) {
    setEditing(row.id);
    setForm({
      sku: row.sku || "",
      title: row.title || "",
      subtitle: row.subtitle || "",
      description: row.description || "",
      cover_url: row.cover_url || "",
      file_url: row.file_url || "",
      file_sha256: row.file_sha256 || "",
      price: cents(row.price_cents),
      prize: cents(row.default_prize_cents),
      total_numbers: row.default_total_numbers || 100,
      active: !!row.active,
      category_id: row.category_id || "",
      category_slug: row.category_slug || "",
    });
    setOpen(true);
  }

  async function save() {
    setErr("");
    const payload = {
      sku: form.sku,
      title: form.title,
      subtitle: form.subtitle,
      description: form.description,
      cover_url: form.cover_url || null,
      file_url: form.file_url || null,
      file_sha256: form.file_sha256 || null,
      price: form.price, // backend converte para *_cents
      prize: form.prize,
      total_numbers: Number(form.total_numbers || 100),
      active: !!form.active,
      category_id: form.category_id ? Number(form.category_id) : null,
      category_slug: form.category_slug || null,
    };
    const method = editing ? "PUT" : "POST";
    const path = editing ? `/admin/infoproducts/${editing}` : `/admin/infoproducts`;
    try {
      await apiSend(path, method, payload);
      setOpen(false);
      fetchList();
    } catch (e) {
      setErr(`Erro ao salvar: ${String(e?.message || "").replace(/^Error:\s*/i, "")}`);
    }
  }

  async function remove(row) {
    if (!window.confirm(`Arquivar "${row.title}"?`)) return;
    setErr("");
    try {
      await apiSend(`/admin/infoproducts/${row.id}`, "DELETE", null);
      fetchList();
    } catch (e) {
      setErr(`Erro ao excluir: ${String(e?.message || "").replace(/^Error:\s*/i, "")}`);
    }
  }

  return (
    <Box sx={{ bgcolor: "#0E0E0E", minHeight: "100vh" }}>
      {/* seleção branca para legibilidade */}
      <Global
        styles={{
          "::selection": { background: "#fff", color: "#000" },
          "input::selection": { background: "#fff", color: "#000" },
          "textarea::selection": { background: "#fff", color: "#000" },
        }}
      />

      {/* TOPBAR (não alterado) */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: "#0E0E0E", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Toolbar sx={{ position: "relative", minHeight: 64 }}>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} aria-label="Voltar">
            <ArrowBackIosNewRoundedIcon />
          </IconButton>

          <Box
            onClick={() => navigate("/admin")}
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box component="img" src={logoNewStore} alt="NEW STORE" sx={{ height: 80, opacity: 0.95 }} />
          </Box>

          <IconButton color="inherit" sx={{ ml: "auto" }} aria-label="Perfil">
            <AccountCircleRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.12)",
            backgroundColor: "#000000ff",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#EDEDED" }}>
                Cadastro de Infoprodutos
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, color: "#EDEDED" }}>
                Liste e gerencie os e-books da plataforma.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: "100%", md: "auto", color: "#EDEDED" } }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Buscar por SKU, título, categoria…"
                sx={{ bgcolor: "#EDEDED", borderRadius: 1, color: "#EDEDED" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchList()}
                InputProps={{
                  sx: { color: "#0E0E0E" },
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Tooltip title="Atualizar">
                <span>
                  <IconButton onClick={fetchList} color="inherit">
                    <RefreshRoundedIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Button
                onClick={openCreate}
                variant="contained"
                color="success"
                startIcon={<AddRoundedIcon />}
                sx={{ fontWeight: 900 }}
              >
                Novo e-book
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {err && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {err}
          </Alert>
        )}

        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "rgba(255, 255, 255, 1)",
            overflow: "hidden",
            backgroundColor: "#121212",
          }}
        >
          {loading && <LinearProgress />}
          <Table size="small" stickyHeader
          sx={{
    // corpo da tabela (linhas)
    "& td": { color: "#EDEDED" },
    // cabeçalho (já está claro, mas deixo garantido)
    "& th": { color: "#EDEDED" },
  }}>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    fontWeight: 800,
                    backgroundColor: "#151515",
                    color: "#EDEDED",
                    borderBottomColor: "rgba(255, 255, 255, 1)",
                  },
                }}
              >
                <TableCell>SKU</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell>Prêmio</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell align="center">Ativo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(items || []).map((row) => (
                <TableRow
                  key={row.id}
                  hover
                 sx={{
    "&:hover": { backgroundColor: "rgba(253, 246, 246, 1)" },
    // quando passar o mouse, escurece o texto para contrastar com o fundo claro
    "&:hover td": { color: "#111" },
    // cor padrão das células (sem hover)
    "& td": { color: "#EDEDED" },
    borderBottom: "1px solid rgba(255, 255, 255, 1)",
  }}
                >
                  <TableCell sx={{ fontWeight: 700 }}>{row.sku}</TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>R$ {cents(row.price_cents)}</TableCell>
                  <TableCell>R$ {cents(row.default_prize_cents)}</TableCell>
                  <TableCell>{row.category_slug || row.category_slug_resolved || "-"}</TableCell>
                  <TableCell align="center">
                    {row.active ? (
                      <Chip label="Ativo" size="small" color="success" variant="outlined" />
                    ) : (
                      <Chip label="Inativo" size="small" color="error" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton onClick={() => openEdit(row)} color="inherit">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Arquivar">
                      <IconButton onClick={() => remove(row)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!items?.length && !loading && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 5, textAlign: "center", opacity: 0.8, color: "#EDEDED" }}>
                    Nenhum item encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* Modal (layout mantido) */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.12)",
              backgroundColor: "#ffffffff",
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 900, color: "#EDEDED" }}>
            {editing ? "Editar e-book" : "Novo e-book"}
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="SKU"
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  required
                  fullWidth
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.active}
                      onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                    />
                  }
                  label="Ativo"
                />
              </Stack>

              <TextField
                label="Título"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Subtítulo"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Descrição"
                multiline
                minRows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                fullWidth
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Preço (R$)"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                  fullWidth
                />
                <TextField
                  label="Prêmio (R$)"
                  value={form.prize}
                  onChange={(e) => setForm((f) => ({ ...f, prize: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                  fullWidth
                />
                <TextField
                  label="Qtde. números"
                  type="number"
                  value={form.total_numbers}
                  onChange={(e) => setForm((f) => ({ ...f, total_numbers: e.target.value }))}
                  fullWidth
                />
              </Stack>

              <TextField
                label="Cover URL"
                value={form.cover_url}
                onChange={(e) => setForm((f) => ({ ...f, cover_url: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Arquivo (URL)"
                value={form.file_url}
                onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))}
                fullWidth
              />
              <TextField
                label="SHA256 do arquivo"
                value={form.file_sha256}
                onChange={(e) => setForm((f) => ({ ...f, file_sha256: e.target.value }))}
                fullWidth
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="category_id"
                  type="number"
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="category_slug"
                  value={form.category_slug}
                  onChange={(e) => setForm((f) => ({ ...f, category_slug: e.target.value }))}
                  fullWidth
                />
              </Stack>
            </Stack>
          </DialogContent>

          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700 }}>
              Cancelar
            </Button>
            <Button variant="contained" color="success" onClick={save} sx={{ fontWeight: 900, px: 3 }}>
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
