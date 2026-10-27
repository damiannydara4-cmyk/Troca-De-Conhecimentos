import { tokenStorage } from "./tokenStorage.js";

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");

/* true = backend usa cookie HttpOnly; false = JWT no header Authorization */
export const USAR_COOKIE = import.meta.env.VITE_AUTH_COOKIE === "true";

export class ApiError extends Error {
  constructor(mensagem, status, dados) {
    super(mensagem);
    this.name = "ApiError";
    this.status = status;
    this.dados = dados;
  }
}

/* O AuthContext registra aqui o que fazer quando o servidor devolve 401
   numa rota autenticada (token expirado/inválido). */
let aoSessaoExpirar = null;
export function definirAoSessaoExpirar(fn) {
  aoSessaoExpirar = fn;
}

function mensagemPadrao(status) {
  if (status === 401) return "E-mail ou senha incorretos, ou sessão expirada.";
  if (status === 403) return "Você não tem permissão para isso.";
  if (status === 409) return "Este e-mail já está cadastrado.";
  if (status >= 500) return "Erro no servidor. Tente novamente em instantes.";
  return "Não foi possível concluir a ação.";
}

export async function api(caminho, { method = "GET", corpo, autenticado = true } = {}) {
  const headers = { Accept: "application/json" };
  if (corpo !== undefined) headers["Content-Type"] = "application/json";

  const token = tokenStorage.obter();
  if (autenticado && token && !USAR_COOKIE) headers.Authorization = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
      credentials: USAR_COOKIE ? "include" : "same-origin",
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor. Verifique sua conexão.", 0);
  }

  const texto = await resposta.text();
  let dados = null;
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = texto;
    }
  }

  if (!resposta.ok) {
    // 401 numa rota autenticada = sessão inválida. No login (autenticado:false) não dispara.
    if (resposta.status === 401 && autenticado) {
      tokenStorage.limpar();
      aoSessaoExpirar?.();
    }
    const doServidor =
      dados && typeof dados === "object" ? dados.mensagem || dados.message || dados.error : null;
    throw new ApiError(doServidor || mensagemPadrao(resposta.status), resposta.status, dados);
  }

  return dados;
}