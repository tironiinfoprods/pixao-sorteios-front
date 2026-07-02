import * as React from "react";
import { Box, Typography } from "@mui/material";
import { sortCardsByPrize, getPlanTier } from "../../utils/homeHelpers";
import { campaignColors } from "../../theme/campaignTheme";
import ProductCard from "./ProductCard";

export default function PlansSection({ cards, loading, onBuy, isAuthenticated }) {
  const sorted = sortCardsByPrize(cards);

  return (
    <Box
      component="section"
      id="planos"
      aria-label="Planos e e-books"
      sx={{ mb: { xs: 2.5, md: 4 }, scrollMarginTop: { xs: 56, sm: 72 } }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 900,
          mb: 0.75,
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
          color: campaignColors.textPrimary,
        }}
      >
        Escolha seu plano e selecione seus números
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: campaignColors.textSecondary, mb: { xs: 2, sm: 3 }, maxWidth: 560, lineHeight: 1.55 }}
      >
        Cada plano dá acesso a um e-book e à seleção de números para participar.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" },
          gap: { xs: 2, sm: 2.5 },
          alignItems: "stretch",
        }}
      >
        {loading
          ? [0, 1, 2].map((i) => (
              <ProductCard key={i} row={null} loading tier="entry" onBuy={onBuy} isAuthenticated={isAuthenticated} />
            ))
          : sorted.map((row, idx) => (
              <ProductCard
                key={row?.product?.id || idx}
                row={row}
                loading={false}
                onBuy={onBuy}
                isAuthenticated={isAuthenticated}
                tier={getPlanTier(cards, row)}
              />
            ))}
      </Box>
    </Box>
  );
}
