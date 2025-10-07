// src/Infoprodutos.jsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar, Box, Button, Container, CssBaseline, Grid, IconButton,
  Paper, Stack, ThemeProvider, Toolbar, Typography, createTheme, Skeleton, Divider
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

const API_BASE = (
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE ||
  "https://newstore-backend.onrender.com"
).replace(/\/+$/, "");

const cents = (v) =>
  (Number(v || 0) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function Infoprodutos() {
  const [loading, setLoading] = React.useState(true);
  const [sections, setSections] = React.useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API_BASE}/api/infoproducts/sections?onlyOpen=1`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = r.ok ? await r.json() : [];
        if (alive) setSections(Array.isArray(data) ? data : []);
      } catch {
        if (alive) setSections([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const goBuy = (sku) => navigate(`/comprar/${encodeURIComponent(sku)}`);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>INFOPRODUTOS • SORTEIOS</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit">
            <AccountCircleRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {(loading ? [1,2] : sections).map((sec, sidx) => (
          <Box key={sec?.slug || sidx} sx={{ mb: { xs: 4, md: 6 } }}>
            {/* Cabeçalho da seção (categoria) */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              {loading ? (
                <>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Skeleton variant="text" width={180} />
                </>
              ) : (
                <>
                  {sec?.logo_url && (
                    <Box component="img" src={sec.logo_url} alt={sec.name}
                      sx={{ width: 48, height: 48, objectFit: "contain" }} />
                  )}
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    {sec?.name || "Categoria"}
                  </Typography>
                </>
              )}
            </Stack>

            <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.12)" }} />

            {/* Grade 1/2/3 */}
            <Grid container spacing={3}>
              {(loading ? Array.from({ length: 3 }) : (sec.items || [])).map((item, i) => {
                const p = item?.product || {};
                const d = item?.draw || {};
                const price = d?.ticket_price_cents ?? p?.price_cents;
                return (
                  <Grid key={p?.sku || i} item xs={12} sm={6} md={4}>
                    <Paper variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                      {/* Capa */}
                      <Box sx={{
                        height: 210,
                        bgcolor: "rgba(255,255,255,0.03)",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        backgroundImage: loading
                          ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)"
                          : (p?.cover_url ? `url(${p.cover_url})` : "none"),
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}>
                        {loading && <Skeleton variant="rectangular" width="100%" height="100%" />}
                        {!loading && !p?.cover_url && (
                          <Typography sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontWeight: 800, opacity: .6 }}>
                            Espaço para a arte do e-book
                          </Typography>
                        )}
                      </Box>

                      {/* Conteúdo */}
                      <Stack spacing={1.1} sx={{ p: 2, flexGrow: 1 }}>
                        {loading ? (
                          <>
                            <Skeleton width="45%" />
                            <Skeleton width="70%" />
                            <Skeleton width="30%" />
                            <Skeleton width="60%" />
                            <Skeleton width="90%" />
                          </>
                        ) : (
                          <>
                            <Typography variant="overline" sx={{ color: "secondary.main", letterSpacing: 1.2, fontWeight: 900 }}>
                              {sec?.name?.toUpperCase() || "CATEGORIA"}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>
                              {p?.title || "E-book"}
                            </Typography>
                            {p?.subtitle && (
                              <Typography sx={{ opacity: .9 }}>{p.subtitle}</Typography>
                            )}

                            <Typography variant="body2" sx={{ opacity: .85 }}>
                              Prêmio: <strong>{cents(d?.prize_cents)}</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: .85 }}>
                              Ticket: <strong>{cents(price)}</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: .85 }}>
                              Cotas: <strong>{d?.total_numbers ?? 100}</strong>
                            </Typography>

                            <Box sx={{ flexGrow: 1 }} />
                            <Button
                              fullWidth
                              variant="contained"
                              color="success"
                              size="large"
                              sx={{ fontWeight: 900 }}
                              onClick={() => goBuy(p?.sku)}
                              disabled={!p?.sku}
                            >
                              COMPRAR E-BOOK
                            </Button>
                          </>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))}
      </Container>
    </ThemeProvider>
  );
}
