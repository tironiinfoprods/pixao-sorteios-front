import * as React from "react";
import { Box, Chip, Container, Divider, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { campaignColors } from "../../theme/campaignTheme";

export default function HomeFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        borderTop: `1px solid ${campaignColors.borderNeon}`,
        bgcolor: "rgba(5,8,5,0.98)",
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: { xs: "0.875rem", md: "0.9rem" } }}
        >
          Sorteios lastreados por Títulos de Capitalização, da Modalidade Incentivo, emitidos pela
          VIA Capitalização S.A., inscrita no CNPJ sob nº <strong style={{ color: "#fff" }}>88.076.302/0001-94</strong>,
          e aprovados pela SUSEP através do registro na SUSEP Sorteio n°{" "}
          <strong style={{ color: "#fff" }}>15144.655164/2025-41</strong>. O valor das premiações aqui indicados
          são líquidos, já descontado o devido imposto de renda de 25%. O registro deste plano na SUSEP não
          implica, por parte da Autarquia, incentivo ou recomendação à sua comercialização.
        </Typography>

        <Divider sx={{ my: 3, borderColor: "rgba(103,194,58,0.2)" }} />

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Títulos emitidos por:
            </Typography>
            <Chip size="small" label="ViaCap" variant="outlined" sx={{ borderColor: campaignColors.borderNeon }} />
            <Chip size="small" label="Google Safe Browsing" variant="outlined" sx={{ borderColor: "rgba(255,255,255,0.15)" }} />
          </Stack>
        </Stack>

        <Divider sx={{ my: 3, borderColor: "rgba(103,194,58,0.2)" }} />

        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={3}
          alignItems={{ xs: "flex-start", lg: "flex-start" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ gap: 1.5 }}>
            {[
              { to: "/termos", label: "Termos de Uso" },
              { to: "/privacidade", label: "Política de Privacidade" },
              { to: "/jogo-responsavel", label: "Jogo Responsável" },
              { to: "/termos", label: "Regulamento" },
            ].map((item) => (
              <Link
                key={item.label}
                component={RouterLink}
                to={item.to}
                underline="hover"
                sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.9rem" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="https://wa.me/554396717931"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.9rem" }}
            >
              Suporte
            </Link>
          </Stack>

          <Stack spacing={1} sx={{ minWidth: { lg: 320 } }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              SAC ViaCap —{" "}
              <Link href="tel:08007407819" underline="hover" sx={{ color: "#fff" }}>
                0800 740 7819
              </Link>
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Ouvidoria ViaCap —{" "}
              <Link href="tel:08008741505" underline="hover" sx={{ color: "#fff" }}>
                0800 874 1505
              </Link>
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              <strong style={{ color: "#fff" }}>Pixão na Mão</strong> — Tironi Tech (CNPJ{" "}
              <strong style={{ color: "#fff" }}>58.336.550/0001-66</strong>)
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
