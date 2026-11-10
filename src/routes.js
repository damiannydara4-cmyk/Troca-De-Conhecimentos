/* Endereços de cada tela: um só lugar para consultar/alterar */
export const ROTAS = {
  inicio: "/",
  conhecimentos: "/conhecimentos",
  conhecimentoOferecido: "/conhecimento-oferecido",
  meusConhecimentos: "/meus-conhecimentos",
  minhasTrocas: "/minhas-trocas",
  conversas: "/conversas",
  conversa: "/conversas/:conversaId",
  contato: "/contato",
  mensagemEnviada: "/mensagem-enviada",
  login: "/login",
  cadastro: "/cadastro",
  recuperarSenha: "/recuperar-senha",
};

/* Endereço de UMA conversa: caminhoConversa("abc123") -> "/conversas/abc123" */
export const caminhoConversa = (id) => `${ROTAS.conversas}/${id}`;