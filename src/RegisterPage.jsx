// src/RegisterPage.jsx
import * as React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Button,
  Container,
  CssBaseline,
  Paper,
  Stack,
  TextField,
  Typography,
  ThemeProvider,
  createTheme,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Link,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#67C23A' },
    secondary: { main: '#FFC107' },
    error: { main: '#D32F2F' },
    background: { default: '#0E0E0E', paper: '#121212' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Arial'].join(','),
  },
});

/* ================= API helpers ================= */
const RAW =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_BASE_URL ||
  'https://newstore-backend.onrender.com';

const ROOT = String(RAW).replace(/\/+$/, '');
const API_BASE = /\/api$/i.test(ROOT) ? ROOT : `${ROOT}/api`;

function apiUrl(path) {
  let p = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE.endsWith('/api') && p.startsWith('/api/')) p = p.slice(4);
  return `${API_BASE}${p}`;
}

async function postJson(path, body) {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

async function registerRequest(payload) {
  // prioriza o novo /register
  const paths = ['/register', '/auth/register', '/users/register'];
  let lastErr;
  for (const p of paths) {
    try {
      return await postJson(p, payload);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Falha ao registrar');
}

/* ================= Utils & Validators ================= */
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(v).trim());
const digits = (v) => String(v || '').replace(/\D+/g, '');
const phoneOk = (v) => digits(v).length >= 10; // 10 ou 11 dígitos

function formatCpf(v) {
  const d = digits(v).slice(0, 11);
  const a = d.slice(0, 3);
  const b = d.slice(3, 6);
  const c = d.slice(6, 9);
  const e = d.slice(9, 11);
  let out = '';
  if (a) out = a;
  if (b) out += (out ? '.' : '') + b;
  if (c) out += (out ? '.' : '') + c;
  if (e) out += (out ? '-' : '') + e;
  return out;
}

// Validador de CPF (com dígitos repetidos inválidos)
function cpfOk(v) {
  const s = digits(v);
  if (s.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(s)) return false;
  const calc = (base) => {
    let sum = 0;
    for (let i = 0; i < base; i++) sum += parseInt(s[i], 10) * (base + 1 - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  const d1 = calc(9);
  const d2 = calc(10);
  return d1 === parseInt(s[9], 10) && d2 === parseInt(s[10], 10);
}

// >= 18 anos
function isAdult(birthISO) {
  if (!birthISO) return false;
  const d = new Date(birthISO);
  if (Number.isNaN(+d)) return false;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age >= 18;
}

/* ================== Modal Contents (Terms & Privacy) ================== */
function Section({ title, children }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography sx={{ opacity: 0.9 }}>{children}</Typography>
    </Box>
  );
}

function TermsContent() {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
        Termos de Uso — Pixão na Mão
      </Typography>
      <Typography sx={{ opacity: 0.8, mb: 2 }}>
        Estes Termos de Uso regulam a utilização da plataforma <strong>Pixão na Mão</strong> (mantida por
        <strong> Tironi Tech — CNPJ 58.336.550/0001-66</strong>).
      </Typography>

      <Divider sx={{ my: 1 }} />

      <Section title="1. Aceitação dos Termos">
        Ao adquirir um e-book, o usuário adere às <strong>Condições Gerais</strong> e ao Regulamento do Título
        de Capitalização (SUSEP), concordando integralmente com estes Termos e com a Política de Privacidade.
      </Section>

      <Section title="2. Objeto">
        A plataforma comercializa <strong>E-books</strong> que, em conjunto, viabilizam a participação em sorteios por
        <strong> títulos de capitalização — modalidade incentivo</strong>, vinculados a processos SUSEP.
      </Section>

      <Section title="3. Aquisição e Cessão de Direitos">
        A compra confere o <strong>direito de participação</strong> nos sorteios conforme regulamento do título e leis
        aplicáveis.
      </Section>

      <Section title="4. Direitos de Imagem do Contemplado">
        O contemplado autoriza o uso gratuito de <strong>nome, imagem e voz</strong> por até <strong>1 ano</strong>,
        para divulgação da campanha.
      </Section>

      <Section title="5. Sorteios e Premiação">
        Sorteios e pagamento de prêmios seguem o regulamento SUSEP; pagamento em <strong>moeda nacional</strong>,
        preferencialmente via <strong>PIX</strong>, em conta do titular. Prazo de pagamento: até
        <strong> 90 dias</strong> após o sorteio.
      </Section>

      <Section title="6. Regras de Participação">
        • Apenas <strong>pessoas físicas</strong>, maiores de <strong>16 anos</strong> • Vedada a participação de PPE e
        parentes de dirigentes • Dados falsos implicam <strong>exclusão</strong> • Fraudes/bots serão punidos.
      </Section>

      <Section title="7. Obrigações da Plataforma">
        Cumprir normas <strong>SUSEP</strong>, garantir <strong>transparência</strong>, proteger dados (LGPD) e coibir
        fraudes.
      </Section>

      <Section title="8. Obrigações do Usuário">
        Fornecer <strong>dados verdadeiros</strong>, agir com <strong>boa-fé</strong> e respeitar regulamentos.
      </Section>

      <Section title="9. Alterações">
        Estes Termos podem ser atualizados com publicação no site. O uso contínuo implica concordância.
      </Section>

      <Section title="10. Foro">
        Fica eleito o foro da <strong>Comarca de Ibaiti/PR</strong>.
      </Section>

      <Divider sx={{ my: 1 }} />
      <Typography variant="body2" sx={{ opacity: 0.75 }}>
        Última atualização: {new Date().toLocaleDateString('pt-BR')}
      </Typography>
    </Box>
  );
}

function PrivacyContent() {
  const COMPANY = {
    name: 'Tironi Tech',
    cnpj: '58.336.550/0001-66',
    brand: 'Pixão na Mão',
    site: 'https://pixaonamao.com.br',
    foro: 'Comarca de Ibaiti/PR',
  };
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
        Política de Privacidade — {COMPANY.brand}
      </Typography>
      <Typography sx={{ opacity: 0.8, mb: 2 }}>
        Esta Política descreve como a <strong>{COMPANY.name}</strong> (CNPJ <strong>{COMPANY.cnpj}</strong>)
        coleta, usa e trata dados pessoais, nos termos da <strong>LGPD</strong>.
      </Typography>

      <Divider sx={{ my: 1 }} />

      <Section title="1. Introdução">
        Aplica-se ao site <strong>{COMPANY.site}</strong> e canais oficiais do {COMPANY.brand}.
      </Section>

      <Section title="2. Informações Coletadas">
        Dados pessoais (nome, CPF, data de nascimento, e-mail, telefone), dados de uso (IP, páginas, navegador) e
        informações necessárias para pagamentos e segurança antifraude.
      </Section>

      <Section title="3. Uso das Informações">
        Administração de cadastros, comunicação operacional, segurança/fraude, cumprimento legal, melhorias de
        experiência e, quando aplicável, marketing com opt-out.
      </Section>

      <Section title="4. Compartilhamento">
        Com prestadores de serviço (pagamentos, infraestrutura, comunicação), e com autoridades quando exigido por lei.
      </Section>

      <Section title="5. Segurança">
        Medidas técnicas e organizacionais razoáveis. Nenhum método é 100% seguro.
      </Section>

      <Section title="6. Direitos do Titular (LGPD)">
        Acesso, correção, exclusão (quando cabível), informação sobre compartilhamentos, revogação de consentimento e
        revisão de decisões automatizadas, via canais do site.
      </Section>

      <Section title="7. Retenção">
        Manutenção de registros por prazos legais (ex.: mínimo 5 anos em prevenção à lavagem de dinheiro).
      </Section>

      <Section title="8. Cookies">
        Uso para funcionalidades e personalização; o usuário pode gerenciar no navegador (pode limitar recursos).
      </Section>

      <Section title="9. Alterações">
        Publicação de nova versão em {COMPANY.site}. Uso contínuo = concordância.
      </Section>

      <Divider sx={{ my: 1 }} />
      <Typography sx={{ opacity: 0.9 }}>
        <strong>Controladora:</strong> {COMPANY.name} — CNPJ {COMPANY.cnpj}
        <br />
        <strong>Marca/Plataforma:</strong> {COMPANY.brand} — {COMPANY.site}
        <br />
        <strong>Foro/Jurisdição:</strong> {COMPANY.foro}
      </Typography>
    </Box>
  );
}

/* ===================== Página ===================== */
export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birthdate: '',
    password: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const [openTerms, setOpenTerms] = React.useState(false);
  const [openPrivacy, setOpenPrivacy] = React.useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'cpf') {
      const masked = formatCpf(value);
      setForm((f) => ({ ...f, cpf: masked }));
    } else if (type === 'checkbox') {
      setForm((f) => ({ ...f, [name]: checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  function validateAll() {
    const err = {};
    if (!form.name.trim()) err.name = 'Informe seu nome completo.';
    if (!emailOk(form.email)) err.email = 'E-mail inválido.';
    if (!phoneOk(form.phone)) err.phone = 'Informe um telefone válido com DDD.';
    if (!cpfOk(form.cpf)) err.cpf = 'CPF inválido.';
    if (!form.birthdate) err.birthdate = 'Informe a data de nascimento.';
    else if (!isAdult(form.birthdate)) err.birthdate = 'É necessário ter 18 anos ou mais.';
    if (!form.password) err.password = 'Informe uma senha.';
    if (!form.acceptTerms) err.acceptTerms = 'É necessário aceitar os termos.';
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    try {
      const payload = {
        name: String(form.name || '').trim(),
        email: String(form.email || '').trim().toLowerCase(),
        phone: digits(form.phone),
        cpf: digits(form.cpf),
        birthdate: form.birthdate, // YYYY-MM-DD
        password: String(form.password || ''),
        acceptTerms: !!form.acceptTerms,
      };
      await registerRequest(payload);
      alert('Conta criada com sucesso! Agora faça login.');
      navigate('/login');
    } catch (err) {
      alert(err.message || 'Falha ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    form.name.trim() &&
    emailOk(form.email) &&
    phoneOk(form.phone) &&
    cpfOk(form.cpf) &&
    form.birthdate &&
    isAdult(form.birthdate) &&
    form.password &&
    form.acceptTerms &&
    !loading;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} aria-label="Voltar">
            <ArrowBackIosNewIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit">
            <AccountCircleRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, bgcolor: 'background.paper' }}>
          <Stack spacing={2}>
            <Typography variant="h4" fontWeight={800} textAlign="center">
              Criar conta
            </Typography>
            <Typography variant="body2" textAlign="center" sx={{ opacity: 0.8 }}>
              Use seus dados para acessar a área do cliente.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                <TextField
                  label="Nome completo"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name}
                />

                <TextField
                  label="E-mail"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  fullWidth
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                />

                <TextField
                  label="Celular (com DDD)"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="(11) 90000-0000"
                  inputMode="tel"
                  fullWidth
                  required
                  error={!!errors.phone}
                  helperText={errors.phone}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="CPF"
                    name="cpf"
                    value={form.cpf}
                    onChange={onChange}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    fullWidth
                    required
                    error={!!errors.cpf}
                    helperText={errors.cpf}
                  />
                  <TextField
                    label="Data de nascimento"
                    name="birthdate"
                    type="date"
                    value={form.birthdate}
                    onChange={onChange}
                    fullWidth
                    required
                    error={!!errors.birthdate}
                    helperText={errors.birthdate}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>

                <TextField
                  label="Senha"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  fullWidth
                  required
                  error={!!errors.password}
                  helperText={errors.password}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.acceptTerms}
                      onChange={onChange}
                      name="acceptTerms"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Li e aceito os{' '}
                      <Link component="button" type="button" onClick={() => setOpenTerms(true)}>
                        Termos de Uso
                      </Link>{' '}
                      e a{' '}
                      <Link component="button" type="button" onClick={() => setOpenPrivacy(true)}>
                        Política de Privacidade
                      </Link>
                      .
                    </Typography>
                  }
                />
                {errors.acceptTerms ? (
                  <Typography variant="caption" color="error">
                    {errors.acceptTerms}
                  </Typography>
                ) : null}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!canSubmit}
                  sx={{ py: 1.2, fontWeight: 700 }}
                >
                  {loading ? 'Criando...' : 'Criar conta'}
                </Button>

                <Button component={RouterLink} to="/login" variant="text" sx={{ fontWeight: 700 }}>
                  Já tenho conta — entrar
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>

      {/* Modal: Termos de Uso */}
      <Dialog open={openTerms} onClose={() => setOpenTerms(false)} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ fontWeight: 900 }}>Termos de Uso</DialogTitle>
        <DialogContent dividers sx={{ '& p': { mb: 1.5 } }}>
          <TermsContent />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenTerms(false)}>
            Fechar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenTerms(false);
              setForm((f) => ({ ...f, acceptTerms: true }));
            }}
          >
            Aceito os Termos
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Política de Privacidade */}
      <Dialog open={openPrivacy} onClose={() => setOpenPrivacy(false)} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ fontWeight: 900 }}>Política de Privacidade</DialogTitle>
        <DialogContent dividers sx={{ '& p': { mb: 1.5 } }}>
          <PrivacyContent />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenPrivacy(false)}>
            Fechar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenPrivacy(false);
              setForm((f) => ({ ...f, acceptTerms: true }));
            }}
          >
            Li e concordo
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
