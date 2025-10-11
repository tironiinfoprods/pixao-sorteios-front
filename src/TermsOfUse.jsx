// src/TermsOfUse.jsx
// Página de Termos de Uso para o Pixão na Mão (Tironi Tech - CNPJ 58.336.550/0001-66)

import * as React from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  IconButton,
  Link,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { useNavigate } from "react-router-dom";

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

export default function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate(-1)}>
            <ArrowBackIosNewRoundedIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 800, ml: 1 }}>Termos de Uso — Pixão na Mão</Typography>
          <Box sx={{ flex: 1 }} />
          <Button color="inherit" onClick={() => navigate("/")}>Início</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={3}>
          <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
            Termos de Uso
          </Typography>

          <Typography sx={{ opacity: 0.8 }}>
            Estes Termos de Uso regulam a utilização da plataforma{" "}
            <strong>Pixão na Mão</strong>{" "}
            (<Link href="http://pixaonamao.com.br/" target="_blank" rel="noopener" underline="hover">
              pixaonamao.com.br
            </Link>), mantida por <strong>Tironi Tech</strong>, inscrita no CNPJ sob nº{" "}
            <strong>58.336.550/0001-66</strong> (“<strong>Promotora</strong>”).
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Section
            n="1. Aceitação dos Termos"
            text={
              <>
                Ao utilizar a plataforma e adquirir um e-book, o usuário (“<strong>Subscritor</strong>”) declara estar ciente e
                de acordo que a aquisição implica:
                <br />
                <br />
                (i) adesão automática a todos os termos das <strong>Condições Gerais</strong> e do{" "}
                <strong>Regulamento do Título de Capitalização</strong>, aprovados em processo SUSEP e disponíveis para consulta no
                site da SUSEP (<Link href="https://www.susep.gov.br" target="_blank" rel="noopener" underline="hover">www.susep.gov.br</Link>);
                <br />
                (ii) ciência de que a participação nos sorteios ocorre por meio do referido título, estando os resultados
                vinculados ao plano aprovado pela sociedade de capitalização competente;
                <br />
                (iii) concordância integral com estes <strong>Termos de Uso</strong> e com a{" "}
                <strong>Política de Privacidade</strong> da plataforma.
              </>
            }
          />

          <Section
            n="2. Objeto"
            text={
              <>
                Este Termo regula o uso da plataforma <strong>Pixão na Mão</strong>, destinada à comercialização de{" "}
                <strong>E-books</strong> que, <em>conjuntamente</em>, viabilizam a participação do Subscritor em sorteios por meio de{" "}
                <strong>títulos de capitalização na modalidade incentivo</strong>, vinculados a processos autorizados pela SUSEP,
                em parceria com sociedade de capitalização habilitada.
              </>
            }
          />

          <Section
            n="3. Aquisição e Cessão de Direitos"
            text={
              <>
                Ao adquirir o e-book, o Subscritor recebe o direito, lastreado por título de capitalização, de concorrer aos sorteios
                previstos no regulamento. Somente será cedido ao consumidor o <strong>direito de participação</strong> nos sorteios,
                na forma e limites estabelecidos pela regulamentação do título e pela legislação aplicável.
              </>
            }
          />

          <Section
            n="4. Direitos de Imagem do Contemplado"
            text={
              <>
                O contemplado autoriza, de forma gratuita, o uso de seu <strong>nome, imagem e voz</strong> pelo período de até{" "}
                <strong>01 (um) ano</strong>, para divulgação da campanha em canais oficiais da Promotora, garantindo a lisura e
                transparência dos sorteios.
              </>
            }
          />

          <Section
            n="5. Sorteios e Premiação"
            text={
              <>
                Os sorteios serão realizados conforme os critérios previstos no regulamento do título e no respectivo processo SUSEP.
                As premiações serão pagas exclusivamente em <strong>moeda corrente nacional</strong>, preferencialmente via{" "}
                <strong>PIX</strong> ou transferência bancária, em <strong>conta de titularidade</strong> do contemplado.
                <br />
                <br />
                O prazo para pagamento da premiação é de até <strong>90 (noventa) dias</strong> após a data do sorteio. O prazo
                máximo para reivindicação é de <strong>90 (noventa) dias</strong>, após o qual ocorrerá a prescrição do direito.
              </>
            }
          />

          <Section
            n="6. Regras de Participação"
            text={
              <>
                • Somente <strong>pessoas físicas</strong>, maiores de <strong>16 anos</strong>, podem participar.
                <br />
                • É vedada a participação de dirigentes da sociedade de capitalização, da Promotora e de seus parentes até o 2º grau,
                bem como <strong>pessoas politicamente expostas (PPE)</strong>.
                <br />
                • O fornecimento de informações falsas, incompletas ou de terceiros resultará na <strong>exclusão automática</strong>{" "}
                do participante, sem prejuízo de responsabilização cível e criminal.
                <br />
                • A utilização de <strong>hacking, bots</strong> ou qualquer meio de fraude para aquisição de bilhetes e/ou obtenção
                de vantagem no sorteio acarretará exclusão e poderá ensejar responsabilização cível e criminal.
              </>
            }
          />

          <Section
            n="7. Obrigações da Plataforma"
            text={
              <>
                A Promotora (Tironi Tech) compromete-se a:
                <br />
                • cumprir rigorosamente as normas da <strong>SUSEP</strong> e demais circulares aplicáveis;
                <br />
                • garantir a <strong>transparência</strong> da campanha, com divulgação pública e, quando possível, transmissão ao vivo dos sorteios;
                <br />
                • preservar a <strong>privacidade</strong> dos dados dos usuários conforme a <strong>LGPD</strong>;
                <br />
                • suspender ou excluir cadastros <strong>fraudulentos</strong> ou em desconformidade com estes Termos.
              </>
            }
          />

          <Section
            n="8. Obrigações do Usuário"
            text={
              <>
                O usuário compromete-se a:
                <br />
                • fornecer <strong>dados verdadeiros</strong> e atualizados;
                <br />
                • utilizar a plataforma de forma <strong>lícita</strong> e de <strong>boa-fé</strong>;
                <br />
                • respeitar as regras estabelecidas na regulamentação SUSEP e nestes Termos.
              </>
            }
          />

          <Section
            n="9. Alterações"
            text={
              <>
                Estes Termos de Uso poderão ser <strong>alterados</strong> a qualquer momento, mediante publicação no site{" "}
                <Link href="http://pixaonamao.com.br/" target="_blank" rel="noopener" underline="hover">
                  pixaonamao.com.br
                </Link>. O uso continuado da plataforma representa a concordância com a nova versão.
              </>
            }
          />

          <Section
            n="10. Foro"
            text={
              <>
                Fica eleito o foro da <strong>Comarca de Ibaiti/PR</strong>, com renúncia de qualquer outro, por mais privilegiado que
                seja, para dirimir quaisquer dúvidas ou controvérsias decorrentes destes Termos.
              </>
            }
          />

          <Divider sx={{ my: 1 }} />

          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Promotora: <strong>Tironi Tech</strong> — CNPJ <strong>58.336.550/0001-66</strong> • Plataforma:{" "}
            <Link href="http://pixaonamao.com.br/" target="_blank" rel="noopener" underline="hover">
              pixaonamao.com.br
            </Link>
            <br />
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </Typography>
        </Stack>
      </Container>
    </ThemeProvider>
  );
}

function Section({ n, text }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
        {n}
      </Typography>
      <Typography sx={{ opacity: 0.9 }}>{text}</Typography>
    </Box>
  );
}
