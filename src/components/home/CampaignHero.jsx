import * as React from "react";
import { Box, Button, Paper, Stack, Typography, Skeleton } from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import heroImage from "../../hero_image.png";
import lotomaniaLogo from "../../lotomania-logo.png";
import { campaignColors, neonButtonSx } from "../../theme/campaignTheme";
import { BRL, getTopPrizes } from "../../utils/homeHelpers";
import { trackEvent, AnalyticsEvents } from "../../utils/analytics";

const FALLBACK_PRIZES = [
  { label: "1º Prêmio", amount: 10000 },
  { label: "2º Prêmio", amount: 5000 },
  { label: "3º Prêmio", amount: 2500 },
];

function PrizeCard({ label, amount, loading, highlight }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        flex: 1,
        minWidth: { xs: "100%", sm: 0 },
        textAlign: "center",
        background: highlight
          ? "linear-gradient(145deg, rgba(255,193,7,0.12) 0%, rgba(103,194,58,0.08) 100%)"
          : "linear-gradient(145deg, rgba(20,26,20,0.95) 0%, rgba(15,18,15,0.95) 100%)",
        border: highlight
          ? `1px solid ${campaignColors.borderGold}`
          : `1px solid ${campaignColors.borderNeon}`,
        borderRadius: 2.5,
        boxShadow: highlight ? "0 0 20px rgba(255,193,7,0.12)" : "0 4px 16px rgba(0,0,0,0.3)",
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center" sx={{ mb: 0.5 }}>
        <EmojiEventsRoundedIcon sx={{ fontSize: 18, color: "secondary.main" }} />
        <Typography variant="caption" sx={{ fontWeight: 800, color: "secondary.main", letterSpacing: 0.5 }}>
          {label}
        </Typography>
      </Stack>
      {loading ? (
        <Skeleton variant="text" width="70%" sx={{ mx: "auto", fontSize: "1.75rem" }} />
      ) : (
        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            lineHeight: 1.1,
            fontSize: { xs: "1.35rem", sm: "1.5rem" },
            color: highlight ? "secondary.main" : "primary.main",
          }}
        >
          {BRL.format(amount)}
        </Typography>
      )}
    </Paper>
  );
}

export default function CampaignHero({ loading, cards, onScrollToPlans, onScrollToHowItWorks }) {
  const prizes = loading ? FALLBACK_PRIZES : getTopPrizes(cards, 3);
  const displayPrizes =
    prizes.length >= 3
      ? prizes
      : FALLBACK_PRIZES.map((fb, i) => ({
          label: fb.label,
          amount: prizes[i]?.amount ?? fb.amount,
        }));

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
    <Paper
      elevation={0}
      component="section"
      aria-label="Apresentação do Pixão na Mão"
      sx={{
        p: { xs: 2.5, md: 4 },
        mb: { xs: 3, md: 4 },
        borderRadius: 4,
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${campaignColors.borderGold}`,
        background: `
          radial-gradient(900px 420px at 0% 0%, rgba(103,194,58,0.18), transparent 55%),
          radial-gradient(900px 420px at 100% 100%, rgba(255,193,7,0.12), transparent 55%),
          linear-gradient(180deg, rgba(14,18,14,0.98), rgba(5,8,5,0.98))
        `,
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
          opacity: 0.1,
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 12,
          right: 16,
          width: 48,
          height: 48,
          borderRadius: 2,
          border: `1px dashed ${campaignColors.borderNeon}`,
          opacity: 0.35,
          transform: "rotate(8deg)",
          display: { xs: "none", sm: "block" },
        }}
      />

      <Stack spacing={2.5} sx={{ position: "relative", zIndex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          {lotomaniaLogo ? (
            <Box component="img" src={lotomaniaLogo} alt="Lotomania" sx={{ height: 32, objectFit: "contain" }} />
          ) : null}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.25,
              py: 0.5,
              borderRadius: 99,
              border: `1px solid ${campaignColors.borderNeon}`,
              bgcolor: "rgba(103,194,58,0.12)",
            }}
          >
            <ConfirmationNumberRoundedIcon sx={{ fontSize: 16, color: "primary.main" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
              Sorteios em dinheiro
            </Typography>
          </Box>
        </Stack>

        <Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 900,
              lineHeight: 1.15,
              fontSize: { xs: "1.65rem", sm: "2.1rem", md: "2.5rem" },
              mb: 1,
            }}
          >
            Escolha seu número e participe do{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(90deg, #7CFF4D, #FFD54F)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Pixão na Mão
            </Box>
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 560, lineHeight: 1.55 }}>
            São 3 sorteios em dinheiro. Escolha seu e-book, selecione seus números e acompanhe tudo de forma
            transparente.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          sx={{ width: "100%" }}
        >
          {displayPrizes.map((p, i) => (
            <PrizeCard key={p.label} label={p.label} amount={p.amount} loading={loading} highlight={i === 0} />
          ))}
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 0.5 }}>
          <Button
            size="large"
            color="success"
            variant="contained"
            onClick={handlePrimaryCta}
            sx={{ ...neonButtonSx, width: { xs: "100%", sm: "auto" } }}
          >
            Escolher meus números
          </Button>
          <Button
            size="large"
            variant="outlined"
            onClick={handleSecondaryCta}
            sx={{
              fontWeight: 800,
              borderColor: campaignColors.borderNeon,
              color: "primary.main",
              width: { xs: "100%", sm: "auto" },
              "&:hover": { borderColor: "primary.light", bgcolor: "rgba(103,194,58,0.08)" },
            }}
          >
            Entender como funciona
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
