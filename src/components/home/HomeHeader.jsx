import * as React from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import logoNewStore from "../../Logo-branca-sem-fundo-768x132.png";
import { campaignColors, goldButtonSx } from "../../theme/campaignTheme";
import { trackEvent, AnalyticsEvents } from "../../utils/analytics";

export default function HomeHeader({
  isAuthenticated,
  menuEl,
  menuOpen,
  onOpenMenu,
  onCloseMenu,
  onGoConta,
  onGoLogin,
  onLogout,
  onScrollToPlans,
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const handleHeaderCta = () => {
    trackEvent(AnalyticsEvents.HERO_CTA);
    trackEvent(AnalyticsEvents.SCROLL_TO_PLANS);
    onScrollToPlans?.();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: `1px solid ${campaignColors.borderNeon}`,
        bgcolor: "rgba(3,7,3,0.96)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1.25, sm: 2, md: 3 },
          gap: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          component={RouterLink}
          to={isAuthenticated ? "/conta" : "/"}
          onClick={(e) => {
            e.preventDefault();
            navigate(isAuthenticated ? "/conta" : "/");
          }}
          sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <Box
            component="img"
            src={logoNewStore}
            alt="Pixão na Mão"
            sx={{
              height: { xs: 44, sm: 52, md: 58 },
              maxWidth: { xs: 140, sm: 200, md: 220 },
              objectFit: "contain",
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
          {isDesktop ? (
            <Button
              variant="contained"
              size="small"
              onClick={handleHeaderCta}
              sx={{ ...goldButtonSx, py: 0.75, px: 2, fontSize: "0.85rem", mr: 1 }}
            >
              Escolher números
            </Button>
          ) : null}
          {!isAuthenticated ? (
            <Button
              component={RouterLink}
              to="/cadastro"
              variant="text"
              size="small"
              sx={{
                fontWeight: 700,
                color: campaignColors.textSecondary,
                fontSize: "0.75rem",
                minWidth: 0,
                display: { xs: "none", sm: "inline-flex" },
              }}
            >
              Criar conta
            </Button>
          ) : null}
          <IconButton color="inherit" onClick={onOpenMenu} aria-label="Conta">
            <AccountCircleRoundedIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>

        <Menu anchorEl={menuEl} open={menuOpen} onClose={onCloseMenu}>
          {isAuthenticated ? (
            [
              <MenuItem key="conta" onClick={onGoConta}>
                Área do cliente
              </MenuItem>,
              <Divider key="div" />,
              <MenuItem key="sair" onClick={onLogout}>
                Sair
              </MenuItem>,
            ]
          ) : (
            [
              <MenuItem key="login" onClick={onGoLogin}>
                Entrar
              </MenuItem>,
              <MenuItem key="cadastro" component={RouterLink} to="/cadastro" onClick={onCloseMenu}>
                Criar conta
              </MenuItem>,
            ]
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
