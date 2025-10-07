// src/HomePage.jsx
import * as React from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  CssBaseline,
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
  CardContent,
  CardActions,
  LinearProgress,
} from "@mui/material";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";

import logoNewStore from "./Logo-branca-sem-fundo-768x132.png";
import heroImage from "./hero_image.png";
import lotomaniaLogo from "./lotomania-logo.png";
import { useAuth } from "./authContext";

// modal PIX já existente no projeto
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
  typography: {
    fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial"].join(","),
  },
});

const API_BASE = (
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE ||
  "https://newstore-backend.onrender.com"
).replace(/\/+$/, "");

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

async function fetchJSON(url, opts = {}) {
  const r = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    ...opts,
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/**
 * Carrega infoprodutos de uma categoria e, se houver, o draw aberto vinculado.
 * Prêmio prioriza o do e-book (p.prize_cents) e cai pro do draw se necessário.
 */
function useInfoproductCards(categorySlug = "lotomania") {
  const [loading, setLoading] = React.useState(true);
  const [cards, setCards] = React.useState([]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await fetchJSON(
          `${API_BASE}/api/infoproducts?category=${encodeURIComponent(
            categorySlug
          )}&status=open&limit=12`
        );
        const items = Array.isArray(list?.items) ? list.items : Array.isArray(list) ? list : [];

        const enriched = await Promise.all(
          items.map(async (p) => {
            try {
              const dres = await fetchJSON(
                `${API_BASE}/api/draws?status=open&infoproduct_id=${p.id}`
              );
              const dlist = Array.isArray(dres?.draws) ? dres.draws : Array.isArray(dres) ? dres : [];
              const d = dlist[0] || null;

              const ticketPriceCents =
                (d?.ticket_price_cents_override ?? d?.ticket_price_cents ?? null) ??
                (p?.price_cents ?? 0);

              // prêmio: prioriza o do e-book (modelo novo), senão cai no draw
              const prizeCents =
                (p?.prize_cents ?? p?.default_prize_cents ?? null) != null
                  ? (p.prize_cents ?? p.default_prize_cents)
                  : (d?.prize_cents ?? 0);

              return {
                product: p,
                draw: d
                  ? {
                      id: d.id ?? d.draw_id,
                      prize_cents: prizeCents,
                      total_numbers: d.total_numbers ?? 100,
                      reserved: d.reserved ?? 0,
                      sold: d.sold ?? d.taken ?? 0,
                      ticket_price_cents: ticketPriceCents,
                      status: d.status ?? "open",
                    }
                  : {
                      id: null,
                      prize_cents: prizeCents,
                      total_numbers: p?.default_total_numbers ?? 100,
                      reserved: 0,
                      sold: 0,
                      ticket_price_cents: ticketPriceCents,
                      status: "pending",
                    },
              };
            } catch {
              const prizeCents = p?.prize_cents ?? p?.default_prize_cents ?? 0;
              return {
                product: p,
                draw: {
                  id: null,
                  prize_cents: prizeCents,
                  total_numbers: p?.default_total_numbers ?? 100,
                  reserved: 0,
                  sold: 0,
                  ticket_price_cents: p?.price_cents ?? 0,
                  status: "pending",
                },
              };
            }
          })
        );

        if (alive) setCards(enriched);
      } catch (e) {
        console.warn("[home] infoproducts fail:", e);
        if (alive) setCards([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [categorySlug]);

  return { loading, cards };
}

function ProgressNumbers({ total = 100, reserved = 0, sold = 0 }) {
  const used = (reserved || 0) + (sold || 0);
  const left = Math.max(0, total - used);
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <Stack spacing={0.5}>
      <LinearProgress variant="determinate" value={pct} />
      <Typography variant="caption" sx={{ opacity: 0.85 }}>
        {left} de {total} números disponíveis
      </Typography>
    </Stack>
  );
}

export default function HomePage({
  groupUrl = "https://chat.whatsapp.com/Byb4qBRseWwC5IVyV8enRC",
}) {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const isAuthenticated = !!(user?.email || user?.id || token);
  const logoTo = isAuthenticated ? "/conta" : "/";

  const [menuEl, setMenuEl] = React.useState(null);
  const menuOpen = Boolean(menuEl);
  const handleOpenMenu = (e) => setMenuEl(e.currentTarget);
  const handleCloseMenu = () => setMenuEl(null);
  const goConta = () => { handleCloseMenu(); navigate("/conta"); };
  const goLogin = () => { handleCloseMenu(); navigate("/login"); };
  const doLogout = () => { handleCloseMenu(); logout(); navigate("/"); };

  const { loading, cards } = useInfoproductCards("lotomania");

  // ===== PIX modal state (paga primeiro) =====
  const [pixOpen, setPixOpen] = React.useState(false);
  const [pixLoading, setPixLoading] = React.useState(false);
  const [pixData, setPixData] = React.useState(null);
  const [pixAmount, setPixAmount] = React.useState(0);
  const [pendingProduct, setPendingProduct] = React.useState(null);

  // Polling do status do PIX
  React.useEffect(() => {
    if (!pixOpen || !pixData?.paymentId) return;
    const id = setInterval(async () => {
      try {
        const st = await checkPixStatus(pixData.paymentId);
        if (String(st?.status).toLowerCase() === "approved") {
          clearInterval(id);
          setPixOpen(false);
          setPixLoading(false);

          // garante/abre um draw para este e-book e vai para a tela de números
          if (pendingProduct) {
            fetchJSON(
              `${API_BASE}/api/infoproducts/${encodeURIComponent(
                pendingProduct.sku || pendingProduct.id
              )}/ensure-open-draw`,
              { method: "POST" }
            )
              .then((ens) => {
                const drawId = ens?.draw_id || ens?.id;
                navigate("/numeros", {
                  state: {
                    drawId,
                    paymentId: pixData.paymentId,
                    product: pendingProduct,
                  },
                });
              })
              .catch(() => {
                // fallback: mesmo sem ensure, deixa o usuário ir escolher
                navigate("/numeros", {
                  state: {
                    drawId: null,
                    paymentId: pixData.paymentId,
                    product: pendingProduct,
                  },
                });
              })
              .finally(() => setPendingProduct(null));
          }
        }
      } catch {
        // silencioso
      }
    }, 3000);
    return () => clearInterval(id);
  }, [pixOpen, pixData, pendingProduct, navigate]);

  // === Guard de compra — exige login antes de gerar PIX
  function onBuyClick(product, priceCents) {
    if (!isAuthenticated) {
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
    handleBuy(product, priceCents);
  }

  async function handleBuy(product, priceCents) {
    try {
      setPendingProduct(product);
      setPixOpen(true);
      setPixLoading(true);
      setPixAmount((priceCents ?? product.price_cents ?? 0) / 100);

      const pix = await fetchJSON(`${API_BASE}/api/payments/infoproduct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ infoproduct_id: product.id }),
      });

      setPixData(pix);
      setPixLoading(false);
    } catch (e) {
      setPixLoading(false);
      setPixOpen(false);
      alert("Não foi possível iniciar o pagamento agora.");
    }
  }

  const CAT = {
    id: "lotomania",
    title: "Lotomania",
    subtitle: "Sorteios realizados com base nos resultados oficiais da Lotomania.",
    logo: lotomaniaLogo,
  };

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
            to={logoTo}
            onClick={(e) => { e.preventDefault(); navigate(logoTo); }}
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

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* HERO */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 3,
            position: "relative",
            overflow: "hidden",
            background:
              "radial-gradient(1000px 500px at -10% -10%, rgba(255,193,7,0.12), transparent 60%), radial-gradient(1000px 500px at 110% 110%, rgba(103,194,58,0.12), transparent 60%), linear-gradient(180deg, rgba(18,18,18,0.85), rgba(18,18,18,0.85))",
            border: "1px solid rgba(255,255,255,0.06)",
            mb: 4,
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
              opacity: 0.2,
              mixBlendMode: "screen",
            }}
          />
          <Stack spacing={2} sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <Typography variant="overline" sx={{ letterSpacing: 2, color: "secondary.main", fontWeight: 900 }}>
              INFOPRODUTOS • PIXÃO NA MÃO
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                lineHeight: 1.1,
                background: "linear-gradient(90deg,#FFD54F,#FFF176,#67C23A)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 24px rgba(255,213,79,0.25)",
              }}
            >
              Escolha o e-book do seu nível e participe
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 860, mx: "auto" }}>
              Exibindo a categoria <strong>Lotomania</strong>. Cada e-book dá direito a escolher 1 número.
            </Typography>
          </Stack>
        </Paper>

        {/* Cabeçalho da categoria */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          {CAT.logo
            ? <Box component="img" src={CAT.logo} alt={`${CAT.title} logo`} sx={{ height: 42, objectFit: "contain" }} />
            : <Chip label={CAT.title} color="warning" />}
          <Typography variant="h5" fontWeight={900}>{CAT.title}</Typography>
        </Stack>
        {!!CAT.subtitle && (
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>{CAT.subtitle}</Typography>
        )}

        {/* GRID responsivo: 3 / 2 / 1 colunas */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: 2.5,
          }}
        >
          {(loading ? Array.from({ length: 3 }) : cards).map((row, idx) => {
            const p = row?.product || {};
            const d = row?.draw || {};
            const prize = ((p.prize_cents ?? p.default_prize_cents ?? d?.prize_cents ?? 0) / 100);
            const price = ((d?.ticket_price_cents ?? p.price_cents ?? 0) / 100);

            return (
              <Card key={p.id || idx} variant="outlined" sx={{ display: "flex", flexDirection: "column" }}>
                <Box
                  sx={{
                    position: "relative",
                    aspectRatio: "16 / 9",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: p.cover_url
                      ? `url(${p.cover_url}) center/cover no-repeat`
                      : "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 8px, rgba(255,255,255,0.03) 8px 16px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!p.cover_url && (
                    <Typography sx={{ opacity: 0.65, fontWeight: 700 }}>
                      Espaço para a <strong>arte do e-book</strong>
                    </Typography>
                  )}
                </Box>

                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="overline" sx={{ opacity: 0.8 }}>
                    {p.subtitle || "Infoproduto"}
                  </Typography>
                  <Typography variant="h6" fontWeight={900}>
                    {p.title || "E-book"}
                  </Typography>

                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 900 }}>
                    {BRL.format(prize)}{" "}
                    <Typography component="span" variant="body1" sx={{ opacity: 0.8 }}>
                      de prêmio
                    </Typography>
                  </Typography>

                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    {BRL.format(price)}{" "}
                    <Typography component="span" variant="body2" sx={{ opacity: 0.8 }}>
                      / 1 número
                    </Typography>
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 1.5, opacity: 0.9 }}>
                    {p.description || "Compre o e-book e escolha 1 número entre os 100 disponíveis."}
                  </Typography>

                  {/* progresso apenas se já existir draw aberto */}
                  {d?.total_numbers ? (
                    <Box sx={{ mt: 2 }}>
                      <ProgressNumbers
                        total={d.total_numbers ?? 100}
                        reserved={d.reserved ?? 0}
                        sold={d.sold ?? 0}
                      />
                    </Box>
                  ) : null}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    size="large"
                    color="success"
                    variant="contained"
                    disabled={loading}
                    onClick={() => onBuyClick(p, d?.ticket_price_cents ?? p.price_cents)}
                    sx={{ fontWeight: 900 }}
                  >
                    {isAuthenticated ? "Comprar e-book" : "Entrar para comprar"}
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </Box>

        {/* CTA WhatsApp */}
        <Paper
          variant="outlined"
          sx={{
            mt: 6,
            p: { xs: 3, md: 4 },
            textAlign: "center",
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
            component="a"
            href={groupUrl}
            target="_blank"
            rel="noopener"
            size="large"
            variant="contained"
            color="success"
            sx={{ px: 4, py: 1.5, fontWeight: 800, letterSpacing: 0.5 }}
          >
            ENTRAR NO WHATS 💬
          </Button>
        </Paper>
      </Container>

      {/* Modal PIX (paga primeiro) */}
      <PixModal
        open={pixOpen}
        onClose={() => {
          setPixOpen(false);
          setPixLoading(false);
          setPendingProduct(null);
          setPixData(null);
        }}
        loading={pixLoading}
        data={pixData}
        amount={pixAmount}
        onCopy={() => {
          if (pixData) {
            navigator.clipboard.writeText(
              pixData.copy_paste_code || pixData.qr_code || ""
            );
          }
        }}
        onRefresh={async () => {
          if (!pixData?.paymentId) return;
          try {
            const st = await checkPixStatus(pixData.paymentId);
            alert(`Status: ${st?.status || "pendente"}`);
          } catch {
            alert("Não foi possível consultar o status agora.");
          }
        }}
      />
    </ThemeProvider>
  );
}
