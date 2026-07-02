import * as React from "react";
import { Box, Button, Slide } from "@mui/material";
import { campaignColors, goldButtonSx } from "../../theme/campaignTheme";
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
          px: 1.25,
          pt: 1,
          bgcolor: "rgba(3,7,3,0.97)",
          borderTop: `1px solid ${campaignColors.borderNeon}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <Button fullWidth variant="contained" size="large" onClick={handleClick} sx={{ ...goldButtonSx, minHeight: 50 }}>
          Escolher números
        </Button>
      </Box>
    </Slide>
  );
}
