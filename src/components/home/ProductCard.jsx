import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { resolveCoverUrl } from "../../utils/homeApi";
import { BRL, getPrizeCents, getPriceCents, getProductKey } from "../../utils/homeHelpers";
import { campaignColors, neonButtonSx } from "../../theme/campaignTheme";
import ProgressNumbers from "./ProgressNumbers";
import NumbersMiniBoard from "./NumbersMiniBoard";
import { trackEvent, AnalyticsEvents } from "../../utils/analytics";

export default function ProductCard({
  row,
  loading,
  onBuy,
  isAuthenticated,
  featured = false,
}) {
  const p = row?.product || {};
  const d = row?.draw || {};
  const prize = getPrizeCents(p, d) / 100;
  const price = getPriceCents(p, d) / 100;
  const cover = resolveCoverUrl(p.cover_url);
  const ctaLabel = isAuthenticated ? "Comprar e escolher número" : "Entrar e comprar";

  const handleBuy = () => {
    trackEvent(AnalyticsEvents.PLAN_CLICK, {
      productId: p.id,
      prize: prize,
      featured,
    });
    onBuy(p, getPriceCents(p, d));
  };

  if (loading) {
    return (
      <Card
        variant="outlined"
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 360,
          opacity: 0.5,
          borderColor: campaignColors.borderNeon,
        }}
      >
        <Box sx={{ aspectRatio: "16/9", bgcolor: "rgba(255,255,255,0.04)" }} />
        <CardContent>
          <Typography>Carregando…</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: featured
          ? `2px solid ${campaignColors.borderGold}`
          : `1px solid ${campaignColors.borderNeon}`,
        bgcolor: featured ? "rgba(255,213,79,0.05)" : "rgba(20,26,20,0.6)",
        borderRadius: 3,
        boxShadow: featured ? "0 0 28px rgba(255,193,7,0.15)" : "0 8px 24px rgba(0,0,0,0.35)",
        transform: featured ? { md: "scale(1.02)" } : "none",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      {featured ? (
        <Chip
          icon={<StarRoundedIcon sx={{ fontSize: 16 }} />}
          label="Maior prêmio"
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
            fontWeight: 800,
            bgcolor: "secondary.main",
            color: "#050805",
          }}
        />
      ) : null}

      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 9",
          borderBottom: `1px solid ${campaignColors.borderNeon}`,
          background: cover
            ? `url(${cover}) center/cover no-repeat`
            : "repeating-linear-gradient(135deg, rgba(103,194,58,0.08) 0 8px, rgba(255,255,255,0.03) 8px 16px)",
        }}
      >
        <Chip
          label={`Prêmio ${BRL.format(prize)}`}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            fontWeight: 900,
            bgcolor: "rgba(0,0,0,0.8)",
            color: "secondary.main",
            border: `1px solid ${campaignColors.borderGold}`,
          }}
        />
      </Box>

      <CardContent sx={{ flex: 1, pt: 2 }}>
        <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700 }}>
          {p.subtitle || "E-book + sorteio"}
        </Typography>
        <Typography variant="h6" fontWeight={900} sx={{ mt: 0.5 }}>
          {p.title || "E-book"}
        </Typography>

        <Typography
          variant="h4"
          sx={{ mt: 1.5, fontWeight: 900, color: "secondary.main", lineHeight: 1.1 }}
        >
          {BRL.format(prize)}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          por <strong style={{ color: "#fff" }}>{BRL.format(price)}</strong> / número
        </Typography>

        {p.description ? (
          <Typography variant="body2" sx={{ mt: 1.5, color: "text.secondary", lineHeight: 1.5 }}>
            {p.description}
          </Typography>
        ) : null}

        {d?.total_numbers ? (
          <Box sx={{ mt: 2 }}>
            <ProgressNumbers
              total={d.total_numbers}
              reserved={d.reserved ?? 0}
              sold={d.sold ?? 0}
              showUrgency
            />
          </Box>
        ) : null}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, flexDirection: "column", alignItems: "stretch", gap: 1 }}>
        <Button
          fullWidth
          size="large"
          color="success"
          variant="contained"
          onClick={handleBuy}
          sx={neonButtonSx}
        >
          {ctaLabel}
        </Button>
        {d?.id ? (
          <NumbersMiniBoard drawId={d.id} productKey={getProductKey(p)} collapsed />
        ) : null}
      </CardActions>
    </Card>
  );
}
