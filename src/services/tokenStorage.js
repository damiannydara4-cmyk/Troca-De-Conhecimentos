const CHAVE = "bt_token";

export const tokenStorage = {
  obter() {
    try {
      return localStorage.getItem(CHAVE);
    } catch {
      return null;
    }
  },
  salvar(token) {
    try {
      localStorage.setItem(CHAVE, token);
    } catch {
      /* navegador bloqueou o storage: a sessão dura só até recarregar */
    }
  },
  limpar() {
    try {
      localStorage.removeItem(CHAVE);
    } catch {
      /* ignora */
    }
  },
};