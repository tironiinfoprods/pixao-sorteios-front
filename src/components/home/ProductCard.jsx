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
import { campaignColors, goldButtonSx, neonButtonSx } from "../../theme/campaignTheme";
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
          ? "2px solid #FFD54F"
          : `2px solid ${campaignColors.borderNeon}`,
        bgcolor: featured ? "rgba(255,213,79,0.04)" : "rgba(10,14,10,0.85)",
        borderRadius: 3,
        boxShadow: featured
          ? "0 0 40px rgba(255,193,7,0.2), inset 0 0 30px rgba(255,193,7,0.04)"
          : "0 0 24px rgba(103,194,58,0.08)",
        overflow: "hidden",
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
            bgcolor: "#FFD54F",
            color: "#050805",
            boxShadow: "0 0 12px rgba(255,213,79,0.5)",
          }}
        />
      ) : null}

      <Box
        sx={{
          position: "relative",
          aspectRatio: { xs: "21/9", sm: "16/9" },
          borderBottom: `1px solid ${featured ? "rgba(255,213,79,0.3)" : campaignColors.borderNeon}`,
          background: cover
            ? `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.65)), url(${cover}) center/cover no-repeat`
            : "linear-gradient(135deg, rgba(103,194,58,0.15) 0%, rgba(5,8,5,0.95) 100%)",
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
            bgcolor: "rgba(0,0,0,0.85)",
            color: "#FFD54F",
            border: "2px solid #FFD54F",
            fontSize: "0.8rem",
            boxShadow: "0 0 12px rgba(255,213,79,0.3)",
          }}
        />
      </Box>

      <CardContent sx={{ flex: 1, pt: 2, px: { xs: 2, sm: 2.5 } }}>
        <Typography variant="overline" sx={{ color: "primary.light", fontWeight: 800, letterSpacing: 1 }}>
          {p.subtitle || "E-book + sorteio"}
        </Typography>
        <Typography variant="h6" fontWeight={900} sx={{ mt: 0.5 }}>
          {p.title || "E-book"}
        </Typography>

        <Typography
          variant="h3"
          sx={{
            mt: 1.5,
            fontWeight: 900,
            lineHeight: 1,
            fontSize: { xs: "2rem", sm: "2.25rem" },
            background: featured
              ? "linear-gradient(180deg, #FFF176, #FFD54F, #FF8F00)"
              : "linear-gradient(180deg, #B9FF6A, #7CFF4D)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: featured ? "drop-shadow(0 0 8px rgba(255,213,79,0.3))" : "none",
          }}
        >
          {BRL.format(prize)}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
          por <strong style={{ color: "#FFD54F" }}>{BRL.format(price)}</strong> / número
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

        {d?.id ? (
          <NumbersMiniBoard drawId={d.id} productKey={getProductKey(p)} />
        ) : null}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, px: { xs: 2, sm: 2.5 } }}>
        <Button
          fullWidth
          size="large"
          variant="contained"
          onClick={handleBuy}
          sx={featured ? goldButtonSx : neonButtonSx}
        >
          {featured ? `» ${ctaLabel} «` : ctaLabel}
        </Button>
      </CardActions>
    </Card>
  );
}
