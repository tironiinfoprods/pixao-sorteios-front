import { createTheme } from "@mui/material/styles";

export const campaignColors = {
  bg: "#050805",
  bgPaper: "#0f120f",
  bgCard: "#141a14",
  neonGreen: "#67C23A",
  neonGreenBright: "#7CFF4D",
  gold: "#FFC107",
  goldLight: "#FFD54F",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.72)",
  borderNeon: "rgba(103,194,58,0.45)",
  borderGold: "rgba(255,213,79,0.35)",
};

export const campaignTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: campaignColors.neonGreen, light: campaignColors.neonGreenBright },
    secondary: { main: campaignColors.gold, light: campaignColors.goldLight },
    background: { default: campaignColors.bg, paper: campaignColors.bgPaper },
    error: { main: "#D32F2F" },
    success: { main: "#59b15f" },
    text: {
      primary: campaignColors.textPrimary,
      secondary: campaignColors.textSecondary,
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"].join(","),
    h1: { fontWeight: 900, letterSpacing: "-0.02em" },
    h2: { fontWeight: 900, letterSpacing: "-0.02em" },
    h3: { fontWeight: 900 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 800, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: campaignColors.bg,
          scrollBehavior: "smooth",
        },
      },
    },
  },
});

export const cardSx = {
  background: `linear-gradient(145deg, ${campaignColors.bgCard} 0%, ${campaignColors.bgPaper} 100%)`,
  border: `1px solid ${campaignColors.borderNeon}`,
  borderRadius: 3,
  boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 24px rgba(103,194,58,0.06)",
};

export const neonButtonSx = {
  fontWeight: 900,
  px: 3,
  py: 1.4,
  fontSize: "1rem",
  boxShadow: "0 4px 24px rgba(103,194,58,0.35)",
  "&:hover": {
    boxShadow: "0 6px 32px rgba(103,194,58,0.5)",
  },
};
