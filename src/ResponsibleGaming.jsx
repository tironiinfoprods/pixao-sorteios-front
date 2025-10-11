// src/ResponsibleGaming.jsx
import * as React from "react";
import {
  AppBar,
  Box,
  Chip,
  Container,
  CssBaseline,
  Divider,
  Link as MLink,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  Button,
  createTheme,
} from "@mui/material";

import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ShieldMoonRoundedIcon from "@mui/icons-material/ShieldMoonRounded";
import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#2E7D32" },
    secondary: { main: "#FFC107" },
    background: { default: "#0E0E0E", paper: "#121212" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial"].join(","),
  },
});

const BRAND = {
  name: "Pixão na Mão",
  site: "https://pixaonamao.com.br",
  company: "Tironi Tech",
  cnpj: "58.336.550/0001-66",
};

export default function ResponsibleGaming() {
  const updatedAt = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Toolbar sx={{ minHeight: 64, gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.5 }}>
            Jogo Responsável — {BRAND.name}
          </Typography>
          <Chip
            size="small"
            color="secondary"
            label="18+"
            sx={{ ml: "auto", fontWeight: 800, letterSpacing: 0.3 }}
          />
          <Box sx={{ opacity: 0.7, fontSize: 14 }}>Atualizado em {updatedAt}</Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h3" sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 900, mb: 1 }}>
                Compromisso com o Jogo Responsável
              </Typography>
              <Typography sx={{ opacity: 0.85 }}>
                O <strong>{BRAND.name}</strong> está comprometido com práticas de jogo responsável e
                oferece orientações para que nossos clientes utilizem a plataforma de forma segura e
                consciente. <strong>Títulos de capitalização são produtos destinados a MAIORES DE 18 ANOS.</strong>
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                <ShieldMoonRoundedIcon fontSize="small" />
                Jogando de Forma Responsável
              </Typography>

              <List sx={{ py: 0 }}>
                <ListItem disableGutters sx={{ alignItems: "flex-start" }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>💰</ListItemIcon>
                  <ListItemText
                    primary={<strong>Defina um orçamento</strong>}
                    secondary="Determine quantos títulos você pode adquirir sem comprometer suas finanças."
                    secondaryTypographyProps={{ sx: { opacity: 0.85 } }}
                  />
                </ListItem>

                <ListItem disableGutters sx={{ alignItems: "flex-start" }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>😄</ListItemIcon>
                  <ListItemText
                    primary={<strong>Jogue por diversão</strong>}
                    secondary="O objetivo principal deve ser se divertir — não ganhar dinheiro a qualquer custo."
                    secondaryTypographyProps={{ sx: { opacity: 0.85 } }}
                  />
                </ListItem>

                <ListItem disableGutters sx={{ alignItems: "flex-start" }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>💡</ListItemIcon>
                  <ListItemText
                    primary={<strong>Faça apostas conscientes</strong>}
                    secondary="Leia as regras e probabilidades de cada título antes de investir."
                    secondaryTypographyProps={{ sx: { opacity: 0.85 } }}
                  />
                </ListItem>

                <ListItem disableGutters sx={{ alignItems: "flex-start" }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>😤</ListItemIcon>
                  <ListItemText
                    primary={<strong>Evite jogar sob estresse</strong>}
                    secondary="Se estiver emocionalmente abalado, aguarde. Decisões impulsivas aumentam riscos."
                    secondaryTypographyProps={{ sx: { opacity: 0.85 } }}
                  />
                </ListItem>

                <ListItem disableGutters sx={{ alignItems: "flex-start" }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>⏰</ListItemIcon>
                  <ListItemText
                    primary={<strong>Faça pausas regulares</strong>}
                    secondary="Descanse, afaste-se por um tempo e retorne somente quando estiver tranquilo."
                    secondaryTypographyProps={{ sx: { opacity: 0.85 } }}
                  />
                </ListItem>

                <ListItem disableGutters sx={{ alignItems: "flex-start" }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>🤝</ListItemIcon>
                  <ListItemText
                    primary={<strong>Busque ajuda se perder o controle</strong>}
                    secondary="Há recursos especializados para dependência em jogos. Você não está sozinho(a)."
                    secondaryTypographyProps={{ sx: { opacity: 0.85 } }}
                  />
                </ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                <RuleRoundedIcon fontSize="small" />
                Dicas rápidas de autocontrole
              </Typography>
              <Stack spacing={1}>
                <Typography sx={{ opacity: 0.85, display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleOutlineRoundedIcon fontSize="small" />
                  Estabeleça limites de gasto mensal e não os ultrapasse.
                </Typography>
                <Typography sx={{ opacity: 0.85, display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleOutlineRoundedIcon fontSize="small" />
                  Não tente “recuperar perdas” — volte outro dia, com calma.
                </Typography>
                <Typography sx={{ opacity: 0.85, display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleOutlineRoundedIcon fontSize="small" />
                  Desative notificações se elas aumentarem a impulsividade.
                </Typography>
                <Typography sx={{ opacity: 0.85, display: "flex", alignItems: "center", gap: 1 }}>
                  <PauseCircleOutlineRoundedIcon fontSize="small" />
                  Faça pausas programadas e use cronômetro para limitar sessões.
                </Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                <VolunteerActivismRoundedIcon fontSize="small" />
                Mais informações e ajuda
              </Typography>

              <Stack spacing={1.5}>
                <Typography sx={{ opacity: 0.85 }}>
                  • Instituto Brasileiro de Jogo Responsável (IBJR):{" "}
                  <MLink
                    href="https://ibjr.org/"
                    target="_blank"
                    rel="noopener"
                    underline="hover"
                    color="secondary"
                  >
                    https://ibjr.org/
                  </MLink>
                </Typography>

                <Typography sx={{ opacity: 0.85 }}>
                  • Encontre centros e grupos de tratamento para dependência em jogos:{" "}
                  <MLink
                    href="https://www.google.com/search?q=grupo+de+tratamento+de+dependentes+em+jogos"
                    target="_blank"
                    rel="noopener"
                    underline="hover"
                    color="secondary"
                  >
                    pesquisa no Google
                  </MLink>
                </Typography>
              </Stack>

              <Paper
                variant="outlined"
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "rgba(255,193,7,0.08)",
                  borderColor: "rgba(255,193,7,0.25)",
                }}
              >
                <Typography sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 700 }}>
                  <InfoOutlinedIcon fontSize="small" />
                  Aviso Importante
                </Typography>
                <Typography sx={{ opacity: 0.85, mt: 0.75 }}>
                  O jogo é uma forma de entretenimento. Resultados passados não garantem resultados futuros.
                  Se o jogo estiver causando prejuízo financeiro, emocional ou social, procure ajuda profissional.
                </Typography>
              </Paper>
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ opacity: 0.9 }}>
                <strong>Plataforma:</strong> {BRAND.name} — {BRAND.site}
                <br />
                <strong>Responsável:</strong> {BRAND.company} (CNPJ {BRAND.cnpj})
                <br />
                <strong>Idade mínima:</strong> 18 anos
              </Typography>

              <Stack direction="row" spacing={1.5} sx={{ mt: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  color="primary"
                  href={BRAND.site}
                  target="_blank"
                  rel="noopener"
                  sx={{ borderRadius: 999, px: 3 }}
                >
                  Acessar {BRAND.name}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  href="https://ibjr.org/"
                  target="_blank"
                  rel="noopener"
                  sx={{ borderRadius: 999, px: 3 }}
                >
                  IBJR
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
