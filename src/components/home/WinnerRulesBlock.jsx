import * as React from "react";
import { Paper, Typography } from "@mui/material";
import { campaignColors } from "../../theme/campaignTheme";

export default function WinnerRulesBlock() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        mb: { xs: 3, md: 4 },
        borderRadius: 2.5,
        border: "1px solid rgba(255,255,255,0.08)",
        bgcolor: campaignColors.bgPaper,
      }}
    >
      <Typography sx={{ fontWeight: 800, mb: 0.75 }}>Como o vencedor é definido</Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
        Quando todos os números forem vendidos, usamos o <strong style={{ color: "#fff" }}>próximo sorteio da Lotomania</strong>.
        O ganhador é quem comprou o <strong style={{ color: "#fff" }}>último número sorteado</strong> entre os 100 da tabela.
      </Typography>
    </Paper>
  );
}
