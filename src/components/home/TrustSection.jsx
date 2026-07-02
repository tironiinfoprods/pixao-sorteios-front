import * as React from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import PixRoundedIcon from "@mui/icons-material/PixRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { campaignColors } from "../../theme/campaignTheme";
import { trackEvent, AnalyticsEvents } from "../../utils/analytics";

const ITEMS = [
  { icon: PixRoundedIcon, title: "Pagamento via Pix" },
  { icon: GavelRoundedIcon, title: "Regras disponíveis" },
  { icon: LanguageRoundedIcon, title: "Acompanhamento pelo site" },
  { icon: WhatsAppIcon, title: "Suporte pelo WhatsApp" },
];

export default function TrustSection({ supportUrl = "https://wa.me/554396717931" }) {
  const handleSupport = () => {
    trackEvent(AnalyticsEvents.WHATSAPP_SUPPORT);
  };

  return (
    <Box
      component="section"
      aria-label="Transparência"
      sx={{
        mb: { xs: 2.5, md: 4 },
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        bgcolor: campaignColors.bgPaper,
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.75, fontSize: { xs: "1.15rem", sm: "1.35rem" } }}>
        Transparência para participar com segurança
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
          gap: 1.25,
          mb: 2.5,
        }}
      >
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Paper
              key={item.title}
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: "1px solid rgba(255,255,255,0.08)",
                bgcolor: "rgba(3,7,3,0.5)",
                textAlign: "center",
              }}
            >
              <Icon sx={{ color: campaignColors.gold, fontSize: 28, mb: 0.75 }} />
              <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", lineHeight: 1.3 }}>
                {item.title}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      <Button
        component="a"
        href={supportUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        size="large"
        fullWidth
        startIcon={<WhatsAppIcon />}
        onClick={handleSupport}
        sx={{
          fontWeight: 800,
          borderColor: "#25D366",
          color: "#25D366",
          maxWidth: { sm: 360 },
          minHeight: 48,
          "&:hover": { borderColor: "#1ebe57", bgcolor: "rgba(37,211,102,0.08)" },
        }}
      >
        Falar no WhatsApp
      </Button>
    </Box>
  );
}
