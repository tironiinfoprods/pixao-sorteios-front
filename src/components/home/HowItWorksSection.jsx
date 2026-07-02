import * as React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import PixRoundedIcon from "@mui/icons-material/PixRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { campaignColors } from "../../theme/campaignTheme";

const STEPS = [
  {
    icon: MenuBookRoundedIcon,
    title: "Escolha seu e-book",
    desc: "Cada e-book dá direito à seleção de números para participar.",
  },
  {
    icon: GridViewRoundedIcon,
    title: "Selecione seus números",
    desc: "Escolha na tabela de 00 a 99 após a compra.",
  },
  {
    icon: PixRoundedIcon,
    title: "Finalize pelo Pix",
    desc: "Pagamento rápido e confirmação pelo site.",
  },
  {
    icon: VisibilityRoundedIcon,
    title: "Acompanhe o sorteio",
    desc: "Transparência total — sorteio pela Lotomania ao esgotar.",
  },
];

export default function HowItWorksSection() {
  return (
    <Box component="section" id="como-funciona" aria-label="Como funciona" sx={{ mb: { xs: 3, md: 4 } }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5, textAlign: { xs: "left", md: "center" } }}>
        Como funciona
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", mb: 2.5, textAlign: { xs: "left", md: "center" } }}
      >
        Quatro passos simples para participar com clareza.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <Paper
              key={s.title}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: `1px solid ${campaignColors.borderNeon}`,
                bgcolor: "rgba(103,194,58,0.04)",
                transition: "border-color 0.2s",
                "&:hover": { borderColor: campaignColors.neonGreenBright },
              }}
            >
              <Stack spacing={1.25}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(103,194,58,0.15)",
                    border: `1px solid ${campaignColors.borderNeon}`,
                  }}
                >
                  <Icon sx={{ color: "primary.main", fontSize: 24 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "secondary.main" }}>
                  Passo {i + 1}
                </Typography>
                <Typography sx={{ fontWeight: 800, lineHeight: 1.25 }}>{s.title}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.45 }}>
                  {s.desc}
                </Typography>
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
