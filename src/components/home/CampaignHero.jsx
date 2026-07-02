import * as React from "react";
import { Box, Button, Paper, Stack, Typography, Skeleton } from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import heroImage from "../../hero_image.png";
import lotomaniaLogo from "../../lotomania-logo.png";
import { campaignColors, goldButtonSx } from "../../theme/campaignTheme";
import { BRL, getTopPrizes } from "../../utils/homeHelpers";
import { trackEvent, AnalyticsEvents } from "../../utils/analytics";

const FALLBACK_PRIZES = [
  { label: "1º Prêmio", amount: 10000, rank: 1 },
  { label: "2º Prêmio", amount: 5000, rank: 2 },
  { label: "3º Prêmio", amount: 2500, rank: 3 },
];

function formatPrizeHero(amount) {
  if (amount >= 1000 && amount % 1000 === 0) {
    return `R$ ${Math.round(amount / 1000)} MIL`;
  }
  return BRL.format(amount);
}

function HeroDecorations() {
  const dots = [
    { top: "8%", left: "4%", size: 6, color: "#7CFF4D", delay: "0s" },
    { top: "18%", right: "6%", size: 8, color: "#FFD54F", delay: "0.5s" },
    { top: "55%", left: "2%", size: 5, color: "#FFD54F", delay: "1s" },
    { top: "70%", right: "4%", size: 7, color: "#7CFF4D", delay: "1.5s" },
    { top: "35%", left: "48%", size: 4, color: "#fff", delay: "0.8s" },
  ];
  return (
    <>
      {dots.map((d, i) => (
        <Box
          key={i}
          aria-hidden
          className="hero-sparkle"
          sx={{
            position: "absolute",
            top: d.top,
            left: d.left,
            right: d.right,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            bgcolor: d.color,
            boxShadow: `0 0 ${d.size * 2}px ${d.color}`,
            animationDelay: d.delay,
          }}
        />
      ))}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: -20,
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: 120,
          background: "radial-gradient(ellipse, rgba(103,194,58,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

function PrizeTower({ label, amount, loading, rank }) {
  const isFirst = rank === 1;
  return (
    <Paper
      elevation={0}
      className={isFirst ? "hero-prize-glow" : undefined}
      sx={{
        flex: 1,
        minWidth: { xs: "100%", sm: 0 },
        p: { xs: 2, sm: 2.5 },
        textAlign: "center",
        position: "relative",
        borderRadius: 3,
        border: isFirst ? "2px solid #FFD54F" : "2px solid #7CFF4D",
        background: isFirst
          ? "linear-gradient(180deg, rgba(255,213,79,0.18) 0%, rgba(20,26,20,0.95) 40%, rgba(5,8,5,0.98) 100%)"
          : "linear-gradient(180deg, rgba(103,194,58,0.14) 0%, rgba(15,18,15,0.95) 50%, rgba(5,8,5,0.98) 100%)",
        boxShadow: isFirst
          ? "0 0 40px rgba(255,193,7,0.25), inset 0 1px 0 rgba(255,255,255,0.1)"
          : "0 0 24px rgba(103,194,58,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
        transform: isFirst ? { md: "scale(1.05)" } : "none",
        zIndex: isFirst ? 2 : 1,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -1,
          left: "50%",
          transform: "translateX(-50%)",
          px: 1.5,
          py: 0.25,
          borderRadius: "0 0 8px 8px",
          bgcolor: isFirst ? "#FFD54F" : "#7CFF4D",
          color: "#050805",
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 1, fontSize: "0.65rem" }}>
          {label.toUpperCase()}
        </Typography>
      </Box>

      <Box sx={{ pt: 2, pb: 1 }}>
        <PaidRoundedIcon
          sx={{
            fontSize: { xs: 36, sm: 44 },
            color: isFirst ? "#FFD54F" : "#7CFF4D",
            filter: isFirst ? "drop-shadow(0 0 8px rgba(255,213,79,0.8))" : "drop-shadow(0 0 6px rgba(124,255,77,0.6))",
            mb: 1,
          }}
        />
        {loading ? (
          <Skeleton variant="text" width="80%" sx={{ mx: "auto", fontSize: "2.5rem" }} />
        ) : (
          <Typography
            component="p"
            sx={{
              fontWeight: 900,
              lineHeight: 1,
              fontSize: { xs: "2rem", sm: "2.35rem", md: isFirst ? "2.75rem" : "2.1rem" },
              background: isFirst
                ? "linear-gradient(180deg, #FFF176 0%, #FFD54F 40%, #FF8F00 100%)"
                : "linear-gradient(180deg, #B9FF6A 0%, #7CFF4D 50%, #59b15f 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: isFirst ? "0 2px 20px rgba(255,193,7,0.4)" : "none",
              filter: isFirst ? "drop-shadow(0 0 12px rgba(255,213,79,0.35))" : "drop-shadow(0 0 8px rgba(124,255,77,0.3))",
            }}
          >
            {formatPrizeHero(amount)}
          </Typography>
        )}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.75,
            fontWeight: 800,
            color: "text.secondary",
            letterSpacing: 0.5,
          }}
        >
          em dinheiro
        </Typography>
      </Box>
    </Paper>
  );
}

export default function CampaignHero({ loading, cards, onScrollToPlans, onScrollToHowItWorks }) {
  const prizes = loading ? FALLBACK_PRIZES : getTopPrizes(cards, 3);
  const displayPrizes =
    prizes.length >= 3
      ? prizes.map((p, i) => ({ ...p, rank: i + 1 }))
      : FALLBACK_PRIZES.map((fb, i) => ({
          label: fb.label,
          amount: prizes[i]?.amount ?? fb.amount,
          rank: i + 1,
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
        border: "2px solid rgba(124,255,77,0.5)",
        boxShadow: "0 0 60px rgba(103,194,58,0.12), inset 0 0 80px rgba(103,194,58,0.04)",
        background: `
          radial-gradient(ellipse 120% 80% at 50% -20%, rgba(103,194,58,0.35) 0%, transparent 55%),
          radial-gradient(ellipse 80% 50% at 100% 50%, rgba(255,193,7,0.08) 0%, transparent 50%),
          radial-gradient(ellipse 80% 50% at 0% 80%, rgba(103,194,58,0.12) 0%, transparent 50%),
          linear-gradient(180deg, #0a120a 0%, #050805 100%)
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
          backgroundPosition: "center top",
          opacity: 0.08,
          mixBlendMode: "luminosity",
        }}
      />
      <HeroDecorations />

      <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" flexWrap="wrap" useFlexGap>
          {lotomaniaLogo ? (
            <Box component="img" src={lotomaniaLogo} alt="Lotomania" sx={{ height: 28, objectFit: "contain", opacity: 0.9 }} />
          ) : null}
          <Box
            sx={{
              px: 2,
              py: 0.6,
              borderRadius: 99,
              bgcolor: "#FFD54F",
              color: "#050805",
              boxShadow: "0 0 20px rgba(255,213,79,0.5)",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 1.5, fontSize: "0.7rem" }}>
              PRÊMIO EM DINHEIRO
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            component="p"
            variant="overline"
            sx={{
              color: "#7CFF4D",
              fontWeight: 900,
              letterSpacing: 3,
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              textShadow: "0 0 20px rgba(124,255,77,0.5)",
              mb: 0.5,
            }}
          >
            PIXÃO NA MÃO
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontWeight: 900,
              lineHeight: 1,
              fontSize: { xs: "2.5rem", sm: "3.25rem", md: "3.75rem" },
              mb: 1.5,
            }}
          >
            <Box
              component="span"
              sx={{
                display: "block",
                color: "#fff",
                textShadow: "0 0 30px rgba(124,255,77,0.4), 2px 2px 0 rgba(103,194,58,0.3)",
              }}
            >
              TRÊS
            </Box>
            <Box
              component="span"
              sx={{
                display: "block",
                background: "linear-gradient(180deg, #FFF176 0%, #FFD54F 50%, #FF8F00 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 4px 12px rgba(255,193,7,0.4))",
              }}
            >
              SORTEIOS!
            </Box>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              maxWidth: 520,
              mx: "auto",
              lineHeight: 1.55,
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
            }}
          >
            Escolha seu e-book, selecione seus números e acompanhe tudo de forma transparente.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ width: "100%", alignItems: "stretch" }}
        >
          {displayPrizes.map((p) => (
            <PrizeTower
              key={p.label}
              label={p.label}
              amount={p.amount}
              loading={loading}
              rank={p.rank}
            />
          ))}
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="center"
          sx={{ flexWrap: "wrap" }}
        >
          {[
            { icon: PaidRoundedIcon, text: "Prêmios em dinheiro" },
            { icon: BoltRoundedIcon, text: "Sorteio transparente" },
            { icon: ConfirmationNumberRoundedIcon, text: "Escolha seu número" },
          ].map(({ icon: Icon, text }) => (
            <Box
              key={text}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 1,
                borderRadius: 2,
                border: `1px solid ${campaignColors.borderNeon}`,
                bgcolor: "rgba(103,194,58,0.06)",
                flex: { xs: "1 1 100%", sm: "0 1 auto" },
                justifyContent: { xs: "center", sm: "flex-start" },
              }}
            >
              <Icon sx={{ fontSize: 20, color: "primary.light" }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.light" }}>
                {text.toUpperCase()}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center" sx={{ pt: 0.5 }}>
          <Button
            size="large"
            variant="contained"
            onClick={handlePrimaryCta}
            startIcon={<EmojiEventsRoundedIcon />}
            sx={{
              ...goldButtonSx,
              width: { xs: "100%", sm: "auto" },
              minWidth: { sm: 280 },
            }}
          >
            » Escolher meus números «
          </Button>
          <Button
            size="large"
            variant="outlined"
            onClick={handleSecondaryCta}
            sx={{
              fontWeight: 800,
              borderColor: campaignColors.borderNeon,
              borderWidth: 2,
              color: "primary.light",
              width: { xs: "100%", sm: "auto" },
              "&:hover": { borderColor: "primary.light", bgcolor: "rgba(103,194,58,0.1)" },
            }}
          >
            Entender como funciona
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
