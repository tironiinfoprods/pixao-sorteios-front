// src/PrivacyPolicy.jsx
import * as React from "react";
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Paper,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
  Divider,
} from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#2E7D32" },
    background: { default: "#0E0E0E", paper: "#121212" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial"].join(","),
  },
});

const COMPANY = {
  name: "Tironi Tech",
  cnpj: "58.336.550/0001-66",
  brand: "Pixão na Mão",
  site: "https://pixaonamao.com.br",
  foro: "Comarca de Ibaiti/PR",
};

export default function PrivacyPolicy() {
  const updatedAt = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.5 }}>
            Política de Privacidade — {COMPANY.brand}
          </Typography>
          <Box sx={{ ml: "auto", opacity: 0.7, fontSize: 14 }}>
            Atualizado em {updatedAt}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h3" sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 900, mb: 1 }}>
                Política de Privacidade
              </Typography>
              <Typography sx={{ opacity: 0.8 }}>
                Esta Política de Privacidade explica como a{" "}
                <strong>{COMPANY.name}</strong> (CNPJ <strong>{COMPANY.cnpj}</strong>), responsável pela marca{" "}
                <strong>{COMPANY.brand}</strong> ({COMPANY.site}), realiza a coleta, o uso, o armazenamento
                e o tratamento de dados pessoais dos usuários.
              </Typography>
              <Typography sx={{ opacity: 0.8, mt: 1 }}>
                Ao utilizar as funcionalidades do site, o <strong>USUÁRIO</strong> declara ciência e concordância com
                os termos desta Política.
              </Typography>
              <Typography sx={{ opacity: 0.8, mt: 1 }}>
                Para fins da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 – LGPD), a{" "}
                <strong>{COMPANY.name}</strong> é a <strong>Controladora</strong> dos dados pessoais tratados conforme
                esta Política.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                1. Introdução
              </Typography>
              <Typography sx={{ opacity: 0.85 }}>
                Esta Política destina-se a informar sobre a coleta, uso, armazenamento e tratamento dos dados pessoais
                dos usuários que utilizam o site <strong>{COMPANY.site}</strong> e demais canais oficiais do{" "}
                <strong>{COMPANY.brand}</strong>.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                2. Informações Coletadas
              </Typography>
              <Typography sx={{ opacity: 0.85, mb: 1 }}>
                A depender do uso das funcionalidades, podemos coletar:
              </Typography>
              <Typography sx={{ opacity: 0.85 }}>
                <strong>Informações Pessoais:</strong> nome, CPF, data de nascimento, endereço, e-mail, telefone e
                dados financeiros necessários para processamento de pagamentos.
              </Typography>
              <Typography sx={{ opacity: 0.85, mt: 1 }}>
                <strong>Informações de Uso:</strong> endereço IP, tipo de navegador, páginas visitadas, tempos de
                acesso e histórico de navegação, para fins de segurança, prevenção a fraudes e melhoria da experiência.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                3. Uso das Informações
              </Typography>
              <Typography sx={{ opacity: 0.85 }}>
                Os dados poderão ser utilizados para:
              </Typography>
              <ul style={{ marginTop: 8, opacity: 0.85 }}>
                <li>Administrar cadastros, acessos e operações vinculadas às campanhas e ofertas;</li>
                <li>Detectar, prevenir e investigar incidentes de segurança, abusos e fraudes;</li>
                <li>
                  Ações de marketing, incluindo promoções, campanhas, programas, concursos e pesquisas de opinião (sempre
                  com possibilidade de opt-out quando aplicável);
                </li>
                <li>Comunicações operacionais sobre pedidos, avisos e notificações transacionais;</li>
                <li>Melhorar e personalizar a experiência do usuário no site e aplicativos;</li>
                <li>Compartilhar dados estritamente necessários com parceiros para prestação dos serviços associados;</li>
                <li>Cumprir obrigações legais, regulatórias e solicitações de autoridades.</li>
              </ul>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                4. Compartilhamento de Informações
              </Typography>
              <Typography sx={{ opacity: 0.85 }}>
                O acesso aos dados pessoais é restrito à equipe autorizada da <strong>{COMPANY.name}</strong>, podendo
                haver compartilhamento com terceiros estritamente para as finalidades previstas nesta Política:
              </Typography>
              <ul style={{ marginTop: 8, opacity: 0.85 }}>
                <li>
                  <strong>Prestadores de Serviços:</strong> processamento de pagamentos, infraestrutura tecnológica,
                  envio de comunicações e atendimento;
                </li>
                <li>
                  <strong>Autoridades Legais e Reguladoras:</strong> quando exigido por lei, ordem judicial ou para
                  resguardar direitos da Controladora e de terceiros.
                </li>
              </ul>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                5. Segurança das Informações
              </Typography>
              <Typography sx={{ opacity: 0.85 }}>
                Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados pessoais. No entanto, nenhum
                método de transmissão pela internet ou de armazenamento eletrônico é totalmente seguro; por isso, não é
                possível garantir segurança absoluta.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                6. Direitos dos Usuários (LGPD)
              </Typography>
              <Typography sx={{ opacity: 0.85 }}>
                Nos termos da LGPD, o usuário pode, mediante requisição:
              </Typography>
              <ul style={{ marginTop: 8, opacity: 0.85 }}>
                <li>Acessar os dados pessoais tratados;</li>
                <li>Solicitar correção de dados incompletos, inexatos ou desatualizados;</li>
                <li>Solicitar a exclusão de dados, quando cabível e sem prejuízo de obrigações legais de retenção;</li>
                <li>Solicitar informações sobre compartilhamentos e as entidades públicas/privadas envolvidas;</li>
                <li>Revogar consentimentos, quando o tratamento se basear nesta hipótese legal;</li>
                <li>Solicitar revisão de decisões automatizadas que afetem interesses do titular, quando aplicável.</li>
              </ul>
              <Typography sx={{ opacity: 0.75, mt: 1 }}>
                Para exercer direitos, utilize os canais oficiais indicados no site {COMPANY.site}.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                7. Prazos Legais de Retenção
              </Typography>
              <Typography sx={{ opacity: 0.85 }}>
                Por obrigações legais (incluindo LGPD, Marco Civil da Internet e legislação setorial), alguns registros
                devem ser mantidos por prazos mínimos. Em especial, nos termos do art. 9º, VI c/c art. 10, §2º, da Lei
                nº 9.613/1998 (prevenção à lavagem de dinheiro), determinadas informações podem ser mantidas por, no
                mínimo, 5 (cinco) anos.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                8. Cookies e Tecnologias Similares
              </Typography>
              <Typography sx={{ opacity: 0.85 }}>
                Utilizamos cookies e tecnologias semelhantes para melhorar funcionalidades, lembrar preferências e
                personalizar conteúdos. O usuário pode gerenciar cookies nas configurações do navegador; contudo, a
                desativação pode limitar recursos do site.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                9. Alterações a esta Política
              </Typography>
              <Typography sx={{ opacity: 0.85 }}>
                Esta Política de Privacidade pode ser atualizada a qualquer momento, com publicação da nova versão em{" "}
                {COMPANY.site}. O uso contínuo dos serviços após as alterações implica concordância com os termos
                atualizados.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ opacity: 0.9 }}>
                <strong>Controladora:</strong> {COMPANY.name} — CNPJ {COMPANY.cnpj}
                <br />
                <strong>Marca/Plataforma:</strong> {COMPANY.brand} — {COMPANY.site}
                <br />
                <strong>Foro/Jurisdição:</strong> {COMPANY.foro}
              </Typography>
              <Typography sx={{ opacity: 0.7, mt: 1 }}>
                Em caso de dúvidas sobre esta Política ou sobre o tratamento de dados pessoais, utilize os canais de
                contato disponibilizados no site.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
