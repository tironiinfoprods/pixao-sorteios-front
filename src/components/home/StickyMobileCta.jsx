import * as React from "react";
import { Box, Button, Slide } from "@mui/material";
import { campaignColors, neonButtonSx } from "../../theme/campaignTheme";
import { trackEvent, AnalyticsEvents } from "../../utils/analytics";

export default function StickyMobileCta({ visible, onClick }) {
  const handleClick = () => {
    trackEvent(AnalyticsEvents.STICKY_CTA);
    trackEvent(AnalyticsEvents.SCROLL_TO_PLANS);
    onClick?.();
  };

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Box
        className="sticky-mobile-cta"
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          px: 2,
          pt: 1.5,
          bgcolor: "rgba(5,8,5,0.96)",
          borderTop: `1px solid ${campaignColors.borderNeon}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <Button
          fullWidth
          color="success"
          variant="contained"
          size="large"
          onClick={handleClick}
          sx={neonButtonSx}
        >
          Escolher números
        </Button>
      </Box>
    </Slide>
  );
}
