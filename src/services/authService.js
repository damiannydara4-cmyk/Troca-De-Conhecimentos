import { api } from "./api.js";

/* Ajuste aqui se os endpoints do backend forem outros */
const ENDPOINTS = {
  login: "/auth/login",       // POST { email, senha } -> { token, usuario }
  cadastro: "/auth/register", // POST { nome, email, senha }
  perfil: "/auth/me",         // GET  (autenticado) -> { id, nome, email }
  logout: "/auth/logout",     // POST (só usado no modo cookie)
};

export const authService = {
  async login(email, senha) {
    const dados = await api(ENDPOINTS.login, {
      method: "POST",
      corpo: { email, senha },
      autenticado: false,
    });
    // Aceita { token } ou { accessToken } / { usuario } ou { user }
    return {
      token: dados?.token ?? dados?.accessToken ?? null,
      usuario: dados?.usuario ?? dados?.user ?? null,
    };
  },

  cadastrar({ nome, email, senha }) {
    return api(ENDPOINTS.cadastro, {
      method: "POST",
      corpo: { nome, email, senha },
      autenticado: false,
    });
  },

  perfil() {
    return api(ENDPOINTS.perfil);
  },

  logout() {
    return api(ENDPOINTS.logout, { method: "POST" });
  },
};