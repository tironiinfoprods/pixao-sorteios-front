import * as React from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import PixRoundedIcon from "@mui/icons-material/PixRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { campaignColors } from "../../theme/campaignTheme";
import { trackEvent, AnalyticsEvents } from "../../utils/analytics";

const ITEMS = [
  { icon: VerifiedRoundedIcon, title: "Sorteio transparente", desc: "Resultado pela Lotomania, com regras claras." },
  { icon: GavelRoundedIcon, title: "Regras disponíveis", desc: "Termos e regulamento acessíveis no site." },
  { icon: PixRoundedIcon, title: "Pagamento via Pix", desc: "Confirmação rápida e segura." },
  { icon: LanguageRoundedIcon, title: "Acompanhamento pelo site", desc: "Veja status da sua participação na área do cliente." },
  { icon: WhatsAppIcon, title: "Suporte pelo WhatsApp", desc: "Tire dúvidas com nossa equipe." },
];

export default function TrustSection({ supportUrl = "https://wa.me/554396717931" }) {
  const handleSupport = () => {
    trackEvent(AnalyticsEvents.WHATSAPP_SUPPORT);
  };

  return (
    <Box component="section" aria-label="Confiança e transparência" sx={{ mb: { xs: 3, md: 4 } }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
        Transparência e confiança
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5 }}>
        Informações claras para você participar com segurança.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Paper
              key={item.title}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: `1px solid ${campaignColors.borderNeon}`,
                bgcolor: "rgba(103,194,58,0.03)",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Icon sx={{ color: "primary.main", fontSize: 28, mt: 0.25 }} />
                <Box>
                  <Typography sx={{ fontWeight: 800, mb: 0.25 }}>{item.title}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.45 }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          );
        })}
      </Box>

      <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
        <Button
          component="a"
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          size="large"
          startIcon={<WhatsAppIcon />}
          onClick={handleSupport}
          sx={{
            fontWeight: 800,
            borderColor: "#25D366",
            color: "#25D366",
            px: 3,
            "&:hover": { borderColor: "#1ebe57", bgcolor: "rgba(37,211,102,0.08)" },
          }}
        >
          Falar no WhatsApp
        </Button>
      </Box>
    </Box>
  );
}
