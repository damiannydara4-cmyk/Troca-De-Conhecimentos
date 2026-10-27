import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService.js";
import { definirAoSessaoExpirar, USAR_COOKIE } from "../services/api.js";
import { tokenStorage } from "../services/tokenStorage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true); // true enquanto confirma a sessão ao abrir o site


  //Se há token guardado, chama /auth/me para confirmar que ele ainda vale e preencher o usuário.
  //Se não há token, termina o carregamento na hora.
   //A variável ativo impede atualizar estado depois que o componente foi desmontado.
  // Ao abrir/recarregar: se há token (ou cookie), pergunta ao servidor quem é o usuário
  useEffect(() => {
    let ativo = true;
    definirAoSessaoExpirar(() => setUsuario(null));

    async function restaurar() {
      if (!USAR_COOKIE && !tokenStorage.obter()) {
        setCarregando(false);
        return;
      }
      try {
        const dados = await authService.perfil();
        if (ativo) setUsuario(dados);
      } catch {
        if (ativo) setUsuario(null);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    restaurar();
    return () => {
      ativo = false;
    };
  }, []);

  //chama o login, salva o token e guarda o usuário no estado. Se o login não devolver o usuário, busca em /auth/me.
  const entrar = useCallback(async (email, senha) => {
    const { token, usuario: dadosUsuario } = await authService.login(email, senha);
    if (!USAR_COOKIE) {
      if (!token) throw new Error("O servidor não devolveu o token de acesso.");
      tokenStorage.salvar(token);
    }
    setUsuario(dadosUsuario ?? (await authService.perfil()));
  }, []);

  //apaga o token e zera o usuário. No modo cookie, avisa o backend para apagar o cookie.
  const sair = useCallback(async () => {
    if (USAR_COOKIE) {
      try {
        await authService.logout(); // o backend apaga o cookie
      } catch {
        /* mesmo com erro, encerra a sessão local */
      }
    }
    tokenStorage.limpar();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, autenticado: Boolean(usuario), carregando, entrar, sair }),
    [usuario, carregando, entrar, sair]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return ctx;
}