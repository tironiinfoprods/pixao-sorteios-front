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
    desc: "Escolha os números disponíveis no plano desejado.",
  },
  {
    icon: PixRoundedIcon,
    title: "Pague via Pix",
    desc: "Finalize a participação com pagamento rápido e seguro.",
  },
  {
    icon: VisibilityRoundedIcon,
    title: "Acompanhe o sorteio",
    desc: "Veja as informações e atualizações diretamente pelo site.",
  },
];

export default function HowItWorksSection() {
  return (
    <Box
      component="section"
      id="como-funciona"
      aria-label="Como participar"
      sx={{
        mb: { xs: 3, md: 4 },
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        bgcolor: campaignColors.bgPaper,
        border: `1px solid rgba(255,255,255,0.06)`,
      }}
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
        Como participar é simples
      </Typography>
      <Typography variant="body2" sx={{ color: campaignColors.textSecondary, mb: 2.5, maxWidth: 520 }}>
        Quatro passos claros — sem surpresas.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <Paper
              key={s.title}
              elevation={0}
              sx={{
                p: { xs: 1.75, sm: 2.25 },
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.08)",
                bgcolor: "rgba(3,7,3,0.6)",
              }}
            >
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    width: { xs: 52, sm: 56 },
                    height: { xs: 52, sm: 56 },
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(255,212,59,0.1)",
                    border: `1px solid ${campaignColors.borderGold}`,
                  }}
                >
                  <Icon sx={{ color: campaignColors.gold, fontSize: { xs: 28, sm: 30 } }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: campaignColors.goldCta }}>
                  Passo {i + 1}
                </Typography>
                <Typography sx={{ fontWeight: 800, lineHeight: 1.25, fontSize: { xs: "0.95rem", sm: "1rem" } }}>
                  {s.title}
                </Typography>
                <Typography variant="body2" sx={{ color: campaignColors.textSecondary, lineHeight: 1.5, fontSize: "0.85rem" }}>
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
