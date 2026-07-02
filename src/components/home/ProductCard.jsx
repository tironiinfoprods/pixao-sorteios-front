import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { resolveCoverUrl } from "../../utils/homeApi";
import { BRL, getPrizeCents, getPriceCents, getProductKey, PLAN_BADGE_LABELS } from "../../utils/homeHelpers";
import { campaignColors, goldButtonSx } from "../../theme/campaignTheme";
import ProgressNumbers from "./ProgressNumbers";
import NumbersMiniBoard from "./NumbersMiniBoard";
import { trackEvent, AnalyticsEvents } from "../../utils/analytics";

const TIER_STYLES = {
  featured: {
    border: `2px solid ${campaignColors.gold}`,
    shadow: "0 0 48px rgba(255,196,0,0.15)",
    bgcolor: "rgba(255,212,59,0.04)",
    prizeGradient: `linear-gradient(180deg, #FFF 0%, ${campaignColors.gold} 100%)`,
    badgeBg: campaignColors.gold,
    badgeColor: "#030703",
  },
  intermediate: {
    border: `1px solid ${campaignColors.borderNeon}`,
    shadow: "0 12px 32px rgba(0,0,0,0.4)",
    bgcolor: campaignColors.bgCard,
    prizeGradient: `linear-gradient(180deg, ${campaignColors.neonGreenSecondary}, ${campaignColors.neonGreen})`,
    badgeBg: "rgba(23,201,100,0.2)",
    badgeColor: campaignColors.neonGreenSecondary,
  },
  entry: {
    border: "1px solid rgba(255,255,255,0.1)",
    shadow: "0 8px 24px rgba(0,0,0,0.35)",
    bgcolor: campaignColors.bgCard,
    prizeGradient: `linear-gradient(180deg, #E8E8E8, ${campaignColors.textSecondary})`,
    badgeBg: "rgba(255,255,255,0.08)",
    badgeColor: campaignColors.textSecondary,
  },
};

export default function ProductCard({ row, loading, onBuy, isAuthenticated, tier = "entry" }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const styles = TIER_STYLES[tier] || TIER_STYLES.entry;

  const p = row?.product || {};
  const d = row?.draw || {};
  const prize = getPrizeCents(p, d) / 100;
  const price = getPriceCents(p, d) / 100;
  const cover = resolveCoverUrl(p.cover_url);
  const badgeLabel = PLAN_BADGE_LABELS[tier] || PLAN_BADGE_LABELS.entry;

  const handleBuy = () => {
    trackEvent(AnalyticsEvents.PLAN_CLICK, { productId: p.id, prize, tier });
    onBuy(p, getPriceCents(p, d));
  };

  const buyButton = (
    <Button
      fullWidth
      size="large"
      variant="contained"
      onClick={handleBuy}
      sx={{
        ...goldButtonSx,
        minHeight: 50,
        fontSize: { xs: "0.9rem", sm: "0.95rem" },
        mt: { xs: 1.25, sm: 1.5 },
      }}
    >
      Selecionar números deste plano
    </Button>
  );

  if (loading) {
    return (
      <Card sx={{ minHeight: 260, opacity: 0.4, border: styles.border, bgcolor: styles.bgcolor }}>
        <CardContent>
          <Typography>Carregando…</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      id={p.id ? `plano-${p.id}` : undefined}
      elevation={0}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: styles.border,
        bgcolor: styles.bgcolor,
        borderRadius: { xs: 2, sm: 2.5 },
        boxShadow: styles.shadow,
        overflow: "hidden",
        transform: tier === "featured" ? { lg: "scale(1.02)" } : "none",
      }}
    >
      <Box
        sx={{
          position: "relative",
          aspectRatio: tier === "featured" ? { xs: "2/1", sm: "16/9" } : { xs: "2.4/1", sm: "18/9" },
          maxHeight: tier === "featured" ? { xs: 150, sm: "none" } : { xs: 120, sm: "none" },
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: cover
            ? `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.75)), url(${cover}) center/cover`
            : `linear-gradient(135deg, rgba(7,16,8,0.9), rgba(3,7,3,1))`,
        }}
      >
        <Chip
          label={badgeLabel}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            fontWeight: 800,
            bgcolor: styles.badgeBg,
            color: styles.badgeColor,
            fontSize: "0.7rem",
            height: 26,
          }}
        />
      </Box>

      <CardContent sx={{ flex: 1, pt: 1.5, pb: 2, px: { xs: 1.5, sm: 2 } }}>
        <Typography
          variant="h6"
          fontWeight={900}
          sx={{ fontSize: { xs: "1.05rem", sm: "1.15rem" }, lineHeight: 1.25, color: campaignColors.textPrimary }}
        >
          {p.title || "E-book"}
        </Typography>

        <Typography
          sx={{
            mt: 1.25,
            fontWeight: 900,
            lineHeight: 1,
            fontSize: tier === "featured" ? { xs: "2rem", sm: "2.35rem" } : { xs: "1.5rem", sm: "1.75rem" },
            background: styles.prizeGradient,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {BRL.format(prize)}
        </Typography>
        <Typography variant="body2" sx={{ color: campaignColors.textSecondary, mt: 0.75, fontSize: "0.85rem" }}>
          {BRL.format(price)} por número
        </Typography>

        {d?.total_numbers ? (
          <Box sx={{ mt: 1.5 }}>
            <ProgressNumbers total={d.total_numbers} reserved={d.reserved ?? 0} sold={d.sold ?? 0} showUrgency />
          </Box>
        ) : null}

        {isMobile ? buyButton : null}

        {d?.id ? (
          <NumbersMiniBoard
            drawId={d.id}
            productKey={getProductKey(p)}
            numbers={d.numbers}
            total={d.total_numbers ?? 100}
            reserved={d.reserved ?? 0}
            sold={d.sold ?? 0}
          />
        ) : null}

        {!isMobile ? buyButton : null}
      </CardContent>
    </Card>
  );
}
