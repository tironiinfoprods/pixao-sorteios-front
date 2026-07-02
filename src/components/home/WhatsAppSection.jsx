import * as React from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { campaignColors, neonButtonSx } from "../../theme/campaignTheme";
import { trackEvent, AnalyticsEvents } from "../../utils/analytics";

export default function WhatsAppSection({ groupUrl }) {
  const handleClick = () => {
    trackEvent(AnalyticsEvents.WHATSAPP_GROUP);
  };

  return (
    <Paper
      component="section"
      elevation={0}
      aria-label="Grupo oficial no WhatsApp"
      sx={{
        p: { xs: 3, md: 4 },
        mb: { xs: 3, md: 4 },
        textAlign: "center",
        borderRadius: 3,
        border: `1px solid ${campaignColors.borderNeon}`,
        background: `
          radial-gradient(600px 300px at 50% 0%, rgba(37,211,102,0.12), transparent 70%),
          linear-gradient(180deg, rgba(20,26,20,0.95), rgba(5,8,5,0.98))
        `,
        boxShadow: "0 0 32px rgba(37,211,102,0.08)",
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(37,211,102,0.15)",
            border: "2px solid rgba(37,211,102,0.5)",
          }}
        >
          <GroupsRoundedIcon sx={{ fontSize: 32, color: "#25D366" }} />
        </Box>

        <Typography variant="h5" fontWeight={900}>
          Entre no grupo oficial
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 480, lineHeight: 1.55 }}>
          Receba avisos, atualizações e informações importantes sobre os sorteios.
        </Typography>

        <Button
          component="a"
          href={groupUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="large"
          variant="contained"
          startIcon={<WhatsAppIcon />}
          onClick={handleClick}
          sx={{
            ...neonButtonSx,
            bgcolor: "#25D366",
            boxShadow: "0 4px 24px rgba(37,211,102,0.4)",
            "&:hover": { bgcolor: "#1ebe57", boxShadow: "0 6px 32px rgba(37,211,102,0.5)" },
          }}
        >
          Entrar no grupo do WhatsApp
        </Button>
      </Stack>
    </Paper>
  );
}
