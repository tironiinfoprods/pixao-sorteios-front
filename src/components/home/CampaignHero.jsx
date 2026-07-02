import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Link, Stack, Typography, Skeleton } from "@mui/material";
import heroImage from "../../hero_image.png";
import lotomaniaLogo from "../../lotomania-logo.png";
import { campaignColors, goldButtonSx, greenButtonSx } from "../../theme/campaignTheme";
import { BRL, getTopPrizes } from "../../utils/homeHelpers";
import { trackEvent, AnalyticsEvents } from "../../utils/analytics";
import PlanQuickNav from "./PlanQuickNav";

const FALLBACK_PRIZES = [
  { label: "Prêmio principal", amount: 10000, rank: 1 },
  { label: "2º sorteio", amount: 5000, rank: 2 },
  { label: "3º sorteio", amount: 2500, rank: 3 },
];

function formatPrizeHero(amount, large = false) {
  if (amount >= 1000 && amount % 1000 === 0) {
    return `R$ ${Math.round(amount / 1000)} MIL`;
  }
  return BRL.format(amount);
}

function MainPrizeCard({ label, amount, loading }) {
  return (
    <Box
      className="hero-prize-glow"
      sx={{
        position: "relative",
        p: { xs: 2.5, sm: 3, md: 4 },
        borderRadius: { xs: 2, md: 3 },
        textAlign: "center",
        border: `2px solid ${campaignColors.gold}`,
        background: `
          radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,212,59,0.22) 0%, transparent 60%),
          linear-gradient(180deg, rgba(7,16,8,0.95) 0%, rgba(3,7,3,0.98) 100%)
        `,
        boxShadow: "0 0 60px rgba(255,196,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <Box
        sx={{
          display: "inline-block",
          px: 1.5,
          py: 0.35,
          mb: 1.5,
          borderRadius: 99,
          bgcolor: "rgba(255,212,59,0.15)",
          border: `1px solid ${campaignColors.borderGold}`,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 800, color: campaignColors.gold, letterSpacing: 1 }}>
          PRÊMIO PRINCIPAL
        </Typography>
      </Box>

      {loading ? (
        <Skeleton variant="text" sx={{ fontSize: "3.5rem", maxWidth: 280, mx: "auto" }} />
      ) : (
        <Typography
          component="p"
          sx={{
            fontWeight: 900,
            lineHeight: 0.95,
            fontSize: { xs: "2.75rem", sm: "3.5rem", md: "4.25rem" },
            background: `linear-gradient(180deg, #FFF 0%, ${campaignColors.gold} 55%, #E6A800 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 4px 24px rgba(255,196,0,0.35))",
          }}
        >
          {formatPrizeHero(amount, true)}
        </Typography>
      )}
      <Typography variant="body2" sx={{ mt: 1, color: campaignColors.textSecondary, fontWeight: 600 }}>
        em prêmio em dinheiro
      </Typography>
    </Box>
  );
}

function SecondaryPrizeCard({ label, amount, loading }) {
  return (
    <Box
      sx={{
        flex: 1,
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        textAlign: "center",
        border: `1px solid ${campaignColors.borderNeon}`,
        bgcolor: "rgba(7,16,8,0.85)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, color: campaignColors.textSecondary, letterSpacing: 0.5 }}>
        {label.toUpperCase()}
      </Typography>
      {loading ? (
        <Skeleton variant="text" sx={{ fontSize: "1.5rem", mt: 0.5 }} />
      ) : (
        <Typography
          sx={{
            mt: 0.5,
            fontWeight: 900,
            fontSize: { xs: "1.35rem", sm: "1.6rem" },
            color: campaignColors.neonGreenSecondary,
          }}
        >
          {formatPrizeHero(amount)}
        </Typography>
      )}
    </Box>
  );
}

export default function CampaignHero({ loading, cards, isAuthenticated, onScrollToPlans, onScrollToHowItWorks }) {
  const prizes = loading ? FALLBACK_PRIZES : getTopPrizes(cards, 3);
  const main = prizes[0] || FALLBACK_PRIZES[0];
  const secondary = [
    prizes[1] || { label: "2º sorteio", amount: 5000 },
    prizes[2] || { label: "3º sorteio", amount: 2500 },
  ];

  const handlePrimaryCta = () => {
    trackEvent(AnalyticsEvents.HERO_CTA);
    trackEvent(AnalyticsEvents.SCROLL_TO_PLANS);
    onScrollToPlans?.();
  };

  const handleSecondaryCta = () => {
    trackEvent(AnalyticsEvents.HOW_IT_WORKS_CTA);
    onScrollToHowItWorks?.();
  };

  return (
    <Box
      component="section"
      aria-label="Campanha Pixão na Mão"
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        py: { xs: 3, sm: 4, md: 5 },
        px: { xs: 1.25, sm: 2, md: 3 },
        mb: { xs: 2, md: 3 },
        background: `
          radial-gradient(ellipse 100% 80% at 50% -30%, rgba(57,255,20,0.12) 0%, transparent 55%),
          radial-gradient(ellipse 60% 40% at 80% 20%, rgba(255,212,59,0.08) 0%, transparent 50%),
          linear-gradient(180deg, #030703 0%, #050a05 100%)
        `,
        borderBottom: `1px solid ${campaignColors.borderNeon}`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          opacity: 0.06,
        }}
      />

      <Stack spacing={{ xs: 2.5, md: 3.5 }} sx={{ position: "relative", zIndex: 1, maxWidth: 960, mx: "auto" }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" flexWrap="wrap" useFlexGap>
          {lotomaniaLogo ? (
            <Box component="img" src={lotomaniaLogo} alt="Lotomania" sx={{ height: { xs: 22, sm: 26 }, opacity: 0.85 }} />
          ) : null}
          <Typography variant="caption" sx={{ color: campaignColors.neonGreenSecondary, fontWeight: 800, letterSpacing: 2 }}>
            PIXÃO NA MÃO
          </Typography>
        </Stack>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 900,
              lineHeight: 1.08,
              fontSize: { xs: "1.75rem", sm: "2.35rem", md: "2.85rem" },
              color: campaignColors.textPrimary,
              mb: 1.25,
              px: { xs: 0.5, sm: 0 },
            }}
          >
            Escolha seu número e participe dos{" "}
            <Box component="span" sx={{ color: campaignColors.gold }}>
              3 sorteios
            </Box>
          </Typography>
          <Typography
            sx={{
              color: campaignColors.textSecondary,
              maxWidth: 560,
              mx: "auto",
              lineHeight: 1.6,
              fontSize: { xs: "0.9rem", sm: "1.05rem" },
              px: { xs: 0.25, sm: 0 },
            }}
          >
            São prêmios em dinheiro de R$ 10 mil, R$ 5 mil e R$ 2.500. Escolha seu e-book, selecione seus números e
            acompanhe tudo pelo site.
          </Typography>
        </Box>

        <Stack spacing={1.25}>
          <MainPrizeCard label={main.label} amount={main.amount} loading={loading} />
          <Stack direction="row" spacing={1.25}>
            {secondary.map((p) => (
              <SecondaryPrizeCard key={p.label} label={p.label} amount={p.amount} loading={loading} />
            ))}
          </Stack>
        </Stack>

        <PlanQuickNav cards={cards} loading={loading} />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ pt: 0.5 }}>
          <Button
            size="large"
            variant="contained"
            onClick={handlePrimaryCta}
            sx={{
              ...goldButtonSx,
              flex: { sm: 1.2 },
              minHeight: 52,
              fontSize: { xs: "1rem", sm: "1.05rem" },
            }}
          >
            Escolher meus números
          </Button>
          <Button
            size="large"
            variant="outlined"
            onClick={handleSecondaryCta}
            sx={{
              ...greenButtonSx,
              flex: 1,
              minHeight: 52,
            }}
          >
            Como funciona
          </Button>
        </Stack>

        {!isAuthenticated ? (
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ pt: 0.5 }}>
            <Link
              component={RouterLink}
              to="/cadastro"
              underline="hover"
              onClick={() => trackEvent(AnalyticsEvents.CADASTRO_HERO)}
              sx={{ color: campaignColors.gold, fontWeight: 800, fontSize: "0.9rem" }}
            >
              Criar conta grátis
            </Link>
            <Typography sx={{ color: campaignColors.textSecondary }}>·</Typography>
            <Link
              component={RouterLink}
              to="/login"
              underline="hover"
              onClick={() => trackEvent(AnalyticsEvents.LOGIN_HERO)}
              sx={{ color: campaignColors.neonGreenSecondary, fontWeight: 700, fontSize: "0.9rem" }}
            >
              Já tenho conta
            </Link>
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}
