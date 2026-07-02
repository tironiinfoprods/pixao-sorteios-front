// src/utils/registerErrors.js

const MESSAGES = {
  cpf_in_use:
    "Este CPF já está cadastrado. Faça login com o e-mail usado no cadastro ou clique em \"Esqueci minha senha\".",
  email_in_use:
    "Este e-mail já está cadastrado. Faça login ou use \"Esqueci minha senha\" para recuperar o acesso.",
  phone_in_use: "Este celular já está cadastrado em outra conta.",
  invalid_cpf: "CPF inválido. Verifique os números informados.",
  invalid_email: "E-mail inválido.",
  invalid_phone: "Telefone inválido. Informe DDD + número.",
  underage: "É necessário ter 18 anos ou mais para se cadastrar.",
  weak_password: "A senha deve ter pelo menos 6 caracteres.",
  terms_required: "É necessário aceitar os Termos de Uso.",
  register_failed: "Não foi possível criar a conta agora. Tente novamente em instantes.",
};

export function mapRegisterError(err) {
  const code = String(err?.code || err?.message || "").trim();
  if (MESSAGES[code]) return MESSAGES[code];
  if (err?.status === 409) return MESSAGES.cpf_in_use;
  if (err?.status === 400) return "Verifique os dados informados e tente novamente.";
  if (code && !/^[\w_]+$/.test(code)) return code;
  return MESSAGES.register_failed;
}

export function isDuplicateAccountError(err) {
  const code = String(err?.code || err?.message || "");
  return ["cpf_in_use", "email_in_use", "phone_in_use"].includes(code) || err?.status === 409;
}
