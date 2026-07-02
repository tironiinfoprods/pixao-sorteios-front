import * as React from "react";
import { Box, Typography } from "@mui/material";
import { sortCardsByPrize } from "../../utils/homeHelpers";
import ProductCard from "./ProductCard";

export default function PlansSection({
  cards,
  loading,
  featuredId,
  onBuy,
  isAuthenticated,
}) {
  const sorted = sortCardsByPrize(cards);

  return (
    <Box component="section" id="planos" aria-label="Planos e e-books" sx={{ mb: { xs: 3, md: 4 }, scrollMarginTop: 80 }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
        Escolha seu plano e concorra aos prêmios
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3, maxWidth: 560 }}>
        Cada e-book dá direito à seleção de números para participar.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" },
          gap: 3,
          alignItems: "stretch",
        }}
      >
        {loading
          ? [0, 1, 2].map((i) => (
              <ProductCard key={i} row={null} loading onBuy={onBuy} isAuthenticated={isAuthenticated} />
            ))
          : sorted.map((row, idx) => (
              <Box
                key={row?.product?.id || idx}
                sx={{
                  order: idx === 0 ? { xs: 0, md: 0 } : idx,
                  position: "relative",
                }}
              >
                <ProductCard
                  row={row}
                  loading={false}
                  onBuy={onBuy}
                  isAuthenticated={isAuthenticated}
                  featured={row?.product?.id === featuredId}
                />
              </Box>
            ))}
      </Box>
    </Box>
  );
}
