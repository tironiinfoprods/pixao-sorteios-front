import { createTheme } from "@mui/material/styles";

export const campaignColors = {
  bg: "#030703",
  bgPaper: "#071008",
  bgCard: "#071008",
  neonGreen: "#39FF14",
  neonGreenSecondary: "#17C964",
  gold: "#FFD43B",
  goldCta: "#FFC400",
  textPrimary: "#F8F8F8",
  textSecondary: "#B7B7B7",
  borderNeon: "rgba(57,255,20,0.28)",
  borderGold: "rgba(255,212,59,0.45)",
  reserved: "#FFB020",
  unavailable: "#FF3B3B",
};

export const campaignTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: campaignColors.neonGreen, light: campaignColors.neonGreenSecondary },
    secondary: { main: campaignColors.gold, light: campaignColors.goldCta },
    background: { default: campaignColors.bg, paper: campaignColors.bgPaper },
    error: { main: campaignColors.unavailable },
    success: { main: campaignColors.neonGreenSecondary },
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

export const goldButtonSx = {
  fontWeight: 900,
  px: 3,
  py: 1.5,
  fontSize: "1rem",
  color: "#030703",
  background: `linear-gradient(180deg, ${campaignColors.gold} 0%, ${campaignColors.goldCta} 100%)`,
  boxShadow: "0 4px 28px rgba(255,196,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
  "&:hover": {
    background: `linear-gradient(180deg, #FFE566 0%, ${campaignColors.gold} 100%)`,
    boxShadow: "0 6px 36px rgba(255,196,0,0.45)",
  },
};

export const greenButtonSx = {
  fontWeight: 800,
  px: 3,
  py: 1.4,
  fontSize: "0.95rem",
  color: campaignColors.textPrimary,
  border: `2px solid ${campaignColors.neonGreenSecondary}`,
  bgcolor: "rgba(23,201,100,0.12)",
  "&:hover": {
    bgcolor: "rgba(23,201,100,0.2)",
    borderColor: campaignColors.neonGreen,
  },
};

/** @deprecated use greenButtonSx */
export const neonButtonSx = greenButtonSx;
