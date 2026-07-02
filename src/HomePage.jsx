// src/HomePage.jsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  ThemeProvider,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";

import { useAuth } from "./authContext";
import PixModal from "./PixModal";
import { checkPixStatus } from "./services/pix";

import { campaignTheme } from "./theme/campaignTheme";
import {
  API_BASE,
  buildAuthHeaders,
  confirmPurchaseAndGrantVoucher,
  fetchJSON,
  useInfoproductCards,
} from "./utils/homeApi";
import { BRL, pickFeaturedCard, scrollToId } from "./utils/homeHelpers";
import { trackEvent, AnalyticsEvents } from "./utils/analytics";

import CampaignHero from "./components/home/CampaignHero";
import HowItWorksSection from "./components/home/HowItWorksSection";
import PlansSection from "./components/home/PlansSection";
import WinnerRulesBlock from "./components/home/WinnerRulesBlock";
import TrustSection from "./components/home/TrustSection";
import WhatsAppSection from "./components/home/WhatsAppSection";
import StickyMobileCta from "./components/home/StickyMobileCta";
import HomeFooter from "./components/home/HomeFooter";
import HomeHeader from "./components/home/HomeHeader";

function PurchaseQtyDialog({ open, onClose, onConfirm, unitPriceCents = 0 }) {
  const [qty, setQty] = React.useState(1);
  React.useEffect(() => {
    if (open) setQty(1);
  }, [open]);

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
          <Button onClick={dec} variant="outlined" size="large" sx={{ minWidth: 56 }}>
            <RemoveRoundedIcon />
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 900, minWidth: 64, textAlign: "center" }}>
            {qty}
          </Typography>
          <Button onClick={inc} variant="outlined" size="large" sx={{ minWidth: 56 }}>
            <AddRoundedIcon />
          </Button>
        </Stack>
        <Typography sx={{ mt: 2, fontWeight: 800 }}>
          {qty} × {BRL.format(unitPriceCents / 100)} ={" "}
          <span style={{ color: "#67C23A" }}>{BRL.format(total)}</span>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button fullWidth variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
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
  const goConta = () => {
    handleCloseMenu();
    navigate("/conta");
  };
  const goLogin = () => {
    handleCloseMenu();
    navigate("/login");
  };
  const doLogout = () => {
    handleCloseMenu();
    logout();
    navigate("/");
  };

  const { loading, cards } = useInfoproductCards("lotomania");
  const featured = React.useMemo(() => pickFeaturedCard(cards), [cards]);
  const featuredId = featured?.product?.id;

  const [showStickyCta, setShowStickyCta] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setShowStickyCta(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToPlans = React.useCallback(() => scrollToId("planos"), []);
  const scrollToHowItWorks = React.useCallback(() => scrollToId("como-funciona"), []);

  const [pixOpen, setPixOpen] = React.useState(false);
  const [pixLoading, setPixLoading] = React.useState(false);
  const [pixData, setPixData] = React.useState(null);
  const [pixAmount, setPixAmount] = React.useState(0);
  const [pendingProduct, setPendingProduct] = React.useState(null);

  const [qtyOpen, setQtyOpen] = React.useState(false);
  const [unitPriceCents, setUnitPriceCents] = React.useState(0);

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
          } catch {
            /* ignore */
          }

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
      } catch {
        /* ignore */
      }
    }, 3000);
    return () => clearInterval(id);
  }, [pixOpen, pixData, pendingProduct, navigate, token]);

  function onBuyClick(product, priceCents) {
    if (!isAuthenticated) {
      trackEvent(AnalyticsEvents.SELECTION_ERROR, { reason: "not_authenticated" });
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
      trackEvent(AnalyticsEvents.CHECKOUT_START, {
        productId: product.id,
        quantity,
        amount: ((priceCents ?? product.price_cents ?? 0) * quantity) / 100,
      });
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
    } catch {
      trackEvent(AnalyticsEvents.SELECTION_ERROR, { reason: "checkout_failed" });
      setPixLoading(false);
      setPixOpen(false);
      alert("Não foi possível iniciar o pagamento agora.");
    }
  }

  return (
    <ThemeProvider theme={campaignTheme}>
      <CssBaseline />

      <HomeHeader
        isAuthenticated={isAuthenticated}
        menuEl={menuEl}
        menuOpen={menuOpen}
        onOpenMenu={handleOpenMenu}
        onCloseMenu={handleCloseMenu}
        onGoConta={goConta}
        onGoLogin={goLogin}
        onLogout={doLogout}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 }, pb: { xs: 14, md: 5 } }}>
        <CampaignHero
          loading={loading}
          cards={cards}
          onScrollToPlans={scrollToPlans}
          onScrollToHowItWorks={scrollToHowItWorks}
        />

        <HowItWorksSection />

        <PlansSection
          cards={cards}
          loading={loading}
          featuredId={featuredId}
          onBuy={onBuyClick}
          isAuthenticated={isAuthenticated}
        />

        <WinnerRulesBlock />

        <TrustSection />

        <WhatsAppSection groupUrl={groupUrl} />
      </Container>

      <StickyMobileCta visible={showStickyCta && !loading} onClick={scrollToPlans} />

      <HomeFooter />

      <PurchaseQtyDialog
        open={qtyOpen}
        unitPriceCents={unitPriceCents}
        onClose={() => setQtyOpen(false)}
        onConfirm={(qty) => {
          setQtyOpen(false);
          if (pendingProduct) handleBuy(pendingProduct, unitPriceCents, qty);
        }}
      />

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
          if (pixData) navigator.clipboard.writeText(pixData.copy_paste_code || pixData.qr_code || "");
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

      <Dialog
        open={handoverOpen}
        onClose={() => {}}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
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
          <Button fullWidth disabled variant="outlined">
            Aguarde…
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
