/* Validações simples usadas nas telas de cadastro e login.
   Cada função devolve uma mensagem de erro (string) ou null se estiver tudo certo. */

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarNome(nome) {
  const limpo = (nome || "").trim();
  if (limpo.length < 2) return "Informe seu nome completo.";
  if (limpo.length > 80) return "O nome pode ter no máximo 80 caracteres.";
  return null;
}

export function validarEmail(email) {
  const limpo = (email || "").trim();
  if (!limpo) return "Informe seu e-mail.";
  if (!REGEX_EMAIL.test(limpo)) return "Digite um e-mail válido, como seu@email.com.";
  return null;
}

export function validarSenha(senha) {
  if (!senha) return "Informe uma senha.";
  if (senha.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  if (!/[A-Za-z]/.test(senha) || !/[0-9]/.test(senha)) {
    return "Use letras e números na senha.";
  }
  return null;
}

/* Valida o formulário inteiro de cadastro e devolve { campo: mensagem }.
   Objeto vazio = tudo válido. */
export function validarCadastro({ nome, email, senha, confirmarSenha }) {
  const erros = {};
  const erroNome = validarNome(nome);
  const erroEmail = validarEmail(email);
  const erroSenha = validarSenha(senha);
  if (erroNome) erros.nome = erroNome;
  if (erroEmail) erros.email = erroEmail;
  if (erroSenha) erros.senha = erroSenha;
  if (!erroSenha && senha !== confirmarSenha) erros.confirmarSenha = "As senhas não coincidem.";
  return erros;
}