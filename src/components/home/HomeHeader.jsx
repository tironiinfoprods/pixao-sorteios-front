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
} from "@mui/material";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import logoNewStore from "../../Logo-branca-sem-fundo-768x132.png";
import { campaignColors } from "../../theme/campaignTheme";

export default function HomeHeader({
  isAuthenticated,
  menuEl,
  menuOpen,
  onOpenMenu,
  onCloseMenu,
  onGoConta,
  onGoLogin,
  onLogout,
}) {
  const navigate = useNavigate();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: `1px solid ${campaignColors.borderNeon}`,
        bgcolor: "rgba(5,8,5,0.92)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Toolbar sx={{ position: "relative", minHeight: { xs: 56, sm: 64 } }}>
        <IconButton edge="start" color="inherit" aria-label="Menu" sx={{ visibility: "hidden", width: 40 }} />

        <Button
          component={RouterLink}
          to="/cadastro"
          variant="text"
          sx={{ fontWeight: 700, color: "primary.main", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
        >
          Criar conta
        </Button>

        <Box
          component={RouterLink}
          to={isAuthenticated ? "/conta" : "/"}
          onClick={(e) => {
            e.preventDefault();
            navigate(isAuthenticated ? "/conta" : "/");
          }}
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src={logoNewStore}
            alt="Pixão na Mão"
            sx={{ height: { xs: 56, sm: 72 }, objectFit: "contain" }}
          />
        </Box>

        <IconButton color="inherit" sx={{ ml: "auto" }} onClick={onOpenMenu} aria-label="Conta">
          <AccountCircleRoundedIcon />
        </IconButton>
        <Menu
          anchorEl={menuEl}
          open={menuOpen}
          onClose={onCloseMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
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
            <MenuItem onClick={onGoLogin}>Entrar</MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
