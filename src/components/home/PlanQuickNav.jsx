import * as React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { sortCardsByPrize, BRL, getPrizeCents, scrollToId, PLAN_BADGE_LABELS, getPlanTier } from "../../utils/homeHelpers";
import { campaignColors } from "../../theme/campaignTheme";
import { trackEvent, AnalyticsEvents } from "../../utils/analytics";

const TIER_COLORS = {
  featured: campaignColors.gold,
  intermediate: campaignColors.neonGreenSecondary,
  entry: campaignColors.textSecondary,
};

export default function PlanQuickNav({ cards, loading }) {
  const sorted = sortCardsByPrize(cards).slice(0, 3);

  if (loading || !sorted.length) return null;

  const handleSelect = (row) => {
    const id = row?.product?.id;
    if (!id) return;
    trackEvent(AnalyticsEvents.QUICK_PLAN_NAV, { productId: id, tier: getPlanTier(cards, row) });
    scrollToId(`plano-${id}`);
  };

  return (
    <Box sx={{ pt: 0.5 }}>
      <Typography
        variant="caption"
        sx={{ display: "block", textAlign: "center", color: campaignColors.textSecondary, mb: 1, fontWeight: 700 }}
      >
        Acesso rápido aos planos
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        useFlexGap
        sx={{ flexWrap: "wrap", justifyContent: "center" }}
      >
        {sorted.map((row) => {
          const p = row?.product || {};
          const tier = getPlanTier(cards, row);
          const prize = getPrizeCents(p, row?.draw) / 100;
          const accent = TIER_COLORS[tier] || TIER_COLORS.entry;

          return (
            <Button
              key={p.id}
              variant="outlined"
              onClick={() => handleSelect(row)}
              sx={{
                flex: { sm: 1 },
                minWidth: { xs: "100%", sm: 0 },
                py: 1.25,
                px: 1.5,
                borderColor: "rgba(255,255,255,0.12)",
                borderLeft: `3px solid ${accent}`,
                borderRadius: 1.5,
                textAlign: "left",
                justifyContent: "flex-start",
                color: campaignColors.textPrimary,
                "&:hover": {
                  borderColor: accent,
                  bgcolor: "rgba(57,255,20,0.04)",
                },
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ display: "block", color: accent, fontWeight: 800, lineHeight: 1.2 }}>
                  {PLAN_BADGE_LABELS[tier]}
                </Typography>
                <Typography sx={{ fontWeight: 900, fontSize: "0.95rem", lineHeight: 1.2 }}>
                  {BRL.format(prize)}
                </Typography>
              </Box>
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}
